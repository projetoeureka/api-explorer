$(function() {
    var editor = ace.edit("input-http-editor");
    editor.setTheme("ace/theme/chrome");
    editor.setOptions({maxLines: 20});

    editor = ace.edit("input-body-editor");
    editor.setTheme("ace/theme/chrome");
    editor.setOptions({maxLines: Infinity});
    editor.getSession().setMode("ace/mode/json");
    
    editor = ace.edit("output-http-editor");
    editor.setTheme("ace/theme/monokai");
    editor.setReadOnly(true);
    editor.setOptions({maxLines: 20, showPrintMargin: false});
    
    editor = ace.edit("output-body-editor");
    editor.setTheme("ace/theme/monokai");
    editor.setReadOnly(true);
    editor.setOptions({maxLines: Infinity, showPrintMargin: false});
    editor.getSession().setUseWorker(false);
    editor.getSession().setMode("ace/mode/json");
    
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
    
    $("#server-host").selectize();
});