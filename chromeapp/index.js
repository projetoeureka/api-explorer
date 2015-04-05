$(function() {
  var inputHttpEditor = ace.edit("input-http-editor");
  inputHttpEditor.setTheme("ace/theme/chrome");
  inputHttpEditor.setOptions({maxLines: 20});

  var inputBodyEditor = ace.edit("input-body-editor");
  inputBodyEditor.setTheme("ace/theme/chrome");
  inputBodyEditor.setOptions({maxLines: 1000});
  inputBodyEditor.getSession().setMode("ace/mode/json");
  
  var outputHttpEditor = ace.edit("output-http-editor");
  outputHttpEditor.setTheme("ace/theme/monokai");
  outputHttpEditor.setReadOnly(true);
  outputHttpEditor.setOptions({maxLines: 20, showPrintMargin: false});
  
  var outputBodyEditor = ace.edit("output-body-editor");
  outputBodyEditor.setTheme("ace/theme/monokai");
  outputBodyEditor.setReadOnly(true);
  outputBodyEditor.setOptions({maxLines: Infinity, showPrintMargin: false});
  outputBodyEditor.getSession().setUseWorker(false);
  outputBodyEditor.getSession().setMode("ace/mode/json");
  
  $("#input-editor").resizable({
    handles: "e",
    autoHide: false,
    minWidth: 200,
    maxWidth: 1000,
    resize: function(event, ui) {
      var outputEditor = $(this).next();
      outputEditor.css("left", $(this).outerWidth(true) + "px");
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
      }
    });
    
    window.serverSelect = $select[0].selectize;
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
      method: requestTarget[1],
      url: (server.url + (server.url.endsWith("/") ? "": "/") + requestTarget[2].substring(1)),
      path_qs: requestTarget[2],
      headers: {}
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
    
    server.getSigningFunction(request, function(signingFunction) {
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
      });
    });
  });
});