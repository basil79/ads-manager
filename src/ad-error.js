import { format } from './utils';

const AdError = function(message, errorCode, innerError) {
  this.message = message;
  this.errorCode = errorCode;
  this.innerError = innerError;
};
AdError.prototype.getMessage = function() {
  return this.message;
};
AdError.prototype.getErrorCode = function() {
  return this.errorCode;
};
AdError.prototype.getInnerError = function() {
  return this.innerError instanceof Object ? this.innerError : null;
};
AdError.prototype.formatMessage = function(...values) {
  this.message = format(this.message, values);
  return this;
};
AdError.prototype.toString = function() {
  return 'AdError ' + this.getErrorCode() + ': ' + this.getMessage() + (null != this.getInnerError() ? ' Caused by: ' + this.getInnerError() : '');
};

export default AdError
