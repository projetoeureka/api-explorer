function ServerList(serverList) {
  this._servers = [];
  this._initDone = false;
  this._initCallbacks = [];
  
  this.init = function() {
    var list = this;
    
    $.ajax({
      url: "https://geekie.s3.amazonaws.com/api-explorer/directory.json",
      type: "GET",
      dataType: "json",
      success: function(apiDirectory) {
        window.apiDirectory = apiDirectory;
        apiDirectory.forEach(function(api) { apiDirectory[api.id] = api; });
        chrome.storage.sync.get(["serverList"], function(items) {
          items.serverList = items.serverList || [];
          if (!items.serverList.length) {
            items.serverList.push(new Server({url: "http://api.geekielab.com.br/"}));
          }
          list._servers = items.serverList.map(function(server) { 
            return new Server(server); 
          });
          list._initDone = true;
          list._initCallbacks.forEach(function(callback) {
            callback(list._servers);
          });
        });   
      }
    });
  };
  
  this.whenServerListAvailable = function(callback) {
    if (this._initDone) {
      callback(this._servers);
    } else {
      this._initCallbacks.push(callback);
    }
  };
  
  this.addServer = function(server) {
    this._servers.push(server);
    return server;
  };
  
  this.save = function() {
    chrome.storage.sync.set({"serverList": this._servers.map(function(server) {
      return server.toJson();
    })});
  };
  
  this.getServer = function(url) {
    var servers = this._servers.filter(function(server) {
      return server.url.startsWith(url) || url.startsWith(server.url);
    });
    if (servers.length) {
      return servers[0];
    }
    return null;
  };
  
  this.alreadyHas = function(url) {
    return !!this.getServer(url); 
  };
}

  
ServerList.identifyServer = function(serverUri) {
  if (!serverUri.endsWith("/")) {
    serverUri += "/";
  }
  
  var validPattern = /https?:\/\/[a-z-.]+(:\d{2,5})?\/(api\/(v\d\/)?)?/;
  if (!validPattern.test(serverUri)) {
    return {ok: false};
  }
  
  var matchingApis = apiDirectory.filter(function(api) {
    return api.knownServers.indexOf(serverUri) >= 0;
  });
  
  if (matchingApis.length == 1) {
    return {ok: true, api: matchingApis[0].id};
  } else {
    return {ok: true, api: undefined};
  }
};

ServerList.getApiDisplayName = function(api) {
  return apiDirectory[api].displayName || "<API desconhecida>";
};

function Server(options) {
  var info = ServerList.identifyServer(options.url);
  var server = this;
  
  this.url = options.url;
  if (!this.url.endsWith("/")) {
    this.url += "/";
  }
  this.apiKeys = options.apiKeys || [];
  
  this.api = info.api;
  this.signatureMethod = info.signatureMethod;
  this.requestHistory = [];
  chrome.storage.local.get([server.url + "_history"], function(items) {
    server.requestHistory = items[server.url + "_history"] || [];
  });
  
  this.toJson = function() {
    return {url: this.url, apiKeys: this.apiKeys};
  };

  this.getSigningFunction = function(request, userInputService, callback) {
    if (this.api == "swag" && (
      request.path_qs.startsWith("/api/v1") || request.path_qs.startsWith("/api/v2"))
    ) {
      return this.getApiKey({
        "kind": "logged-user",
        scope: {},
        scopeUrlPrefix: this.url + "*",
        userInputService: userInputService,
        callback: function(apiKey) {
          callback(LoggedUserAuth(apiKey));
        }
      });
    }
    
    if (this.api != "extapi") {
      return this.getApiKey({
        kind: "geekie-sign-v1", 
        scope: {},
        scopeUrlPrefix: this.url + "*",
        userInputService: userInputService,
        callback: function(apiKey) {
          callback(GeekieSignV1(apiKey));
        }
      });
    }
    else {
      var organizationInfo = /^\/organizations\/(\d+)\//.exec(request.path_qs);
      if (!organizationInfo) {
        return callback(NoSignature());
      }
      
      return this.getApiKey({
        kind: "geekie-sign-v2", 
        scope: {organization_id: organizationInfo[1]},
        scopeUrlPrefix: this.url + "organizations/"+ organizationInfo[1] + "/*",
        userInputService: userInputService,
        callback: function(apiKey) {
          callback(GeekieSignV2(apiKey));
        }
      });
    }
  };

  this.getApiKey = function(options) {
    var matchingKey = this.matchingApiKey(options);
    
    if (matchingKey) {
      return options.callback(matchingKey);
    }
    
    options.userInputService.getApiKeyCredentials(options, function(credentials) {
      var apiKey = {
        kind: options.kind,
        scope: options.scope,
        credentials: credentials
      };
  
      this.apiKeys.push(apiKey);
      window.serverList.save();
      options.callback(apiKey);    
    }.bind(this));
  };
  
  this.matchingApiKey = function(options) {
    console.log(options);
    var matchingKeys = this.apiKeys.filter(function(apiKey) {
      console.log("match kind=" + options.kind);
      if (apiKey.kind != options.kind) {
        return false;
      } 
      for (var key in options.scope) {
        console.log("match scope" + key + "=" + options.scope[key]);
        if (apiKey.scope[key] != options.scope[key]) {
          return false;
        }
      }
      return true;
    });
    
    if (matchingKeys.length) {
      return matchingKeys[0];
    }
    
    return null;
  };

  this.eraseAuthInfo = function(request) {
    if (this.api == "swag" && (
      request.path_qs.startsWith("/api/v1") || request.path_qs.startsWith("/api/v2"))
    ) {
      return this.eraseApiKey({
        kind: "logged-user",
        scope: {}
      });
    }
    
    if (this.api != "extapi") {
      return this.eraseApiKey({
        kind: "geekie-sign-v1", 
        scope: {},
      });
    }
    else {
      var organizationInfo = /^\/organizations\/(\d+)\//.exec(request.path_qs);
      if (!organizationInfo) {
        return;
      }
      
      return this.eraseApiKey({
        kind: "geekie-sign-v2", 
        scope: {organization_id: organizationInfo[1]},
      });
    }
  };
  
  this.eraseApiKey = function(options) {
    var matchingKey = this.matchingApiKey(options);
    
    if (matchingKey) {
      this.apiKeys.splice(this.apiKeys.indexOf(matchingKey), 1);
      window.serverList.save();
    }
  };
  
  this.send = function(request, callback) {
    
    // set default content-type
    var isJson = false;
    try {
      JSON.parse(request.body);
      isJson = true;
    } catch(e) {}
    
    var hasContentHeaderSet = false;
    Object.keys(request.headers).forEach(function(headerName) {
      if (headerName.toLowerCase() == "content-type") {
        hasContentHeaderSet = true;
      }
    });
    
    if (isJson && !hasContentHeaderSet) {
      request.autoHeaders["Content-Type"] = "application/json";
    }
    
    var timestamp = new Date();
    var server = this;
    
    $.ajax({
      type: request.method,
      headers: $.extend({}, request.autoHeaders, request.headers),
      url: request.url,
      data: request.body,
      complete: function(jqXhr) {
        server.addHistoryEntry({
          method: request.method,
          url: request.path_qs,
          timestamp: timestamp.getTime(),
          headers: request.headers,
          body: request.body
        });
        
        callback({
          statusLine: jqXhr.status + " " + jqXhr.statusText,
          headers: jqXhr.getAllResponseHeaders(),
          body: jqXhr.responseText
        });
      }
    });
  };
  
  this.addHistoryEntry = function(entry) {
    var key = this.url + "_history";
    var server = this;
    
    chrome.storage.local.get([key], function(info) {
      server.requestHistory = info[key] || server.requestHistory;
      server.requestHistory.unshift(entry);
      info[key] = server.requestHistory;
      chrome.storage.local.set(info);
    });
  };
  
  this.getEndpoints = function(query) {
    var endpointsList = apiDirectory[this.api].endpoints.slice();
    
    // merge history
    var keys = {};
    endpointsList.forEach(function(endpoint) {
      keys[endpoint.method + " " + endpoint.url] = true;
    });
    
    this.requestHistory.forEach(function(entry) {
      var key = entry.method + " " + entry.url;
      if (!keys.hasOwnProperty(key)) {
        keys[key] = true;
        endpointsList.push(entry);
      }
    });
    
    var matches = [];
    var method = /^GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS/i.exec(query);
    if (method) {
      method = method[0].toUpperCase();
      query = query.substring(method.length + 1);
      endpointsList = endpointsList.filter(function(endpoint) {
        return endpoint.method == method;
      });
    }
    
    var path = query;
    if (path.startsWith("/")) {
      path = path.substring(1);
    }
    if (path.endsWith("/")) {
      path = path.substring(0, path.length - 1);
    }
    
    endpointsList.forEach(function(endpoint) {
      if (!path || endpoint.url.indexOf(path) >= 0) {
        return matches.push({url: endpoint.method + " " + endpoint.url, 
                             description: endpoint.description});
      }
      
      var queryParts = path.split("/");
      var myParts = endpoint.url.substring(1).split("/");
      var matchedParts = [];
      
      if (queryParts.length > myParts.length) {
        return;
      }
      
      for (var i = 0; i < queryParts.length; ++i) {
        if (!queryParts[i].length) {
          return;
        }
        if (queryParts[i] == myParts[i]) {
          matchedParts.push(queryParts[i]);
        }
        else if (myParts[i].startsWith(":")) {
          if (queryParts[i].length > 0) {
            matchedParts.push(queryParts[i]);
          } else {
            return;
          }
        }
        else if (myParts[i].startsWith(queryParts[i]) && i == queryParts.length - 1) {
          matchedParts.push(queryParts[i]);
        } else {
          return;
        }
      }
      
      for (; i < myParts.length; ++i) {
        matchedParts.push(myParts[i]);
      }
      
      return matches.push({
        url: endpoint.method + " /" + matchedParts.join("/"),
        description: endpoint.description
      });
    });
    
    return matches;
  };
}

var serverList = new ServerList();
serverList.init();