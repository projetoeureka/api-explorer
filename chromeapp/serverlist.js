function ServerList(serverList) {
  this._servers = [];
  this._initDone = false;
  this._initCallbacks = [];
  
  this.init = function() {
    chrome.storage.sync.get(["serverList"], function(items) {
      if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError);
        return;
      }
      items.serverList = items.serverList || [];
      if (!items.serverList.length) {
        items.serverList.push(new Server({url: "http://api.geekielab.com.br/"}));
      }
      this._servers = items.serverList.map(function(server) { 
        return new Server(server); 
      });
      this._initDone = true;
      this._initCallbacks.forEach(function(callback) {
        callback(this._servers);
      }.bind(this));
    }.bind(this));
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
  
  externalApiUris = [
    "http://api.geekielab.com.br/",
    "http://geekielab-api.herokuapp.com/",
    "http://geekielab-api-canary.herokuapp.com/",
    "http://geekielab-api-staging.herokuapp.com/",
    "http://geekielab-api-latest.herokuapp.com/",
  ];
  
  swagUris = [
    "http://www.geekielab.com.br/",
    "http://geekieid.herokuapp.com/",
    "http://geekieid-staging.herokuapp.com/",
    "http://geekieid-canary.herokuapp.com/",
    "http://geekieid-latest.herokuapp.com/"
  ];
  
  if (externalApiUris.indexOf(serverUri) >= 0) {
    return {ok: true, signatureMethod: "geekie-sign-v2", api: "extapi"};
  } else if (swagUris.indexOf(serverUri) >= 0) {
    return {ok: true, signatureMethod: "geekie-sign-v1", api: "swag"};
  } else {
    return {ok: true, signatureMethod: "geekie-sign-v1", api: undefined};
  }
};

ServerList.getApiDisplayName = function(api) {
  return {extapi: "API GeekieLab", swag: "swag"}[api];
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
  chrome.storage.sync.get([server.url + "_history"], function(items) {
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
          beginLoggedUserAuth(apiKey, callback);
        }
      });
    }
    
    if (this.signatureMethod == "geekie-sign-v1") {
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
    else if (this.signatureMethod == "geekie-sign-v2") {
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
    var matchingKeys = this.apiKeys.filter(function(apiKey) {
      if (apiKey.kind != options.kind) {
        return false;
      } 
      for (var key in Object.keys(options.scope)) {
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
      return;
    }
    
    if (this.signatureMethod == "geekie-sign-v1") {
      return this.eraseApiKey({
        kind: "geekie-sign-v1", 
        scope: {},
      });
    }
    else if (this.signatureMethod == "geekie-sign-v2") {
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
          statusLine: "HTTP " + jqXhr.status + " " + jqXhr.statusText,
          headers: jqXhr.getAllResponseHeaders(),
          body: jqXhr.responseText
        });
      }
    });
  };
  
  this.addHistoryEntry = function(entry) {
    var key = this.url + "_history";
    var server = this;
    
    chrome.storage.sync.get([key], function(info) {
      server.requestHistory = info[key] || server.requestHistory;
      server.requestHistory.unshift(entry);
      info[key] = server.requestHistory;
      chrome.storage.sync.set(info);
    });
  };
  
  this.getEndpoints = function(query) {
    var endpointsList;
    
    if (this.api == "extapi") {
      endpointsList = [{
        url: "/organizations/:organizationId/members",
        method: "POST",
        description: "Cadastra um novo usuário (membro)"
      }, {
        url: "/organizations/:organizationId/members/:memberId",
        method: "PUT",
        description: "Atualiza usuário (membro)"
      }, {
        url: "/organizations/:organizationId/members/:memberId",
        method: "GET",
        description: "Obtém um usuário (membro) por id"
      }, {
        url: "/organizations/:organizationId/members/list",
        method: "GET",
        description: "Lista usuários da organização com paginação"
      }, {
        url: "/organizations/:organizationId/tagkinds",
        method: "GET",
        description: "Obtém lista de tag kinds"
      }, {
        url: "/organizations/:organizationId/tags/:tagId",
        method: "GET",
        description: "Obtem uma tag por ID"
      }, {
        url: "/organizations/:organizationId/tagKinds/:kindId/tags/search?name=",
        method: "GET",
        description: "Obtem uma tag por nome e tipo de tag"
      }, {
        url: "/organizations/:organizationId/tagkinds/:kindId/tags",
        method: "POST",
        description: "Cria uma tag"
      }, {
        url: "/organizations/:organizationId/tags/:tagId",
        method: "DELETE",
        description: "Remove uma tag"
      }, {
        url: "/organizations/:organizationId/members/:memberId/exams/:examId/answers",
        method: "PUT",
        description: "Envia/atualiza respostas de uma prova feita offline"
      }];
    } else {
      endpointsList = [];
    }
    
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
    
    console.log(this.requestHistory);
    
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
    console.log(path);
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
    
    console.log(matches);
    return matches;
  };
}

var serverList = new ServerList();
serverList.init();