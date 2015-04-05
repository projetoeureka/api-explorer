function ServerList(serverList) {
  this._servers = [];
  this._initDone = false;
  
  this.init = function() {
    chrome.storage.sync.get("serverList", function(items) {
      if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError);
        return;
      }
      items.servers = items.servers || [];
      this._servers = items.servers.map(function(server) { 
        return new Server(server); 
      });
    });
  };
}


var serverList = new ServerList();