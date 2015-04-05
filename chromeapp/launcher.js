chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('index.html', {
    'innerBounds': {
      'minWidth': 768,
      'minHeight': 400
    }
  });
});