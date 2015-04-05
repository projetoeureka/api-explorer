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
      $.extend(request.headers, signatureHeaders);
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
      
      $.extend(request.headers, signatureHeaders);
      $.extend(request.autoHeaders, signatureHeaders);  
    }
  };
}