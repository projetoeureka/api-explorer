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
      request.signatureHeaders = signatureHeaders;
    }
  };
}