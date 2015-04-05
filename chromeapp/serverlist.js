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
    chrome.storage.sync.set({"serverList": this._servers.map(function(server) {
      return server.toJson();
    })});
    return server;
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
  this.apiKeys = options.apiKeys || [];
  
  this.api = info.api;
  this.signatureMethod = info.signatureMethod;
  
  this.toJson = function() {
    return {url: this.url, apiKeys: this.apiKeys};
  };

  this.getSigningFunction = function(request, callback) {
    callback({
      sign: function(request) {}
    });
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