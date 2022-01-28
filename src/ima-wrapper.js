// IMA SDK Wrapper
const IMAWrapper = function() {

  // Events
  this.EVENTS = {
    Error: 'Error',
    Loaded: 'Loaded'
  }

  this._eventCallbacks = {};

  this.IMA_SDK_URL = 'https://imasdk.googleapis.com/js/sdkloader/ima3.js';

  this.loadIMA((loaded) => {
    console.log('ima wrapper > ima loaded', loaded);
    if(loaded) {
      this.setUpIMA();
    } else {
      this.onError('IMA SDK not loaded');
    }
  });
}
IMAWrapper.prototype.loadIMA = function(callback) {
  const firstElement = document.getElementsByTagName('head')[0] || document.documentElement,
    script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = this.IMA_SDK_URL;
  script.async = true;
  script.addEventListener('load', () => {
    callback(true);
  }, false);
  script.addEventListener('error', () => {
    firstElement.removeChild(script);
    callback(false);
  }, false);
  // Append script
  firstElement.insertBefore(script, firstElement.firstChild);
}
IMAWrapper.prototype.setUpIMA = function() {

}
IMAWrapper.prototype.onError = function(message) {
  if(this.EVENTS.Error in this._eventCallbacks) {
    this._eventCallbacks[this.EVENTS.Error](message);
  }
}
IMAWrapper.prototype.init = function(width, height, viewMode) {
  console.log('ima wrapper > init', width, height, viewMode);
}

export default IMAWrapper;
