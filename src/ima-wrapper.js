// IMA SDK Wrapper
const IMAWrapper = function(slot, videoSlot) {

  this._slot = slot;
  this._videoSlot = videoSlot;

  // IMA SDK url
  this.IMA_SDK_URL = 'https://imasdk.googleapis.com/js/sdkloader/ima3.js';
  // IMA SDk global vars
  this._adsLoader = null;
  this._adDisplayContainer = null;
  this._adDisplayContainerInitialized = false;
  this._adsManager = null;
  this._currentAd = null;

  this._attributes = {
    useSecure : false
  }

  this.EVENTS = {
    IMALoaded : 'IMALoaded',
    IMAError : 'IMAError'
  }
  this._eventCallbacks = {};

}
IMAWrapper.prototype.onAdsManagerLoaded = function(adsManagerLoadedEvent) {

  const adsRenderingSettings = new google.ima.AdsRenderingSettings();
  adsRenderingSettings.restoreCustomePlaybackStateOnAdBreakComplete = true;

  this._adsManager = adsManagerLoadedEvent.getAdsManager(this._videoSlot, adsRenderingSettings);
  this._adsManager.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, this.onIMAAdError.bind(this));
  this._adsManager.addEventListener(google.ima.AdEvent.Type.AD_BREAK_READY, function() {});
  this._adsManager.addEventListener(google.ima.AdEvent.Type.AD_METADATA, function() {});


}
IMAWrapper.prototype.onAdsManagerAdError = function(adsManagerAdErrorEvent) {
  // destroy
}
IMAWrapper.prototype.onIMAAdError = function(adErrorEvent) {

}
IMAWrapper.prototype.onIMALoaded = function() {
  if(this.EVENTS.IMALoaded in this._eventCallbacks) {
    this._eventCallbacks[this.EVENTS.IMALoaded]();
  }
}
IMAWrapper.prototype.onIMAError = function(message) {
  if(this.EVENTS.IMAError in this._eventCallbacks) {
    this._eventCallbacks[this.EVENTS.IMAError](message);
  }
}
IMAWrapper.prototype.setUpIMA = function() {

  google.ima.settings.setDisableCustomPlaybackForIOS10Plus(true);

  this._adDisplayContainer = new google.ima.AdDisplayContainer(this._slot);
  this._adsLoader = new google.ima.AdsLoader(this._adDisplayContainer);
  this._adsLoader.getSettings().setVpaidMode(this._attributes.useSecure ?
    google.ima.ImaSdkSettings.VpaidMode.ENABLED :
    google.ima.ImaSdkSettings.VpaidMode.INSECURE
  );

  // Listen and respond to ads loaded and error events.
  this._adsLoader.addEventListener(google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED, this.onAdsManagerLoaded.bind(this), false);
  this._adsLoader.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, this.onAdsManagerAdError.bind(this), false);

  // IMA loaded
  this.onIMALoaded();

}
IMAWrapper.prototype.loadIMA = function(callback) {
  const element = document.getElementsByTagName('head')[0] || document.documentElement,
    script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = this.IMA_SDK_URL;
  script.async = true;
  script.addEventListener('load', function() {
    callback(true);
  }, false);
  script.addEventListener('error', function() {
    element.removeChild(script);
    callback(false);
  }, false);
  element.insertBefore(script, element.firstChild);
}
IMAWrapper.prototype.init = function() {
  this.loadIMA(isLoaded => {
    if(isLoaded) {
      this.setUpIMA();
    } else {
      this.onIMAError('IMA SDK not loaded');
    }
  });
}
IMAWrapper.prototype.requestAds = function(vastUrl) {
  console.log('IMA > requestAds', vastUrl);
}
IMAWrapper.prototype.subscribe = function(callback, eventName, context) {
  const givenCallback = callback.bind(context);
  this._eventCallbacks[eventName] = givenCallback;
}
IMAWrapper.prototype.unsubscribe = function(eventName) {
  this._eventCallbacks[eventName] = null;
}

export default IMAWrapper
