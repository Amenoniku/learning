var HttpError, http, path, util;

path = require('path');

util = require('util');

http = require('http');

HttpError = (function() {
  function HttpError(status, message) {
    Error.apply(this, arguments);
    Error.captureStackTrace(this, HttpError);
    this.status = status;
    this.message = message || http.STATUS_CODE[status] || "Error";
  }

  HttpError.prototype.name = "HttpError";

  return HttpError;

})();

util.inherits(HttpError, Error);

exports.HttpError = HttpError;
