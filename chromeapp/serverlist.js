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
  
  this.url = options.url;
  if (!this.url.endsWith("/")) {
    this.url += "/";
  }
  this.apiKeys = options.apiKeys || [];
  
  this.api = info.api;
  this.signatureMethod = info.signatureMethod;
  
  this.toJson = function() {
    return {url: this.url, apiKeys: this.apiKeys};
  };

  this.getSigningFunction = function(request, userInputService, callback) {
    if (this.api == "swag" && (
      request.path_qs.startsWith("/api/v1") || request.path_qs.startsWith("/api/v2"))
    ) {
      return callback(NoSignature());
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
          callback(GeekieSignV1(apiKey));
        }
      });
    }
  };
  
  this.getApiKey = function(options) {
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
      return options.callback(matchingKeys[0]);
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
  
  this.send = function(request, callback) {
    $.ajax({
      type: request.method,
      headers: request.headers,
      url: request.url,
      complete: function(jqXhr) {
        callback({
          statusLine: "HTTP " + jqXhr.status + " " + jqXhr.statusText,
          headers: jqXhr.getAllResponseHeaders(),
          body: jqXhr.responseText
        });
      }
    });
  };
}

var serverList = new ServerList();
serverList.init();