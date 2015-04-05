function NoSignature() {
  return {
    sign: function(request) {}
  };
}

function GeekieSignV1(apiKey) {
  return {
    sign: function(request) {
      var signatureHeaders = {
        "X-App-Id": apiKey.credentials["client_id"],
        "X-Signature": CryptoJS.HmacMD5(
          (
            request.method.toUpperCase() 
            + CryptoJS.SHA1(request.body).toString()
            + request.path_qs 
            + apiKey.credentials["client_id"]
          ),
          apiKey.credentials["shared_secret"]
        ).toString()
      };
      $.extend(request.autoHeaders, signatureHeaders);
    }
  };
}

function GeekieSignV2(apiKey) {
  return {
    sign: function(request) {
      var now = new Date().toISOString();
      console.log(now);
      var signatureHeaders = {
        "X-Geekie-Requested-At": now,
        "X-Geekie-Signature": CryptoJS.HmacSHA1(
          (
            request.method.toUpperCase() + " " + request.path_qs + "\n"
            + now + "\n"
            + CryptoJS.SHA1(request.body).toString() + "\n"
          ),
          apiKey.credentials["api_key"]
        ).toString()
      };
      
      $.extend(request.autoHeaders, signatureHeaders);  
    }
  };
}

function beginLoggedUserAuth(apiKey, callback) {
  chrome.cookies.getAll({url: apiKey.credentials["domain"], name: "session"}, function(cookies) {
    callback({
      sign: function(request) {
        if (!cookies) {
          window.alert(
            "Cookie não encontrada para url='" + apiKey.credentials["domain"] + "' name='session'"
          );
        }
        
        var cookie = cookies[0];
        var accessToken = pickle.loads(atob(cookie.value.slice(40)))[2].access_token;
        
        var signatureHeaders = {
          "Authorization": "Bearer: " + accessToken
        };
        
        $.extend(request.autoHeaders, signatureHeaders);
      }
    });
  });
}