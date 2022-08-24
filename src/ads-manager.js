import { VASTClient, VASTParser, VASTTracker } from '@dailymotion/vast-client';
import AdError from './ad-error';

const AdsManager = function(adContainer) {

  if(!(adContainer instanceof Element || adContainer instanceof HTMLDocument)) {
    throw new Error('ad container is not defined');
  }

  // Ad Container
  this._adContainer = adContainer;

  // Slot
  this._slot = null;
  // Video Slot
  this._videoSlot = null;

  // Create Slot
  this.createSlot();

  // Events
  this.EVENTS = {
    AdsManagerLoaded: 'AdsManagerLoaded', // After success ad request, when vast xml is parsed and ready
    AdStarted: 'AdStarted',
    AdStopped: 'AdStopped',
    AdSkipped: 'AdSkipped',
    AdLoaded: 'AdLoaded',
    AdLinearChange: 'AdLinearChange',
    AdSizeChange: 'AdSizeChange',
    AdExpandedChange: 'AdExpandedChange',
    AdSkippableStateChange: 'AdSkippableStateChange',
    AdDurationChange: 'AdDurationChange',
    AdRemainingTimeChange: 'AdRemainingTimeChange',
    AdVolumeChange: 'AdVolumeChange',
    AdImpression: 'AdImpression',
    AdClickThru: 'AdClickThru',
    AdInteraction: 'AdInteraction',
    AdVideoStart: 'AdVideoStart',
    AdVideoFirstQuartile: 'AdVideoFirstQuartile',
    AdVideoMidpoint: 'AdVideoMidpoint',
    AdVideoThirdQuartile: 'AdVideoThirdQuartile',
    AdVideoComplete: 'AdVideoComplete',
    AdUserAcceptInvitation: 'AdUserAcceptInvitation',
    AdUserMinimize: 'AdUserMinimize',
    AdUserClose: 'AdUserClose',
    AdPaused: 'AdPaused',
    AdPlaying: 'AdPlaying',
    AdError: 'AdError',
    AdLog: 'AdLog',
    AllAdsCompleted: 'AllAdsCompleted' // After all ads completed, vast, vpaid, vmap
  };
  this._eventCallbacks = {};
  this._creativeEventCallbacks = {};

  // Attributes
  this._attributes = {
    width: 300,
    height: 154,
    viewMode: 'normal',
    desiredBitrate: 268,
    duration: 10,
    remainingTime: 10,
    currentTime: 0,
    volume: 0,
    version: '!!#Version#!!'
  };

  // Quartile Events
  this._quartileEvents = [
    { event: 'AdImpression', value: 0 }, { event: 'AdVideoStart', value: 0 },
    { event: 'AdVideoFirstQuartile', value: 25 },
    { event: 'AdVideoMidpoint', value: 50 },
    { event: 'AdVideoThirdQuartile', value: 75 },
    { event: 'AdVideoComplete', value: 100 }
  ];
  this._nextQuartileIndex = 0;
  this._defaultEventCallbacks = {
    'AdImpression': this.onAdImpression.bind(this),
    'AdVideoStart': this.onAdVideoStart.bind(this),
    'AdVideoFirstQuartile': this.onAdVideoFirstQuartile.bind(this),
    'AdVideoMidpoint': this.onAdVideoMidpoint.bind(this),
    'AdVideoThirdQuartile': this.onAdVideoThirdQuartile.bind(this),
    'AdVideoComplete': this.onAdVideoComplete.bind(this)
  };

  // Options
  this._options = {
    autoplay: true,
    muted: true,
    vastLoadTimeout: 23000,
    loadVideoTimeout: 8000,
    withCredentials: false,
    wrapperLimit: 10,
    resolveAll: true
  };
  // Error codes
  this.ERROR_CODES = {
    ADS_REQUEST_NETWORK_ERROR: 1012,
    FAILED_TO_REQUEST_ADS: 1005,
    UNKNOWN_AD_RESPONSE: 1010,
    VAST_ASSET_NOT_FOUND: 1007,
    VAST_EMPTY_RESPONSE: 1009,
    VAST_LINEAR_ASSET_MISMATCH: 403,
    VAST_LOAD_TIMEOUT: 301,
    VAST_MEDIA_LOAD_TIMEOUT: 402,
    VIDEO_PLAY_ERROR: 400,
    VPAID_ERROR: 901,
  };
  // Error messages
  this.ERROR_MESSAGES = {
    ADS_REQUEST_ERROR: 'Unable to request ads from server. Cause: {0}.', // 1005
    ADS_REQUEST_NETWORK_ERROR: 'Unable to request ads from server due to network error.', // 1012
    FAILED_TO_REQUEST_ADS: 'The was a problem requesting ads from the server.', // 1005
    NO_ADS_FOUND: 'The response does not contain any valid ads.', // 1009
    UNKNOWN_AD_RESPONSE: 'The ad response was not understood and cannot be parsed.', // 1010
    VAST_ASSET_NOT_FOUND: 'No assets were found in the VAST ad response.', // 1007
    VAST_EMPTY_RESPONSE: 'The VAST response document is empty.', // 1009
    VAST_LINEAR_ASSET_MISMATCH: 'Linear assets were found in the VAST ad response, but none of them matched the player\'s capabilities.', // 403
    VAST_LOAD_TIMEOUT: 'Ad request reached a timeout.', // 301
    VAST_MEDIA_LOAD_TIMEOUT: 'VAST media file loading reached a timeout of {0} seconds.', // 402
    VIDEO_PLAY_ERROR: 'There was an error playing the video ad.', // 400
    VPAID_CREATIVE_ERROR: 'An unexpected error occurred within the VPAID creative. Refer to the inner error for more info.' // 901
  };
  // Errors
  this.ERRORS = {
    VAST_EMPTY_RESPONSE: new AdError(this.ERROR_CODES.VAST_EMPTY_RESPONSE, this.ERROR_MESSAGES.VAST_EMPTY_RESPONSE),
    VAST_ASSET_NOT_FOUND: new AdError(this.ERROR_CODES.VAST_ASSET_NOT_FOUND, this.ERROR_MESSAGES.VAST_ASSET_NOT_FOUND),
    VAST_LINEAR_ASSET_MISMATCH: new AdError(this.ERROR_CODES.VAST_LINEAR_ASSET_MISMATCH, this.ERROR_MESSAGES.VAST_LINEAR_ASSET_MISMATCH),
    VAST_LOAD_TIMEOUT: new AdError(this.ERROR_CODES.VAST_LOAD_TIMEOUT, this.ERROR_MESSAGES.VAST_LOAD_TIMEOUT),
    VAST_MEDIA_LOAD_TIMEOUT: new AdError(this.ERROR_CODES.VAST_MEDIA_LOAD_TIMEOUT, this.ERROR_MESSAGES.VAST_MEDIA_LOAD_TIMEOUT),
    VIDEO_PLAY_ERROR: new AdError(this.ERROR_CODES.VIDEO_PLAY_ERROR, this.ERROR_MESSAGES.VIDEO_PLAY_ERROR)
  };

  this._vastClient = null;
  this._vastParser = null;
  this._vastTracker = null;

  this._ad = null;
  this._adPod = null;
  this._creative = null;
  this._mediaFiles = null;
  this._mediaFileIndex = 0;
  this._mediaFile = null;

  this._isVPAID = false;
  this._vpaidCreative = null;

  // Timers, Intervals
  this._vastMediaLoadTimeoutId = null;
  this._vpaidProgressCounter = null;

  this.SUPPORTED_CREATIVE_VPAID_VERSION_MIN = 2;

  this._hasLoaded = false;
  this._hasError = false;
  this._hasImpression = false;
  this._hasStarted = false;

  this._isDestroyed = false;
}
AdsManager.prototype.createSlot = function() {
  this._slot = document.createElement('div');
  this._slot.style.position = 'absolute';
  this._slot.style.display = 'none';
  this._adContainer.appendChild(this._slot);
  this.createVideoSlot();
}
AdsManager.prototype.removeSlot = function() {
  this._slot.parentNode && this._slot.parentNode.removeChild(this._slot);
  //this.createSlot();
}
AdsManager.prototype.showSlot = function() {
  // Check if video slot has src, if no then hide video slot
  if(this._videoSlot.src === '') {
    this.hideVideoSlot();
  }
  // Show slot
  this._slot.style.display = 'block';
}
AdsManager.prototype.resizeSlot = function(width, height) {
  this._slot.style.width = width + 'px';
  this._slot.style.height = height + 'px';
}
AdsManager.prototype.createVideoSlot = function() {
  this._videoSlot = document.createElement('video');
  this._videoSlot.setAttribute('webkit-playsinline', true);
  this._videoSlot.setAttribute('playsinline', true);
  //this._videoSlot.setAttribute('preload', 'none');
  this._videoSlot.style.width = '100%';
  this._videoSlot.style.height = '100%';
  this._videoSlot.style.backgroundColor = 'rgb(0, 0, 0)';
  //this._adContainer.appendChild(this._videoSlot);
  this._slot.appendChild(this._videoSlot);
}
AdsManager.prototype.hideVideoSlot = function() {
  this._videoSlot.style.display = 'none';
}
AdsManager.prototype.stopVASTMediaLoadTimeout = function() {
  if(this._vastMediaLoadTimeoutId) {
    clearTimeout(this._vastMediaLoadTimeoutId);
    this._vastMediaLoadTimeoutId = null;
  }
}
AdsManager.prototype.startVASTMediaLoadTimeout = function() {
  this.stopVASTMediaLoadTimeout();
  this._vastMediaLoadTimeoutId = setTimeout(() => {
    this.onAdError(this.ERRORS.VAST_MEDIA_LOAD_TIMEOUT.formatMessage(this._options.loadVideoTimeout));
  }, this._options.loadVideoTimeout);
}
AdsManager.prototype.updateVPAIDProgress = function() {
  // Check remaining time
  this._attributes.remainingTime = this._isCreativeFunctionInvokable('getAdRemainingTime') ? this._vpaidCreative.getAdRemainingTime() : -1;
  if(!isNaN(this._attributes.remainingTime) && this._attributes.remainingTime !== 1) {
    this._attributes.currentTime = this._attributes.duration - this._attributes.remainingTime;
    // Track progress
    this._vastTracker.setProgress(this._attributes.currentTime);
  }
}
AdsManager.prototype.startVPAIDProgress = function() {
  this.stopVPAIDProgress();
  this._vpaidProgressCounter = setInterval(() => {
    if(this._isVPAID && this._vpaidCreative && this._vastTracker) {
      this.updateVPAIDProgress();
    } else {
      this.stopVPAIDProgress();
    }
  }, 1000);
}
AdsManager.prototype.stopVPAIDProgress = function() {
  if(this._vpaidProgressCounter) {
    clearInterval(this._vpaidProgressCounter);
    this._vpaidProgressCounter = null;
  }
}
AdsManager.prototype.addEventListener = function(eventName, callback, context) {
  const givenCallback = callback.bind(context);
  this._eventCallbacks[eventName] = givenCallback;
}
AdsManager.prototype.removeEventListener = function(eventName) {
  this._eventCallbacks[eventName] = null;
}
AdsManager.prototype.removeEventListeners = function(eventCallbacks) {
  for (const eventName in eventCallbacks) {
    eventCallbacks.hasOwnProperty(eventName) && this.removeEventListener(eventName);
  }
}
AdsManager.prototype.onAdsManagerLoaded = function() {
  if (this.EVENTS.AdsManagerLoaded in this._eventCallbacks) {
    if(typeof this._eventCallbacks[this.EVENTS.AdsManagerLoaded] === 'function') {
      this._eventCallbacks[this.EVENTS.AdsManagerLoaded]();
    }
  }
}
AdsManager.prototype.onAdLoaded = function() {
  this.stopVASTMediaLoadTimeout();
  if (this.EVENTS.AdLoaded in this._eventCallbacks) {
    if(typeof this._eventCallbacks[this.EVENTS.AdLoaded] === 'function') {
      this._eventCallbacks[this.EVENTS.AdLoaded](this._creative);
    }
  }
}
AdsManager.prototype.onAdDurationChange = function() {
  if(this._isVPAID && this._vpaidCreative && this._vastTracker) {
    this._attributes.duration = this._isCreativeFunctionInvokable('getAdDuration') ? this._vpaidCreative.getAdDuration() : -1;
    if(this._attributes.duration !== -1) {
      this._vastTracker.setDuration(this._attributes.duration);
    }
  }
  if (this.EVENTS.AdDurationChange in this._eventCallbacks) {
    if(typeof this._eventCallbacks[this.EVENTS.AdDurationChange] === 'function') {
      this._eventCallbacks[this.EVENTS.AdDurationChange]();
    }
  }
}
AdsManager.prototype.onAdSizeChange = function() {
  if (this.EVENTS.AdSizeChange in this._eventCallbacks) {
    if(typeof this._eventCallbacks[this.EVENTS.AdSizeChange] === 'function') {
      this._eventCallbacks[this.EVENTS.AdSizeChange]();
    }
  }
}
AdsManager.prototype.onAdStarted = function() {
  // Show ad slot
  this.showSlot();

  if (this.EVENTS.AdStarted in this._eventCallbacks) {
    if(typeof this._eventCallbacks[this.EVENTS.AdStarted] === 'function') {
      this._eventCallbacks[this.EVENTS.AdStarted]();
    }
  }
}
AdsManager.prototype.onAdVideoStart = function() {
  if(this._isVPAID && this._vpaidCreative && this._vastTracker) {
    this.updateVPAIDProgress();
  }
  if (this.EVENTS.AdVideoStart in this._eventCallbacks) {
    if(typeof this._eventCallbacks[this.EVENTS.AdVideoStart] === 'function') {
      this._eventCallbacks[this.EVENTS.AdVideoStart]();
    }
  }
}
AdsManager.prototype.onAdStopped = function() {
  if (this.EVENTS.AdStopped in this._eventCallbacks) {
    if(typeof this._eventCallbacks[this.EVENTS.AdStopped] === 'function') {
      this._eventCallbacks[this.EVENTS.AdStopped]();
    }
  }
  // abort the ad, unsubscribe and reset to a default state
  this._abort();
}
AdsManager.prototype.onAdSkipped = function() {
  if (this.EVENTS.AdSkipped in this._eventCallbacks) {
    if(typeof this._eventCallbacks[this.EVENTS.AdSkipped] === 'function') {
      this._eventCallbacks[this.EVENTS.AdSkipped]();
    }
  }
  // abort the ad, unsubscribe and reset to a default state
  this._abort();
}
AdsManager.prototype.onAdVolumeChange = function() {
  if (this.EVENTS.AdVolumeChange in this._eventCallbacks) {
    if(typeof this._eventCallbacks[this.EVENTS.AdVolumeChange] === 'function') {
      this._eventCallbacks[this.EVENTS.AdVolumeChange]();
    }
  }
}
AdsManager.prototype.onAdImpression = function() {
  if(this._isVPAID && this._vpaidCreative && this._vastTracker) {
    if (!this._hasImpression) {
      // Check duration
      this._attributes.duration = this._isCreativeFunctionInvokable('getAdDuration') ? this._vpaidCreative.getAdDuration() : -1;
      if(this._attributes.duration !== -1) {
        this._vastTracker.setDuration(this._attributes.duration);
      }
      /*
      // Check remaining time
      this._attributes.remainingTime = this._isCreativeFunctionInvokable("getAdRemainingTime") ? this._vpaidCreative.getAdRemainingTime() : -1;
      console.log('update tracker with new remainingTime', this._attributes.remainingTime);
      console.log('update tracker with new duration', this._attributes.duration);
       */
      // Track impression
      this._vastTracker.trackImpression();

      // Start VPAID process
      this.startVPAIDProgress();

      this._hasImpression = true;
    }
  }
  if (this.EVENTS.AdImpression in this._eventCallbacks) {
    if(typeof this._eventCallbacks[this.EVENTS.AdImpression] === 'function') {
      this._eventCallbacks[this.EVENTS.AdImpression]();
    }
  }
}
AdsManager.prototype.onAdClickThru = function(url, id, playerHandles) {
  if(this._isVPAID && this._vpaidCreative && this._vastTracker) {
    this._vastTracker.click();
  }
  if (this.EVENTS.AdClickThru in this._eventCallbacks) {
    if(typeof this._eventCallbacks[this.EVENTS.AdClickThru] === 'function') {
      this._eventCallbacks[this.EVENTS.AdClickThru](url, id, playerHandles);
    }
  }
}
AdsManager.prototype.onAdVideoFirstQuartile = function() {
  if(this._isVPAID && this._vpaidCreative && this._vastTracker) {
    this.updateVPAIDProgress();
  }
  if (this.EVENTS.AdVideoFirstQuartile in this._eventCallbacks) {
    if(typeof this._eventCallbacks[this.EVENTS.AdVideoFirstQuartile] === 'function') {
      this._eventCallbacks[this.EVENTS.AdVideoFirstQuartile]();
    }
  }
};
AdsManager.prototype.onAdVideoMidpoint = function() {
  if(this._isVPAID && this._vpaidCreative && this._vastTracker) {
    this.updateVPAIDProgress();
  }
  if (this.EVENTS.AdVideoMidpoint in this._eventCallbacks) {
    if(typeof this._eventCallbacks[this.EVENTS.AdVideoMidpoint] === 'function') {
      this._eventCallbacks[this.EVENTS.AdVideoMidpoint]();
    }
  }
};
AdsManager.prototype.onAdVideoThirdQuartile = function() {
  if(this._isVPAID && this._vpaidCreative && this._vastTracker) {
    this.updateVPAIDProgress();
  }
  if (this.EVENTS.AdVideoThirdQuartile in this._eventCallbacks) {
    if(typeof this._eventCallbacks[this.EVENTS.AdVideoThirdQuartile] === 'function') {
      this._eventCallbacks[this.EVENTS.AdVideoThirdQuartile]();
    }
  }
};
AdsManager.prototype.onAdPaused = function() {
  if(this._vastTracker) {
    this._vastTracker.setPaused(true);
  }
  if (this.EVENTS.AdPaused in this._eventCallbacks) {
    if(typeof this._eventCallbacks[this.EVENTS.AdPaused] === 'function') {
      this._eventCallbacks[this.EVENTS.AdPaused]();
    }
  }
};
AdsManager.prototype.onAdPlaying = function() {
  if(this._vastTracker) {
    this._vastTracker.setPaused(false);
  }
  if (this.EVENTS.AdPlaying in this._eventCallbacks) {
    if(typeof this._eventCallbacks[this.EVENTS.AdPlaying] === 'function') {
      this._eventCallbacks[this.EVENTS.AdPlaying]();
    }
  }
};
AdsManager.prototype.onAdVideoComplete = function() {
  if(this._isVPAID && this._vpaidCreative && this._vastTracker) {
    this._vastTracker.complete();
  }
  if (this.EVENTS.AdVideoComplete in this._eventCallbacks) {
    if(typeof this._eventCallbacks[this.EVENTS.AdVideoComplete] === 'function') {
      this._eventCallbacks[this.EVENTS.AdVideoComplete]();
    }
  }
}
AdsManager.prototype.onAllAdsCompleted = function() {
  if (this.EVENTS.AllAdsCompleted in this._eventCallbacks) {
    if(typeof this._eventCallbacks[this.EVENTS.AllAdsCompleted] === 'function') {
      this._eventCallbacks[this.EVENTS.AllAdsCompleted]();
    }
  }
}
AdsManager.prototype.onAdError = function(message) {
  this._hasError = true;
  // Stop and clear timeouts, intervals
  this.stopVASTMediaLoadTimeout();
  this.stopVPAIDProgress();

  if (this.EVENTS.AdError in this._eventCallbacks) {
    if(typeof this._eventCallbacks[this.EVENTS.AdError] === 'function') {
      this._eventCallbacks[this.EVENTS.AdError](message);
    }
  }
}
AdsManager.prototype.onAdLog = function(message) {
  if (this.EVENTS.AdLog in this._eventCallbacks) {
    if(typeof this._eventCallbacks[this.EVENTS.AdLog] === 'function') {
      this._eventCallbacks[this.EVENTS.AdLog](message);
    }
  }
}
AdsManager.prototype.processVASTResponse = function(res) {

  const ads = res.ads;
  if(ads.length != 0) {

    if(ads.length > 1) {
      // Ad pod
      // Filter by sequence
      this._adPod = ads.sort(function(a, b) {
        let aSequence = a.sequence;
        let bSequence = b.sequence;
        if (aSequence === bSequence) {
          return 0;
        } else if (aSequence === null) {
          return 1;
        } else if (bSequence === null) {
          return -1;
        }
        return (aSequence < bSequence) ? -1 : (aSequence > bSequence) ? 1 : 0;
      });

      this._ad = ads[0];
    } else {
      // Ad
      this._ad = ads[0];
    }

    if(this._ad) {

      // Filter linear creatives, get first
      this._creative = ads[0].creatives.filter(creative => creative.type === 'linear')[0];
      // Check if creative has media files
      if(this._creative) {

        if(this._creative.mediaFiles.length != 0) {
          // Filter and check media files for mime type canPlay and if VPAID or not
          this._mediaFiles = this._creative.mediaFiles.filter(mediaFile => {
            // mime types -> mp4, webm, ogg, 3gp
            if(this.canPlayVideoType(mediaFile.mimeType)) {
              return mediaFile;
            } else if(mediaFile.mimeType === 'application/javascript') {
              // apiFramework -> mime type -> application/javascript
              return mediaFile;
            }
          });//[0]; // take the first one

          // Sort media files by size
          this._mediaFiles.sort(function(a, b) {
            let aHeight = a.height;
            let bHeight = b.height;
            return (aHeight < bHeight) ? -1 : (aHeight > bHeight) ? 1 : 0;
          });

          if(this._mediaFiles && this._mediaFiles.length != 0) {
            // TODO: move after adLoaded
            // Init VAST Tracker for tracking events
            this._vastTracker = new VASTTracker(null, this._ad, this._creative);
            this._vastTracker.load();

            // If not VPAID dispatch AdsManagerLoaded event -> ad is ready for init
            this.onAdsManagerLoaded();
          } else {
            // Linear assets were found in the VASt ad response, but none of them match the video player's capabilities.
            this.onAdError(this.ERRORS.VAST_LINEAR_ASSET_MISMATCH);
          }

        } else {
          // No assets were found in the VAST ad response.
          this.onAdError(this.ERRORS.VAST_ASSET_NOT_FOUND);
        }
      } else {
        // TODO:
        // Non Linear
        console.log('non linear');
      }

    }

  } else {
    // The VAST response document is empty.
    this.onAdError(this.ERRORS.VAST_EMPTY_RESPONSE);
  }
}
AdsManager.prototype.requestAds = function(vastUrl, options = {}) {

  if(this._isDestroyed) {
    return;
  }

  // Assign options
  Object.assign(this._options, options);

  // VAST options
  // timeout: Number - A custom timeout for the requests (default 120000 ms)
  // withCredentials: Boolean - A boolean to enable the withCredentials options for the XHR URLHandler (default false)
  // wrapperLimit: Number - A number of Wrapper responses that can be received with no InLine response (default 10)
  // resolveAll: Boolean - Allows you to parse all the ads contained in the VAST or to parse them ad by ad or adPod by adPod (default true)
  // allowMultipleAds: Boolean - A Boolean value that identifies whether multiple ads are allowed in the requested VAST response. This will override any value of allowMultipleAds attribute set in the VAST
  // followAdditionalWrappers: Boolean - a Boolean value that identifies whether subsequent Wrappers after a requested VAST response is allowed. This will override any value of followAdditionalWrappers attribute set in the VAST
  const vastOptions = {
    timeout: this._options.vastLoadTimeout,
    withCredentials: this._options.withCredentials,
    wrapperLimit: this._options.wrapperLimit,
    resolveAll: this._options.resolveAll
  };

  // Abort
  this.abort();

  // Check if vastUrl exists
  if(vastUrl && typeof vastUrl === 'string') {

    let isURL = false;
    try {
      new URL(vastUrl);
      isURL = true;
    } catch (e) {
    }

    if (isURL) {
      // use VAST URL
      this._vastClient = new VASTClient();
      this._vastClient
        .get(vastUrl, vastOptions)
        .then(res => {
          this.processVASTResponse(res);
        })
        .catch(err => {
          this.onAdError(err.message);
        });
    } else {
      // use VAST XML
      const vastXml = (new window.DOMParser()).parseFromString(vastUrl, 'text/xml');
      this._vastParser = new VASTParser();
      this._vastParser
        .parseVAST(vastXml, vastOptions)
        .then(res => {
          this.processVASTResponse(res);
        })
        .catch(err => {
          this.onAdError(err.message);
        });
    }
  } else {
    this.onAdError('VAST URL/XML is empty');
  }
}
AdsManager.prototype.canPlayVideoType = function(mimeType) {
  if(mimeType === 'video/3gpp' && this.supportsThreeGPVideo()) {
    return true;
  } else if(mimeType === 'video/webm' && this.supportsWebmVideo()) {
    return true;
  } else if(mimeType === 'video/ogg' && this.supportsOggTheoraVideo()) {
    return true;
  } else if(mimeType === 'video/mp4' && this.supportsH264BaselineVideo()) {
    return true;
  }
  return false;
}
AdsManager.prototype.supportsVideo = function() {
  return !!document.createElement('video').canPlayType;
}
AdsManager.prototype.supportsH264BaselineVideo = function() {
  if(!this.supportsVideo()) return false;
  return document.createElement('video').canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"');
}
AdsManager.prototype.supportsOggTheoraVideo = function() {
  if(!this.supportsVideo()) return false;
  return document.createElement('video').canPlayType('video/ogg; codecs="theora, vorbis"');
}
AdsManager.prototype.supportsWebmVideo = function() {
  if(!this.supportsVideo()) return false;
  return document.createElement('video').canPlayType('video/webm; codecs="vp8, vorbis"');
}
AdsManager.prototype.supportsThreeGPVideo = function() {
  if(!this.supportsVideo()) return false;
  return document.createElement('video').canPlayType('video/3gpp; codecs="mp4v.20.8, samr"');
}
AdsManager.prototype.handshakeVersion = function(version) {
  return this._vpaidCreative.handshakeVersion(version);
}
AdsManager.prototype._isCreativeFunctionInvokable = function(a) {
  return this._vpaidCreative ? (a = this._vpaidCreative[a]) && typeof a === 'function' : false;
}
AdsManager.prototype.checkVPAIDInterface = function(a) {
  const b = { passed: true, missingInterfaces: ''};
  for (let d = a.length - 1; 0 <= d; d--)
    this._isCreativeFunctionInvokable(a[d]) || (b.passed = false, b.missingInterfaces += a[d] + ' ');
  return b;
}
AdsManager.prototype.setCallbacksForCreative = function(eventCallbacks, context) {
  for (const event in eventCallbacks) eventCallbacks.hasOwnProperty(event) && this._vpaidCreative.subscribe(eventCallbacks[event], event, context)
}
AdsManager.prototype.removeCallbacksForCreative = function(eventCallbacks) {
  for (const event in eventCallbacks) {
    eventCallbacks.hasOwnProperty(event) && this._vpaidCreative.unsubscribe(event); // && this._vpaidCreative.unsubscribe(eventCallbacks[event], event);
  }
}
AdsManager.prototype.creativeAssetLoaded = function() {
  const checkVPAIDMinVersion = () => {
    const c = this.handshakeVersion(this.SUPPORTED_CREATIVE_VPAID_VERSION_MIN.toFixed(1));
    return c ? parseFloat(c) < this.SUPPORTED_CREATIVE_VPAID_VERSION_MIN ? (this.onAdError('Only support creatives with VPAID version >= ' + this.SUPPORTED_CREATIVE_VPAID_VERSION_MIN.toFixed(1)), !1) : !0 : (this.onAdError('Cannot get VPAID version from the creative'), !1)
  };
  if (function(that) {
    const c = that.checkVPAIDInterface('handshakeVersion initAd startAd stopAd subscribe unsubscribe getAdLinear'.split(' '));
    c.passed || that.onAdError('Missing interfaces in the VPAID creative: ' + c.missingInterfaces);
    return c.passed
  }(this) && checkVPAIDMinVersion()) {

    // VPAID events
    this._creativeEventCallbacks = {
      AdStarted: this.onAdStarted,
      AdStopped: this.onAdStopped,
      AdSkipped: this.onAdSkipped,
      AdLoaded: this.onAdLoaded,
      //AdLinearChange: this.onAdLinearChange,
      AdSizeChange: this.onAdSizeChange,
      //AdExpandedChange: this.onAdExpandedChange,
      AdDurationChange: this.onAdDurationChange,
      AdVolumeChange: this.onAdVolumeChange,
      AdImpression: this.onAdImpression,
      AdClickThru: this.onAdClickThru,
      //AdInteraction: this.onAdInteraction,
      AdVideoStart: this.onAdVideoStart,
      AdVideoFirstQuartile: this.onAdVideoFirstQuartile,
      AdVideoMidpoint: this.onAdVideoMidpoint,
      AdVideoThirdQuartile: this.onAdVideoThirdQuartile,
      AdVideoComplete: this.onAdVideoComplete,
      //AdUserAcceptInvitation: this.onAdUserAcceptInvitation,
      //AdUserMinimize: this.onAdUserMinimize,
      //AdUserClose: this.onAdUserClose,
      AdPaused: this.onAdPaused,
      AdPlaying: this.onAdPlaying, // onAdResumed
      AdError: this.onAdError,
      AdLog: this.onAdLog
    }

    // Subscribe for VPAID events
    this.setCallbacksForCreative(this._creativeEventCallbacks, this);

    // Prepare for iniAd
    const width = this._attributes.width;
    const height = this._attributes.height;
    const creativeData = {
      AdParameters: this._creative.adParameters
    };
    const environmentVars = {
      slot: this._slot,
      videoSlot: this._videoSlot,
      videoSlotCanAutoPlay: true
    };
    // iniAd(width, height, viewMode, desiredBitrate, creativeData, environmentVars)
    // Start loadVideoTimeout
    this.startVASTMediaLoadTimeout();
    this._vpaidCreative.initAd(width, height, this._attributes.viewMode, this._attributes.desiredBitrate, creativeData, environmentVars);

  }
}
AdsManager.prototype.loadCreativeAsset = function(fileURL) {
  const vpaidIframe = document.getElementById('vpaidIframe'),
    iframe = document.createElement('iframe');

  iframe.id = 'vpaidIframe';
  //vpaidIframe == null ? document.body.appendChild(iframe) : document.body.replaceChild(iframe, vpaidIframe);
  vpaidIframe == null ? this._adContainer.appendChild(iframe) : this._adContainer.replaceChild(iframe, vpaidIframe);
  iframe.width = 0;
  iframe.height = 0;
  iframe.style.display = 'none';
  iframe.setAttribute('allowfullscreen', '');
  iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
  iframe.setAttribute('allow', 'autoplay;');
  iframe.tabIndex = -1;
  iframe.contentWindow.document.open();
  // CORS?
  iframe.contentWindow.document.write('<script type="text/javascript" src="' + fileURL + '"> \x3c/script>');
  iframe.contentWindow.document.close();


  this._loadIntervalTimer = setInterval(() => {
    let VPAIDAd = document.getElementById('vpaidIframe').contentWindow.getVPAIDAd;
    VPAIDAd && typeof VPAIDAd === 'function' && (clearInterval(this._loadIntervalTimer), VPAIDAd = VPAIDAd(), typeof VPAIDAd === 'undefined' ? console.log('getVPAIDAd() returns undefined value') : VPAIDAd == null ? console.log('getVPAIDAd() returns null') : (this._vpaidCreative = VPAIDAd, this.creativeAssetLoaded()))
  }, 200);

}
AdsManager.prototype.removeCreativeAsset = function() {
  // Remove VPAID iframe
  const vpaidIframe = document.getElementById('vpaidIframe');
  if(vpaidIframe) {
    vpaidIframe.parentNode.removeChild(vpaidIframe);
  }
}
AdsManager.prototype._abort = function() {
  // Abort
  this.abort();

  // Dispatch AllAdsCompleted
  this.onAllAdsCompleted();
}
AdsManager.prototype.isCreativeExists = function() {
  return this._creative && this._creative.mediaFiles.length != 0;
}
AdsManager.prototype.init = function(width, height, viewMode) {

  if(this._isDestroyed) {
    return;
  }

  if(this.isCreativeExists()) {

    // Find the best resolution for mediaFile
    this._mediaFileIndex = this._mediaFiles.findIndex(function(item) {
      return item.height >= height
    });

    if(this._mediaFileIndex != -1) {
      this._mediaFile = this._mediaFiles[this._mediaFileIndex];
    } else {
      // Get the last from array
      this._mediaFile = this._mediaFiles[this._mediaFiles.length - 1];
    }

    if(this._mediaFile) {
      // Check if VPAID
      if (this._mediaFile.mimeType === 'application/javascript') {
        this._isVPAID = true;
      }

      this._attributes.width = width;
      this._attributes.height = height;
      this._attributes.viewMode = viewMode;

      // Resize slot
      this.resizeSlot(this._attributes.width, this._attributes.height);

      this._videoSlot.addEventListener('error', () => {
        this.onAdError(this.ERRORS.VIDEO_PLAY_ERROR);
      }, false);

      if(this._isVPAID) {
        // VPAID
        this.loadCreativeAsset(this._mediaFile.fileURL);
      } else {

        // VAST
        // Events
        this._slot.addEventListener('click', () => {
          if(!this._isVPAID && this._vastTracker) {
            this._vastTracker.click();
          }
        });

        this._videoSlot.addEventListener('canplay', () => {
          // console.log('video slot can play');
        });

        this._videoSlot.addEventListener('play', () => {
          // console.log('video slot play');
        });

        this._videoSlot.addEventListener('volumechange', (event) => {
          this._vastTracker && this._vastTracker.setMuted(event.target.muted);
        });

        this._videoSlot.addEventListener('timeupdate', (event) => {
          if(this.isCreativeExists()) {

            if (this._nextQuartileIndex >= this._quartileEvents.length) {
              return;
            }

            const percentPlayed = event.target.currentTime * 100.0 / event.target.duration;
            if (percentPlayed >= this._quartileEvents[this._nextQuartileIndex].value) {
              const lastQuartileEvent = this._quartileEvents[this._nextQuartileIndex].event;
              this._defaultEventCallbacks[lastQuartileEvent]();
              this._nextQuartileIndex += 1;
            }

            if (percentPlayed >= 0) {
              if (!this._hasImpression) {
                this._vastTracker && this._vastTracker.trackImpression();
                this._hasImpression = true;
              }
            }
            this._vastTracker && this._vastTracker.setProgress(event.target.currentTime);
            if (event.target.duration > 0) {
              this._attributes.remainingTime = event.target.duration - event.target.currentTime;
            }
          }
        }, true);

        this._videoSlot.addEventListener('loadedmetadata', (event) => {
          this._attributes.duration = event.target.duration;
          // Update tracking duration with real media meta data
          this._vastTracker && this._vastTracker.setDuration(event.target.duration);
          //if(!this._isVPAID) {
            this.onAdDurationChange();
          //}
        });

        this._videoSlot.addEventListener('ended', () => {
          // Complete
          this._vastTracker && this._vastTracker.complete();

          //setTimeout(() => {
            this.onAdStopped();
          //}, 75);

        });

        this._videoSlot.setAttribute('src', this._mediaFile.fileURL);

        // Ad Loaded
        this.onAdLoaded();
      }

      // Tracking
      if(this._vastTracker) {

        this._vastTracker.on('clickthrough', (url) => {
          if (!this._isVPAID) {
            this.onAdClickThru(url);
          }

          // Open the resolved clickThrough url
          const opener = window.open(url, '_blank');
          void 0 !== opener ? opener.focus() : window.location.href = url;
        });

      }

    } else {
      // console.log('media file not found');
    }

  } /* else {
    this.onAdError('');
  }*/
}
AdsManager.prototype.start = function() {
  if(this.isCreativeExists()) {
    this._videoSlot.muted = this._options.muted;

    if (this._isVPAID) {
      this._isCreativeFunctionInvokable('startAd') && this._vpaidCreative.startAd();
    } else {

      //this._videoSlot.autoplay = true;
      this._videoSlot.load();
      this._videoSlot.play();

      this.onAdStarted();

    }
  }
}
AdsManager.prototype.getDuration = function() {
  return this.isCreativeExists() && this._attributes.duration;
}
AdsManager.prototype.pause = function() {
  if(this.isCreativeExists()) {
    if (this._isVPAID) {
      this._isCreativeFunctionInvokable('pauseAd') && this._vpaidCreative.pauseAd();
    } else {
      this._videoSlot.pause();
      this.onAdPaused();
    }
  }
}
AdsManager.prototype.resume = function() {
  if(this.isCreativeExists()) {
    if (this._isVPAID) {
      this._isCreativeFunctionInvokable('resumeAd') && this._vpaidCreative.resumeAd();
    } else {
      this._videoSlot.play();
      this.onAdPlaying();
    }
  }
}
AdsManager.prototype.stop = function() {
  if(this.isCreativeExists()) {
    if (this._isVPAID) {
      this._isCreativeFunctionInvokable('stopAd') && this._vpaidCreative.stopAd();
    } else {
      this.onAdStopped();
    }
  }
}
AdsManager.prototype.skip = function() {
  if(this.isCreativeExists()) {
    if (this._isVPAID) {
      this._isCreativeFunctionInvokable('skipAd') && this._vpaidCreative.skipAd();
    } else {
      this.onAdSkipped();
    }
  }
}
AdsManager.prototype.resize = function(width, height, viewMode) {
  if(this.isCreativeExists()) {

    this._attributes.width = width;
    this._attributes.height = height;
    this._attributes.viewMode = viewMode;

    // Resize slot
    this.resizeSlot(this._attributes.width, this._attributes.height);

    if (this._isVPAID) {
      this._isCreativeFunctionInvokable('resizeAd') && this._vpaidCreative.resizeAd(width, height, viewMode);
    } else {
      this.onAdSizeChange();
    }
  }
}
AdsManager.prototype.getVolume = function() {
  if(this.isCreativeExists()) {
    if (this._isVPAID) {
      return this._isCreativeFunctionInvokable('getAdVolume') ? this._vpaidCreative.getAdVolume() : -1;
    }
    return this._videoSlot.volume;
  }
}
AdsManager.prototype.setVolume = function(value) {
  if(this.isCreativeExists()) {
    if (this._isVPAID) {
      this._isCreativeFunctionInvokable('setAdVolume') && this._vpaidCreative.setAdVolume(value);
    } else {
      const isVolumeChanged = value !== this._videoSlot.volume;
      if(isVolumeChanged) {
        this._attributes.volume = value;
        this._videoSlot.volume = value;
        this.onAdVolumeChange();
      }
    }
  }
}
AdsManager.prototype.getRemainingTime = function() {
  if(this.isCreativeExists()) {
    if (this._isVPAID) {
      return this._isCreativeFunctionInvokable('getAdRemainingTime') ? this._vpaidCreative.getAdRemainingTime() : -1
    }
    return this._attributes.remainingTime;
  }
}
AdsManager.prototype.collapse = function() {
  if(this.isCreativeExists()) {
    if(this._isVPAID) {
      this._isCreativeFunctionInvokable('collapseAd') && this._vpaidCreative.collapseAd();
    }
  }
}
AdsManager.prototype.expand = function() {
  if(this.isCreativeExists()) {
    if(this._isVPAID) {
      this._isCreativeFunctionInvokable('expandAd') && this._vpaidCreative.expandAd();
    }
  }
}
AdsManager.prototype.abort = function(reCreateSlot = true) {

  if(this._isDestroyed) {
    return;
  }

  // Removes ad assets loaded at runtime that need to be properly removed at the time of ad completion
  // and stops the ad and all tracking.

  // Stop and clear timeouts, intervals
  this.stopVASTMediaLoadTimeout();
  this.stopVPAIDProgress();

  if(this._isVPAID) {
    // Unsubscribe for VPAID events
    this.removeCallbacksForCreative(this._creativeEventCallbacks);
    this.removeCreativeAsset();
  }

  // Reset global variables to default values
  this._nextQuartileIndex = 0;

  this._isVPAID = false;

  this._hasLoaded = false;
  this._hasError = false;
  this._hasImpression = false;
  this._hasStarted = false;

  this._ad = null;
  this._creative = null;
  this._mediaFile = null;
  this._vpaidCreative = null;
  this._vastTracker = null;

  // Remove slot
  this.removeSlot();

  if(reCreateSlot) {
    // Re-create slot
    this.createSlot();
  }

}
AdsManager.prototype.destroy = function() {

  if(this._isDestroyed) {
    return;
  }

  // Cleans up the internal state, abort anything that is currently doing on with the AdsManager
  // and reset to a default state.

  // Reset the internal state of AdsManager
  this.abort(false);
  // Remove event listeners
  this.removeEventListeners(this._eventCallbacks);
  // Remove slot element from the DOM
  this.removeSlot();

  this._adContainer = null;
  this._slot = null;
  this._videoSlot = null;

  this._isDestroyed = true;

}
AdsManager.prototype.isDestroyed = function() {
  return this._isDestroyed;
}
AdsManager.prototype.getVersion = function() {
  return this._attributes.version;
}

export { AdsManager }
