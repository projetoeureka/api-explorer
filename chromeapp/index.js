function main(storageInfo) {
  var inputHttpEditor = ace.edit("input-http-editor");
  inputHttpEditor.setTheme("ace/theme/chrome");
  inputHttpEditor.setOptions({
    maxLines: 100, 
    highlightActiveLine: false,
    highlightGutterLine: false,
    showPrintMargin: false
  });
  inputHttpEditor.getSession().setUseWrapMode(true);

  var inputAutoHeadersEditor = ace.edit("input-auto-headers");
  inputAutoHeadersEditor.setTheme("ace/theme/chrome");
  inputAutoHeadersEditor.setOptions({
    maxLines: 100, 
    highlightActiveLine: false,
    highlightGutterLine: false,
    showPrintMargin: false
  });
  inputAutoHeadersEditor.setReadOnly(true);
  inputAutoHeadersEditor.getSession().setUseWrapMode(true);

  var inputBodyEditor = ace.edit("input-body-editor");
  inputBodyEditor.setTheme("ace/theme/chrome");
  inputBodyEditor.setOptions({maxLines: 10000});
  inputBodyEditor.getSession().setMode("ace/mode/json");
  inputBodyEditor.getSession().setUseWrapMode(true);
  
  var outputHttpEditor = ace.edit("output-http-editor");
  outputHttpEditor.setTheme("ace/theme/monokai");
  outputHttpEditor.setReadOnly(true);
  outputHttpEditor.setOptions({
    maxLines: 100, 
    highlightActiveLine: false,
    highlightGutterLine: false,
    showPrintMargin: false
  });
  outputHttpEditor.getSession().setUseWrapMode(true);
  
  var outputBodyEditor = ace.edit("output-body-editor");
  outputBodyEditor.setTheme("ace/theme/monokai");
  outputBodyEditor.setReadOnly(true);
  outputBodyEditor.setOptions({maxLines: Infinity, showPrintMargin: false});
  outputBodyEditor.getSession().setUseWorker(false);
  outputBodyEditor.getSession().setMode("ace/mode/json");
  outputBodyEditor.getSession().setUseWrapMode(true);
  
  var editors = [inputHttpEditor, inputAutoHeadersEditor, inputBodyEditor, 
                 outputHttpEditor, outputBodyEditor];
  
  editors.forEach(function disableAnnoyingWarnings(editor) {
    editor.$blockScrolling = Infinity;
  });
  
  editors.forEach(function(editor) {
    editor.on("change", saveServerState);
  });
  
  [inputBodyEditor, inputHttpEditor].forEach(function(editor) {
    editor.on("change", function() {
      if (window.maySaveServerState) {
        inputAutoHeadersEditor.setValue("");
      }
    });
  });
  
  function saveServerState() {
      if (window.maySaveServerState) {
        var info = {};
        info[serverSelect.getValue()] = {
          inputHttpEditor: inputHttpEditor.getValue(),
          inputBodyEditor: inputBodyEditor.getValue(),
          outputHttpEditor: outputHttpEditor.getValue(),
          outputBodyEditor: outputBodyEditor.getValue(),
          inputAutoHeadersEditor: inputAutoHeadersEditor.getValue(),
          url: $(".selectize-container .editable-input").text()
        };
        storageInfo[serverSelect.getValue()] = info[serverSelect.getValue()];
        chrome.storage.local.set(info);
        console.log("wrote", serverSelect.getValue());
      }
    }
  
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
  
  $("#endpoint").selectize({
    createOnBlur: true,
    selectOnTab: true,
    addPrecedence: true,
    loadThrottle: null,
    preload: "focus",
    valueField: "url",
    labelField: "url",
    searchField: "url",
    load: function(query, callback) {
      this.clearOptions();
      
      if (!window.serverSelect.getValue()) {
        callback();
      }
      var server = window.serverList.getServer(window.serverSelect.getValue());
      return callback(server.getEndpoints(query));
    },
    createFilter: function(url) {
      return url.match(/^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS) (\/.*)$/i);
    },
    create: function(url) {
      var match = url.match(/^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS) (\/.*)$/i);
      if (!match) {
        return false;
      }
      
      return {url: url};
    },
    render: {
      item: function(item, escape) {
        return "<div class='noneditable-input'>" + escape(item.url) + "</div>";
      },
      option: function(item, escape) {
        return "<div class='endpoint-option'><div class='endpoint-url'>" + 
          "<span class='method'>" + item.url.split(" ")[0] + "</span> " +
          "<span class='url'>" + escape(item.url.split(" ").slice(1).join(" ")) + "</span>" +
          "</div>" +
          "<div class='endpoint-description'>" + escape(
            item.description || "(do histórico)"
          ) + "</div></div>";
      },
    },
    onChange: function(value) {
      var url = this.getValue();
      if (!url) {
        return;
      }
      
      setURL(url);
    },
    onDropdownOpen: function() {
      $(".selectize-container .noneditable-input").show();
      $(".selectize-container .editable-input").hide();
    },
    onDropdownClose: function() {
      $(".selectize-container .noneditable-input").hide();
      $(".selectize-container .editable-input").show();
    }
  });
  
  $(".selectize-container .editable-input").on("blur", function() {
    var url = $.trim($(this).text().replace("\xa0", " "));
    var match = url.match(/^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS) (\/.*)$/i);
    if (!match) {
      url = $("#endpoint")[0].selectize.getValue();
    }

    setURL(url);
  });
  
  function setURL(url) {
    if (!url) {
      $(".selectize-container .editable-input").empty();
      return;
    }
    
    $(".selectize-container .editable-input")
      .empty()
      .append($("<span class='method'>").text(url.split(" ")[0]))
      .append(" ")
      .append($("<span class='url'>").text(url.split(" ").slice(1).join(" ")));
    
    if (window.maySaveServerState) {
      inputAutoHeadersEditor.setValue("", -1);
      saveServerState();
    }
  }

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
          inputHttpEditor: "Accept: */*",
          inputAutoHeadersEditor: "",
          inputBodyEditor: "{}",
          outputHttpEditor: "",
          outputBodyEditor: "",
          url: "GET /path/to/endpoint"
        };
        
        inputHttpEditor.setValue(serverState.inputHttpEditor, -1);
        inputAutoHeadersEditor.setValue(serverState.inputAutoHeadersEditor, -1);
        inputBodyEditor.setValue(serverState.inputBodyEditor, -1);
        outputHttpEditor.setValue(serverState.outputHttpEditor, -1);
        outputBodyEditor.setValue(serverState.outputBodyEditor, -1);
        setURL(serverState.url);
        
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
      return;
    }
    
    var url = $(".selectize-container .editable-input").text().replace("\xa0", " ");
    var requestParser = /^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS) (\/.*)$/i;
    console.log(url);
    if (!requestParser.exec(url)) {
      window.alert("Requisição inválida\n\nPrimeira linha deve conter algo " +
                  "como GET /organizations/321313213/who-am-i");
      return;
    }

    var inputHttp = inputHttpEditor.getValue();
    var inputHttpLines = inputHttp.replace("\r", "").split("\n");
    
    var requestTarget = requestParser.exec(url);
    
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
    
    inputHttpLines.filter(function (line) {
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
      return;
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
        
        var autoHeaders = Object.keys(request.autoHeaders).map(function(key) {
          return key + ": " + request.autoHeaders[key];
        }).join("\n");
        inputAutoHeadersEditor.setValue(autoHeaders, -1);
        
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