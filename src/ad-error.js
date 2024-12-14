import { format } from './utils';

export default class AdError {
  #message;
  #errorCode;
  #innerError;

  /**
   *
   * @param {string} message
   * @param {number} [errorCode]
   * @param {Object} [innerError]
   */
  constructor(message, errorCode, innerError) {
    this.#message = message;
    this.#errorCode = errorCode;
    this.#innerError = innerError;
  }

  /**
   *
   * @returns {string}
   */
  getMessage() {
    return this.#message;
  }

  /**
   *
   * @returns {number}
   */
  getErrorCode() {
    return this.#errorCode;
  }
  getInnerError() {
    return this.#innerError instanceof Object ? this.#innerError : null;
  }
  setInnerError(innerError) {
    this.#innerError = innerError
  }
  formatMessage(...values) {
    this.#message = format(this.#message, values);
    return this;
  }
  toString() {
    return 'AdError ' + this.getErrorCode() + ': ' + this.getMessage() + (null != this.getInnerError() ? ' Caused by: ' + this.getInnerError() : '');
  }
}
