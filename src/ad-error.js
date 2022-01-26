import { replaceMessage } from './utils';

const AdError = function(errorCode, message, innerError) {
  this.errorCode = errorCode;
  this.message = message;
  this.innerError = innerError;
}
AdError.prototype.getErrorCode = function() {
  return this.errorCode;
}
AdError.prototype.getMessage = function() {
  return this.message;
}
AdError.prototype.getInnerError = function() {
  return this.innerError instanceof Object ? this.innerError : null;
}
AdError.prototype.replace = function(...values) {
  replaceMessage(this.message, values);
}
AdError.prototype.toString = function() {
  return 'AdError ' + this.getErrorCode() + ': ' + this.getMessage() + (null != this.getInnerError() ? ' Caused by: ' + this.getInnerError() : '');
}

export default AdError
