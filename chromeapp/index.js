function main(storageInfo) {
  var inputHttpEditor = ace.edit("input-http-editor");
  inputHttpEditor.setTheme("ace/theme/chrome");
  inputHttpEditor.setOptions({maxLines: 20});
  inputHttpEditor.getSession().setUseWrapMode(true);

  var inputBodyEditor = ace.edit("input-body-editor");
  inputBodyEditor.setTheme("ace/theme/chrome");
  inputBodyEditor.setOptions({maxLines: 1000});
  inputBodyEditor.getSession().setMode("ace/mode/json");
  inputBodyEditor.getSession().setUseWrapMode(true);
  
  var outputHttpEditor = ace.edit("output-http-editor");
  outputHttpEditor.setTheme("ace/theme/monokai");
  outputHttpEditor.setReadOnly(true);
  outputHttpEditor.setOptions({maxLines: 20, showPrintMargin: false});
  outputHttpEditor.getSession().setUseWrapMode(true);
  
  var outputBodyEditor = ace.edit("output-body-editor");
  outputBodyEditor.setTheme("ace/theme/monokai");
  outputBodyEditor.setReadOnly(true);
  outputBodyEditor.setOptions({maxLines: Infinity, showPrintMargin: false});
  outputBodyEditor.getSession().setUseWorker(false);
  outputBodyEditor.getSession().setMode("ace/mode/json");
  outputBodyEditor.getSession().setUseWrapMode(true);
  
  var editors = [inputHttpEditor, inputBodyEditor, outputHttpEditor, outputBodyEditor];
  
  editors.forEach(function(editor) {
    editor.on("change", function saveServerState() {
      if (window.maySaveServerState) {
        var info = {};
        info[serverSelect.getValue()] = {
          inputHttpEditor: inputHttpEditor.getValue(),
          inputBodyEditor: inputBodyEditor.getValue(),
          outputHttpEditor: outputHttpEditor.getValue(),
          outputBodyEditor: outputBodyEditor.getValue()
        };
        storageInfo[serverSelect.getValue()] = info[serverSelect.getValue()];
        chrome.storage.local.set(info);
        console.log("wrote", serverSelect.getValue());
      }
    });
  });
  
  $("#input-editor").resizable({
    handles: "e",
    autoHide: false,
    minWidth: 200,
    maxWidth: 1000,
    stop: function(event, ui) {
      var outputEditor = $(this).next();
      outputEditor.css("left", $(this).outerWidth(true) + "px");
      
      editors.forEach(function(editor) {
        editor.resize();
      });
    }
  });
  
  window.serverList.whenServerListAvailable(function(serverList) {
    var $select = $("#server-host").selectize({
      valueField: "url",
      labelField: "url",
      searchField: "url",
      options: serverList,
      render: {
        item: function(item, escape) {
          return "<div class='server-item'><span class='api'>" + (
            item.api ? escape(ServerList.getApiDisplayName(item.api)) :
            escape("<API desconhecida>")
          ) + "</span>\n<span class='url'>" + escape(item.url) + "</span></div>";
        },
        option: function(item, escape) {
          return "<div class='server-option'><span class='api'>" + (
            item.api ? escape(ServerList.getApiDisplayName(item.api)) :
            escape("<API desconhecida>")
          ) + "</span>\n<span class='url'>" + escape(item.url) + "</span></div>";
        }
      },
      createFilter: function(url) {
        info = ServerList.identifyServer(url);
        if (!info.ok) {
          return false;
        }
       
        return !window.serverList.alreadyHas(url);
      },
      create: function(url) {
        info = ServerList.identifyServer(url);
        if (!info.ok) {
          window.alert("URL inválida");
        }
        if (info.signatureMethod == "geekie-sign-v1") {
          return window.serverList.addServer(new Server({url: url}));
        } else if (info.signatureMethod == "geekie-sign-v2") {
          return window.serverList.addServer(new Server({url: url}));
        } else {
          window.alert("Tipo de autenticação não suportado por esse app");
        }
        return false;
      },
      onChange: function(value) {
        window.maySaveServerState = false;
        
        var serverState = storageInfo[value] || {
          inputHttpEditor: "GET /path/to/endpoint\n\nAccept: */*",
          inputBodyEditor: "{}",
          outputHttpEditor: "",
          outputBodyEditor: ""
        };
        
        inputHttpEditor.setValue(serverState.inputHttpEditor, -1);
        inputBodyEditor.setValue(serverState.inputBodyEditor, -1);
        outputHttpEditor.setValue(serverState.outputHttpEditor, -1);
        outputBodyEditor.setValue(serverState.outputBodyEditor, -1);
        
        chrome.storage.local.set({lastServer: value});
        window.maySaveServerState = true;
      }
    });
    
    window.serverSelect = $select[0].selectize;
    window.serverSelect.setValue(
      storageInfo.lastServer ||
      window.serverSelect.options[Object.keys(window.serverSelect.options)[0]].url
    );
  });
  
  $(".send-request").on("click", function() {
    var server = window.serverList.getServer(window.serverSelect.getValue());
    if (!server) {
      window.alert("Nenhum servidor selecionado");
    }
    console.log(server);
    
    var requestParser = /(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS) (\/.*)/i;
    var inputHttp = inputHttpEditor.getValue();
    var inputHttpLines = inputHttp.replace("\r", "").split("\n");
    if (!inputHttpLines.length) {
      window.alert("Requisição em branco");
    }
    
    if (!requestParser.exec(inputHttpLines[0])) {
      window.alert("Requisição inválida\n\nPrimeira linha deve conter algo " +
                  "como GET /organizations/321313213/who-am-i");
    }
    
    var requestTarget = requestParser.exec(inputHttpLines[0]);
    
    var request = {
      method: requestTarget[1].toUpperCase(),
      url: (server.url + (server.url.endsWith("/") ? "": "/") + requestTarget[2].substring(1)),
      path_qs: requestTarget[2],
      headers: {},
      autoHeaders: {},
      body: ["PUT", "PATCH", "POST"].indexOf(requestTarget[1].toUpperCase()) >= 0 ?
            inputBodyEditor.getValue() : ""
    };
    var invalidHeaders = [];
    
    inputHttpLines.slice(1).filter(function (line) {
      return $.trim(line).length;
    }).forEach(function (headerLine) {
      var sep = headerLine.indexOf(":");
      if (sep <= 0) {
        return invalidHeaders.push(headerLine);
      }
      
      var headerName = $.trim(headerLine.substring(0, sep));
      if (!headerName.length) {
        return invalidHeaders.push(headerLine);
      }
      
      var headerValue = $.trim(headerLine.substring(sep + 1));
      if (!headerValue.length) {
        return invalidHeaders.push(headerLine);
      }
      
      request.headers[headerName] = headerValue;
    });
    
    if (invalidHeaders.length) {
      window.alert("Headers inválidos\n\n" + invalidHeaders.join("\n"));
    }
    
    sendRequest(server, request);
  });
  
  var sendRequest = function(server, request) {
    server.getSigningFunction(request, window.userInputService, function(signingFunction) {
      signingFunction.sign(request);
      server.send(request, function(response) {
        var responseHttpInfo = response.statusLine + "\n\n" + response.headers;
        var limitLines = function(body) {
          var lines = body.split("\n");
          var limit = 10000;
          if (lines.length > limit) {
            return (lines.slice(0, limit).join("\n") 
                    + "\n\n(...) output limited to " + limit + " lines");
          }
          return body;
        };
        outputHttpEditor.setValue(responseHttpInfo, -1);
        try {
          var json = JSON.parse(response.body);
          outputBodyEditor.setValue(limitLines(JSON.stringify(json, null, 4)), -1);
        } catch(e) {
          outputBodyEditor.setValue(limitLines(response.body), -1);
        }
        
        if (response.statusLine.indexOf("403") >= 0) {
          $(".btn.forget-credentials").show()
                                      .off("click")
                                      .one("click", function() {
                                        server.eraseAuthInfo(request);
                                        $(".btn.forget-credentials").hide();
                                        sendRequest(server, request);
                                      });
        } else {
          $(".btn.forget-credentials").hide();
        }
      });
    });
  };
}

window.userInputService = {
  getApiKeyCredentials: function(options, callback) {
    var modal = $("[data-signature-method='" + options.kind + "']");
    modal.modal();
    modal.modal("show");
    modal.find("[data-bind='server-url']").text(options.scopeUrlPrefix);
    modal.find("input[name]").val("");
    modal.find(".btn-primary").one("click", function() {
     modal.modal("hide");
      var credentials = {};
      var errors = false;
      
      modal.find("input[name]").toArray().forEach(function(input) {
        var name = $(input).attr("name");
        var value = $.trim($(input).val());
        
        if (!value) {
          errors = true;
        }
        credentials[name] = value;
      });
      
      if (errors) {
        window.alert("Todos os campos são de preenchimento obrigatório");
      } else {
        callback(credentials);
      }
    });
  }
};

$(function() {
  chrome.storage.local.get(null, function(storageInfo) {
    main(storageInfo);
  });
});