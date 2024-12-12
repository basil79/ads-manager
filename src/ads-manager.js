import { VASTClient, VASTParser, VASTTracker } from '@dailymotion/vast-client';
import AdError from './ad-error';
import Ad from './ad';

function AdsManager(adContainer) {

  if(!(adContainer && (adContainer instanceof HTMLElement
    || adContainer.getRootNode))) {
    throw new Error('ad container is not defined');
  }

  // Ad Container
  /** @private */
  this._adContainer = adContainer;

  // Own Slot
  this._ownSlot = null;
  // Video Slot
  this._videoSlot = null;
  // Slot
  this._slot = null;

  // Create Own Slot
  this.createOwnSlot();

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
    desiredBitrate: -1, // 268,
    duration: 10,
    remainingTime: 10,
    currentTime: 0,
    volume: 0,
    version: '!!#Version#!!'
  };

  // Quartile Events
  this._quartileEvents = [
    { event: 'AdImpression', value: 0 },
    { event: 'AdVideoStart', value: 0 },
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
    VAST_MALFORMED_RESPONSE:100,
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
    VAST_MALFORMED_RESPONSE: 'VAST response was malformed and could not be parsed.', // 100
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
    VPAID_CREATIVE_ERROR: 'An unexpected error occurred within the VPAID creative. Refer to the inner error for more info.' // 901 TODO:
  };
  // Errors
  this.ERRORS = {
    VAST_MALFORMED_RESPONSE: new AdError(this.ERROR_MESSAGES.VAST_MALFORMED_RESPONSE, this.ERROR_CODES.VAST_MALFORMED_RESPONSE),
    VAST_EMPTY_RESPONSE: new AdError(this.ERROR_MESSAGES.VAST_EMPTY_RESPONSE, this.ERROR_CODES.VAST_EMPTY_RESPONSE),
    VAST_ASSET_NOT_FOUND: new AdError(this.ERROR_MESSAGES.VAST_ASSET_NOT_FOUND, this.ERROR_CODES.VAST_ASSET_NOT_FOUND),
    VAST_LINEAR_ASSET_MISMATCH: new AdError(this.ERROR_MESSAGES.VAST_LINEAR_ASSET_MISMATCH, this.ERROR_CODES.VAST_LINEAR_ASSET_MISMATCH),
    VAST_LOAD_TIMEOUT: new AdError(this.ERROR_MESSAGES.VAST_LOAD_TIMEOUT, this.ERROR_CODES.VAST_LOAD_TIMEOUT),
    VAST_MEDIA_LOAD_TIMEOUT: new AdError(this.ERROR_MESSAGES.VAST_MEDIA_LOAD_TIMEOUT, this.ERROR_CODES.VAST_MEDIA_LOAD_TIMEOUT),
    VIDEO_PLAY_ERROR: new AdError(this.ERROR_MESSAGES.VIDEO_PLAY_ERROR, this.ERROR_CODES.VIDEO_PLAY_ERROR),
    VPAID_CREATIVE_ERROR: new AdError(this.ERROR_MESSAGES.VPAID_CREATIVE_ERROR, this.ERROR_CODES.VPAID_ERROR)
  };

  this._vastClient = null;
  this._vastParser = null;
  this._vastTracker = null;

  this._ad = null;
  this._adPod = null;
  this._isAdPod = false;

  this._creative = null;
  this._mediaFiles = null;
  this._mediaFileIndex = 0;
  this._mediaFile = null;

  this._isVPAID = false;
  this._vpaidIframe = null;
  this._vpaidCreative = null;

  // Timers, Intervals
  this._vastMediaLoadTimer = null;
  this._vpaidProgressTimer = null;

  // Request ID
  this._requestId = null;

  // Handlers
  this._handleLoadCreativeMessage = this.handleLoadCreativeMessage.bind(this);
  // Slot handlers
  this._handleSlotClick = this.handleSlotClick.bind(this);
  // Video slot handlers
  this._handleVideoSlotError = this.handleVideoSlotError.bind(this);
  this._handleVideoSlotCanPlay = this.handleVideoSlotCanPlay.bind(this);
  this._handleVideoSlotVolumeChange = this.handleVideoSlotVolumeChange.bind(this);
  this._handleVideoSlotTimeUpdate = this.handleVideoSlotTimeUpdate.bind(this);
  this._handleVideoSlotLoadedMetaData = this.handleVideoSlotLoadedMetaData.bind(this);
  this._handleVideoSlotEnded = this.handleVideoSlotEnded.bind(this);

  this.MIN_VPAID_VERSION = 2;

  this._hasLoaded = false;
  this._hasError = false;
  this._hasImpression = false;
  this._hasStarted = false;

  this._isDestroyed = false;
};
AdsManager.prototype.createOwnSlot = function() {
  console.log('create slot......');
  this._ownSlot = document.createElement('div');
  this._ownSlot.style.position = 'absolute';
  //this._slot.style.display = 'none';
  this._adContainer.appendChild(this._ownSlot);
  this.createVideoSlot();
  this.createSlot();
};
AdsManager.prototype.removeSlot = function() {
  this._ownSlot.parentNode && this._ownSlot.parentNode.removeChild(this._ownSlot);
};
AdsManager.prototype.showSlot = function() {
  // Check if video slot has src, if no then hide video slot
  if(this._videoSlot.src === '') {
    this.hideVideoSlot();
  }
  // Show slot
  this._ownSlot.style.display = 'block';
};
AdsManager.prototype.hideSlot = function() {
  // Hide slot
  this._ownSlot.style.display = 'none';
};
AdsManager.prototype.resizeSlot = function(width, height) {
  this._ownSlot.style.width = width + 'px';
  this._ownSlot.style.height = height + 'px';
};
AdsManager.prototype.createVideoSlot = function() {
  this._videoSlot = document.createElement('video');
  this._videoSlot.setAttribute('webkit-playsinline', true);
  this._videoSlot.setAttribute('playsinline', true);
  //this._videoSlot.setAttribute('preload', 'none');
  this._videoSlot.style.width = '100%';
  this._videoSlot.style.height = '100%';
  this._videoSlot.style.backgroundColor = 'rgb(0, 0, 0)';
  this._videoSlot.style.display = 'none';

  const that = this;

  // Overwrite getter/setter of src
  const _src = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'src');
  Object.defineProperty(this._videoSlot, 'src', {
    set: function(value) {
      _src.set.call(this, value);
      console.log('video src changed', value);
      that.showHideVideoSlot();
    },
    get: _src.get
  });
  // Override setAttribute function
  const _setAttribute = this._videoSlot.setAttribute;
  this._videoSlot.setAttribute = function() {
    const value = _setAttribute.apply(this, [].slice.call(arguments))
    if(arguments[0] === 'src') {
      console.log('video setAttribute src', arguments[1]);
      that.showHideVideoSlot();
    }
    return value;
  }

  //this._adContainer.appendChild(this._videoSlot);
  this._ownSlot.appendChild(this._videoSlot);
};
AdsManager.prototype.createSlot = function() {
  this._slot = document.createElement('div');
  this._slot.style.position = 'absolute';
  this._slot.style.top = '0px';
  this._slot.style.left = '0px';
  this._slot.style.right = '0px';
  this._slot.style.bottom = '0px';
  this._ownSlot.appendChild(this._slot);
};
AdsManager.prototype.hideVideoSlot = function() {
  console.log('hide video slot');
  this._videoSlot.style.display = 'none';
};
AdsManager.prototype.showVideoSlot = function() {
  console.log('show video slot');
  this._videoSlot.style.display = 'block';
};
AdsManager.prototype.showHideVideoSlot = function() {
  if(this._videoSlot.getAttribute('src') === '') {
    this.hideVideoSlot();
  } else {
    this.showVideoSlot();
  }
};
AdsManager.prototype.stopVASTMediaLoadTimeout = function() {
  if(this._vastMediaLoadTimer) {
    clearTimeout(this._vastMediaLoadTimer);
    this._vastMediaLoadTimer = null;
  }
};
AdsManager.prototype.startVASTMediaLoadTimeout = function() {
  this.stopVASTMediaLoadTimeout();
  this._vastMediaLoadTimer = setTimeout(() => {
    this.onAdError(this.ERRORS.VAST_MEDIA_LOAD_TIMEOUT.formatMessage(Math.floor((this._options.loadVideoTimeout / 1000) % 60)));
  }, this._options.loadVideoTimeout);
};
AdsManager.prototype.updateVPAIDProgress = function() {
  // Check remaining time
  this._attributes.remainingTime = this._isCreativeFunctionInvokable('getAdRemainingTime') ? this._vpaidCreative.getAdRemainingTime() : -1;
  if(!isNaN(this._attributes.remainingTime) && this._attributes.remainingTime !== 1) {
    this._attributes.currentTime = this._attributes.duration - this._attributes.remainingTime;
    // Track progress
    this._vastTracker.setProgress(this._attributes.currentTime);
  }
};
AdsManager.prototype.startVPAIDProgress = function() {
  this.stopVPAIDProgress();
  this._vpaidProgressTimer = setInterval(() => {
    if(this._isVPAID && this._vpaidCreative && this._vastTracker) {
      this.updateVPAIDProgress();
    } else {
      this.stopVPAIDProgress();
    }
  }, 1000);
};
AdsManager.prototype.stopVPAIDProgress = function() {
  if(this._vpaidProgressTimer) {
    clearInterval(this._vpaidProgressTimer);
    this._vpaidProgressTimer = null;
  }
};
AdsManager.prototype._callEvent = function(eventName) {
  if(eventName in this._eventCallbacks) {
    this._eventCallbacks[eventName]();
  }
};
AdsManager.prototype.addEventListener = function(eventName, callback, context) {
  const givenCallback = callback.bind(context);
  this._eventCallbacks[eventName] = givenCallback;
};
AdsManager.prototype.removeEventListener = function(eventName) {
  this._eventCallbacks[eventName] = null;
};
AdsManager.prototype.removeEventListeners = function(eventCallbacks) {
  for (const eventName in eventCallbacks) {
    eventCallbacks.hasOwnProperty(eventName) && this.removeEventListener(eventName);
  }
};
AdsManager.prototype.onAdsManagerLoaded = function() {
  this._callEvent(this.EVENTS.AdsManagerLoaded);
};
AdsManager.prototype.onAdLoaded = function() {
  this._hasLoaded = true;
  this.stopVASTMediaLoadTimeout();
  if (this.EVENTS.AdLoaded in this._eventCallbacks) {
    this._eventCallbacks[this.EVENTS.AdLoaded](new Ad(this._creative));
  }
};
AdsManager.prototype.onAdDurationChange = function() {
  if(this._isVPAID && this._vpaidCreative && this._vastTracker) {
    this._attributes.duration = this._isCreativeFunctionInvokable('getAdDuration') ? this._vpaidCreative.getAdDuration() : -1;
    if(this._attributes.duration !== -1) {
      this._vastTracker.setDuration(this._attributes.duration);
    }
  }
  this._callEvent(this.EVENTS.AdDurationChange);
};
AdsManager.prototype.onAdSizeChange = function() {
  this._callEvent(this.EVENTS.AdSizeChange);
};
AdsManager.prototype.onAdStarted = function() {
  this._hasStarted = true;
  this._callEvent(this.EVENTS.AdStarted);
};
AdsManager.prototype.onAdVideoStart = function() {
  if(this._isVPAID && this._vpaidCreative && this._vastTracker) {
    this.updateVPAIDProgress();
  }
  this._callEvent(this.EVENTS.AdVideoStart);
};
AdsManager.prototype.onAdStopped = function() {
  if(!this._hasStarted) {
    this.onAdError(this.ERRORS.VPAID_CREATIVE_ERROR);
  } else {
    if(this._isAdPod && this._adPod.length != 0) {

      this._nextQuartileIndex = 0;
      this._hasImpression = false;

      // Removes ad assets loaded at runtime that need to be properly removed at the time of ad completion
      // and stops the ad and all tracking.
      window.removeEventListener('message', this._handleLoadCreativeMessage);

      if(this._isVPAID) {
        // Unsubscribe for VPAID events
        this.removeCallbacksForCreative(this._creativeEventCallbacks);
        this.removeCreativeAsset();
        this._isVPAID = false;
      }

      // Remove handlers from slot and videoSlot
      this._removeHandlers();
      // Pause video slot, and remove src
      this._videoSlot.pause();
      this._videoSlot.removeAttribute('src'); // empty source
      this._videoSlot.load();

      setTimeout(() => {
        this._nextAd();
      },75);

    } else {
      this._callEvent(this.EVENTS.AdStopped);
      // abort the ad, unsubscribe and reset to a default state
      this._abort();
    }
  }
};
AdsManager.prototype.onAdSkipped = function() {
  this._callEvent(this.EVENTS.AdSkipped);
  // abort the ad, unsubscribe and reset to a default state
  this._abort();
};
AdsManager.prototype.onAdVolumeChange = function() {
  this._callEvent(this.EVENTS.AdVolumeChange);
};
AdsManager.prototype.onAdImpression = function() {
  console.log('is vpaid', this._isVPAID);
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
  this._callEvent(this.EVENTS.AdImpression);
};
AdsManager.prototype.onAdClickThru = function(url, id, playerHandles) {
  if(this._isVPAID && this._vpaidCreative && this._vastTracker) {
    this._vastTracker.click();
  }
  if (this.EVENTS.AdClickThru in this._eventCallbacks) {
    this._eventCallbacks[this.EVENTS.AdClickThru](url, id, playerHandles);
  }
};
AdsManager.prototype.onAdVideoFirstQuartile = function() {
  if(this._isVPAID && this._vpaidCreative && this._vastTracker) {
    this.updateVPAIDProgress();
  }
  this._callEvent(this.EVENTS.AdVideoFirstQuartile);
};
AdsManager.prototype.onAdVideoMidpoint = function() {
  if(this._isVPAID && this._vpaidCreative && this._vastTracker) {
    this.updateVPAIDProgress();
  }
  this._callEvent(this.EVENTS.AdVideoMidpoint);
};
AdsManager.prototype.onAdVideoThirdQuartile = function() {
  if(this._isVPAID && this._vpaidCreative && this._vastTracker) {
    this.updateVPAIDProgress();
  }
  this._callEvent(this.EVENTS.AdVideoThirdQuartile);
};
AdsManager.prototype.onAdPaused = function() {
  if(this._vastTracker) {
    this._vastTracker.setPaused(true);
  }
  this._callEvent(this.EVENTS.AdPaused);
};
AdsManager.prototype.onAdPlaying = function() {
  if(this._vastTracker) {
    this._vastTracker.setPaused(false);
  }
  this._callEvent(this.EVENTS.AdPlaying);
};
AdsManager.prototype.onAdVideoComplete = function() {
  if(this._isVPAID && this._vpaidCreative && this._vastTracker) {
    this._vastTracker.complete();
  }
  this._callEvent(this.EVENTS.AdVideoComplete);
};
AdsManager.prototype.onAllAdsCompleted = function() {
  this._callEvent(this.EVENTS.AllAdsCompleted);
};
AdsManager.prototype.onAdError = function(message) {

  this._hasError = true;
  /*
  // Stop and clear timeouts, intervals
  this.stopVASTMediaLoadTimeout();
  this.stopVPAIDProgress();
   */
  this.abort();

  if (this.EVENTS.AdError in this._eventCallbacks) {
    this._eventCallbacks[this.EVENTS.AdError](typeof message !== 'object' ? new AdError(message) : message);
  }
};
AdsManager.prototype.onAdLog = function(message) {
  if (this.EVENTS.AdLog in this._eventCallbacks) {
    this._eventCallbacks[this.EVENTS.AdLog](message);
  }
};
AdsManager.prototype.processVASTResponse = function(res) {

  const ads = res.ads;
  if(ads.length != 0) {

    if(ads.length > 1) {
      // Ad pod
      this._isAdPod = true;
      console.log('ads', ads);
      // Filter by sequence
      this._adPod = ads.sort(function(a, b) {
        const aSequence = a.sequence;
        const bSequence = b.sequence;
        if (aSequence === bSequence) {
          return 0;
        } else if (aSequence === null) {
          return 1;
        } else if (bSequence === null) {
          return -1;
        }
        return (aSequence < bSequence) ? -1 : (aSequence > bSequence) ? 1 : 0;
      });

      // Shift from adPod array
      this._ad = this._adPod.shift();
    } else {
      // Ad
      this._ad = ads[0];
    }

    // Process ad
    this._processAd();

  } else {
    // The VAST response document is empty.
    this.onAdError(this.ERRORS.VAST_EMPTY_RESPONSE);
  }
};
AdsManager.prototype.requestAds = function(vastUrl, options = {}) {

  if(this._isDestroyed) {
    return;
  }

  // Generate request Id
  this._requestId = new Date().getTime();

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
    resolveAll: this._options.resolveAll,
    //allowMultipleAds: true,
    //followAdditionalWrappers: true,
  };

  // Abort
  this.abort();

  // Check if vastUrl exists
  if(vastUrl && typeof vastUrl === 'string') {

    let isURL = false;
    try {
      new URL(vastUrl);
      isURL = true;
    } catch (e) {}

    if (isURL) {
      // use VAST URL
      this._vastClient = new VASTClient();
      this._vastClient
        .get(vastUrl, vastOptions)
        .then(res => {
          console.log('RES', res);
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
          console.log('RES', res);
          this.processVASTResponse(res);
        })
        .catch(err => {
          this.onAdError(err.message);
        });
    }
  } else {
    this.onAdError('VAST URL/XML is empty');
  }
};
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
};
AdsManager.prototype.supportsVideo = function() {
  return !!document.createElement('video').canPlayType;
};
AdsManager.prototype.supportsH264BaselineVideo = function() {
  if(!this.supportsVideo()) return false;
  return document.createElement('video').canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"');
};
AdsManager.prototype.supportsOggTheoraVideo = function() {
  if(!this.supportsVideo()) return false;
  return document.createElement('video').canPlayType('video/ogg; codecs="theora, vorbis"');
};
AdsManager.prototype.supportsWebmVideo = function() {
  if(!this.supportsVideo()) return false;
  return document.createElement('video').canPlayType('video/webm; codecs="vp8, vorbis"');
};
AdsManager.prototype.supportsThreeGPVideo = function() {
  if(!this.supportsVideo()) return false;
  return document.createElement('video').canPlayType('video/3gpp; codecs="mp4v.20.8, samr"');
};
AdsManager.prototype.handshakeVersion = function(version) {
  return this._vpaidCreative.handshakeVersion(version);
};
AdsManager.prototype._isCreativeFunctionInvokable = function(a) {
  return this._vpaidCreative ? (a = this._vpaidCreative[a]) && typeof a === 'function' : false;
};
AdsManager.prototype.checkVPAIDInterface = function(a) {
  const b = { passed: true, missingInterfaces: ''};
  for (let d = a.length - 1; 0 <= d; d--)
    this._isCreativeFunctionInvokable(a[d]) || (b.passed = false, b.missingInterfaces += a[d] + ' ');
  return b;
};
AdsManager.prototype.setCallbacksForCreative = function(eventCallbacks, context) {
  for (const event in eventCallbacks) eventCallbacks.hasOwnProperty(event) && this._vpaidCreative.subscribe(eventCallbacks[event], event, context)
};
AdsManager.prototype.removeCallbacksForCreative = function(eventCallbacks) {
  if(this._vpaidCreative !== null) {
    for (const event in eventCallbacks) {
      eventCallbacks.hasOwnProperty(event) && this._vpaidCreative.unsubscribe(event); // && this._vpaidCreative.unsubscribe(eventCallbacks[event], event);
    }
  }
};
AdsManager.prototype.creativeAssetLoaded = function() {
  const checkVPAIDMinVersion = () => {
    const c = this.handshakeVersion(this.MIN_VPAID_VERSION.toFixed(1));
    return c ? parseFloat(c) < this.MIN_VPAID_VERSION ? (this.onAdError('Only support creatives with VPAID version >= ' + this.MIN_VPAID_VERSION.toFixed(1)), !1) : !0 : (this.onAdError('Cannot get VPAID version from the creative'), !1)
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
    console.log('creativeData', creativeData);
    const environmentVars = {
      slot: this._slot,
      videoSlot: this._videoSlot,
      videoSlotCanAutoPlay: true
    };
    // iniAd(width, height, viewMode, desiredBitrate, creativeData, environmentVars)
    // Start loadVideoTimeout
    this.startVASTMediaLoadTimeout();
    try {
      this._vpaidCreative.initAd(width, height, this._attributes.viewMode, this._attributes.desiredBitrate, creativeData, environmentVars);
    } catch(err) {
      this.onAdError(err);
    }
  }
};
AdsManager.prototype.handleLoadCreativeMessage = function(msg) {
  if (msg && msg.data) {
    const match = String(msg.data).match(new RegExp('adm:' + this._requestId + '://(.*)'));
    if (match) {
      console.log('vpaid creative message', match);
      const value = JSON.parse(match[1]);
      if(value == 'load') {
        console.log('vpaid message load', this._requestId);
        try {
          let VPAIDAd = this._vpaidIframe.contentWindow.getVPAIDAd;
          if (VPAIDAd && typeof VPAIDAd === 'function') {
            VPAIDAd = VPAIDAd();
            console.log('vpaid', typeof VPAIDAd);
            typeof VPAIDAd === 'undefined'
              ? this.onAdError('getVPAIDAd() returns undefined value')
              : VPAIDAd == null
                ? this.onAdError('getVPAIDAd() returns null')
                : ((this._vpaidCreative = VPAIDAd),
                  this.creativeAssetLoaded());
          } else {
            this.onAdError('getVPAIDAd() is undefined');
          }
        } catch (e) {
          this.onAdError(e);
        }
      } else if (value == 'error') {
        this.onAdError('Error load VPAID');
      }
    }
  }
};
AdsManager.prototype.loadCreativeAsset = function(fileURL) {

  console.log('vpaid creative asset', fileURL);
  window.addEventListener('message', this._handleLoadCreativeMessage);

  // Create iframe
  this._vpaidIframe = document.createElement('iframe');
  this._vpaidIframe.style.display = 'none';
  this._vpaidIframe.style.width = '0px';
  this._vpaidIframe.style.height = '0px';

  // Append iframe
  this._adContainer.appendChild(this._vpaidIframe);

  // Open iframe, write and close
  this._vpaidIframe.contentWindow.document.open();
  this._vpaidIframe.contentWindow.document.write(`
<script>function sendMessage(msg) {
  var postMsg = 'adm:${this._requestId}://' + JSON.stringify(msg);
  window.parent.postMessage(postMsg, '*');
} \x3c/script>
<script type="text/javascript" onload="sendMessage('load')" onerror="sendMessage('error')" src="${fileURL}"> \x3c/script>`);
  this._vpaidIframe.contentWindow.document.close();
};
AdsManager.prototype.removeCreativeAsset = function() {
  // Remove VPAID iframe
  console.log('remove vpaid iframe');
  if(this._vpaidIframe) {
    this._vpaidIframe.parentNode.removeChild(this._vpaidIframe);
  }

  // Remove 3rd-party HTML elements from the own slot
  console.log('remove 3rd-party HTML elements from the own slot');
  [...this._ownSlot.children]
    .forEach(child => {
      console.log(child !== this._videoSlot);
      child !== this._videoSlot && child !== this._slot ? this._ownSlot.removeChild(child) : null
    });
  console.log('remove 3rd-party HTML elements from the slot');
  // Remove 3rd-party HTML element from the slot
  [...this._slot.children]
    .forEach(child => {
      this._slot.removeChild(child)
    });
};
AdsManager.prototype._removeHandlers = function() {
  // Remove event listeners from slot
  this._ownSlot.removeEventListener('click', this._handleSlotClick);

  // Remove event listeners from video slot
  this._videoSlot.removeEventListener('error', this._handleVideoSlotError, false);
  this._videoSlot.removeEventListener('canplay', this._handleVideoSlotCanPlay);
  this._videoSlot.removeEventListener('volumechange', this._handleVideoSlotVolumeChange);
  this._videoSlot.removeEventListener('timeupdate', this._handleVideoSlotTimeUpdate, true);
  this._videoSlot.removeEventListener('loadedmetadata', this._handleVideoSlotLoadedMetaData);
  this._videoSlot.removeEventListener('ended', this._handleVideoSlotEnded);
};
AdsManager.prototype._abort = function() {
  // Abort
  this.abort();
  // Dispatch AllAdsCompleted
  this.onAllAdsCompleted();
};
AdsManager.prototype.isCreativeExists = function() {
  return this._creative && this._creative.mediaFiles.length != 0;
};
AdsManager.prototype.handleSlotClick = function() {
  if(!this._isVPAID && this._vastTracker) {
    this._vastTracker.click();
  }
};
AdsManager.prototype.handleVideoSlotError = function() {
  this.onAdError(this.ERRORS.VIDEO_PLAY_ERROR);
};
AdsManager.prototype.handleVideoSlotCanPlay = function() {
  console.log('video slot can play...');
};
AdsManager.prototype.handleVideoSlotVolumeChange = function(event) {
  this._vastTracker && this._vastTracker.setMuted(event.target.muted);
};
AdsManager.prototype.handleVideoSlotTimeUpdate = function(event) {
  if(this.isCreativeExists()) {

    if (this._nextQuartileIndex >= this._quartileEvents.length) {
      return;
    }

    const percentPlayed = (event.target.currentTime / event.target.duration) * 100; //event.target.currentTime * 100.0 / event.target.duration;
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
    console.log('percentPlayed', percentPlayed, event.target.currentTime, event.target.duration);
    this._vastTracker && this._vastTracker.setProgress(event.target.currentTime);
    if (event.target.duration > 0) {
      this._attributes.remainingTime = event.target.duration - event.target.currentTime;
    }
  }
};
AdsManager.prototype.handleVideoSlotLoadedMetaData = function(event) {
  this._attributes.duration = event.target.duration;
  // Update tracking duration with real media meta data
  this._vastTracker && this._vastTracker.setDuration(event.target.duration);
  //if(!this._isVPAID) {
  this.onAdDurationChange();
  //}
};
AdsManager.prototype.handleVideoSlotEnded = function() {
  // Complete
  this._vastTracker && this._vastTracker.complete();
  //setTimeout(() => {
  this.onAdStopped();
  //}, 75);
};
AdsManager.prototype._processAd = function(isNext = false) {

  // Filter linear creatives, get first
  this._creative = this._ad.creatives.filter(creative => creative.type === 'linear')[0];
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
        const aHeight = a.height;
        const bHeight = b.height;
        return (aHeight < bHeight) ? -1 : (aHeight > bHeight) ? 1 : 0;
      });

      if(this._mediaFiles && this._mediaFiles.length != 0) {
        // Initialize VASTTracker for tracking events
        this._vastTracker = new VASTTracker(null, this._ad, this._creative);
        this._vastTracker.load();

        if(!isNext) {
          // If not VPAID dispatch AdsManagerLoaded event -> ad is ready for init
          this.onAdsManagerLoaded();
        } else {
          this.init(this._attributes.width, this._attributes.height, this._attributes.viewMode, isNext);
        }
      } else {
        // Linear assets were found in the VAST ad response, but none of them match the video player's capabilities.
        this.onAdError(this.ERRORS.VAST_LINEAR_ASSET_MISMATCH);
      }

    } else {
      // No assets were found in the VAST ad response.
      this.onAdError(this.ERRORS.VAST_ASSET_NOT_FOUND);
    }
  } else {
    // Non-Linear
    console.log('non linear');
    this.onAdError('non linear');
  }
};
AdsManager.prototype._nextAd = function() {
  // Shift next ad
  this._ad = this._adPod.shift();
  console.log('next ad', this._ad);
  // Process ad
  this._processAd(true);
};
AdsManager.prototype.init = function(width, height, viewMode, isNext = false) {

  console.log('init....');

  if(this._isDestroyed) {
    return;
  }

  if(this.isCreativeExists()) {

    if(!isNext) {
      if (this._options.muted) {
        this._videoSlot.muted = true;
        this._videoSlot.volume = 0;
      }
    }

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

      this._videoSlot.addEventListener('error', this._handleVideoSlotError, false);

      if(this._isVPAID) {
        // VPAID
        this.loadCreativeAsset(this._mediaFile.fileURL);
      } else {

        // VAST
        this._ownSlot.addEventListener('click', this._handleSlotClick);

        // Ad video slot event listeners
        this._videoSlot.addEventListener('canplay', this._handleVideoSlotCanPlay);
        this._videoSlot.addEventListener('volumechange', this._handleVideoSlotVolumeChange);
        this._videoSlot.addEventListener('timeupdate', this._handleVideoSlotTimeUpdate, true);
        this._videoSlot.addEventListener('loadedmetadata', this._handleVideoSlotLoadedMetaData);
        this._videoSlot.addEventListener('ended', this._handleVideoSlotEnded);

        // Set video slot src
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
};
AdsManager.prototype.start = function() {
  if(this.isCreativeExists()) {

    // Override play function
    // Backup origin play function
    const _play = this._videoSlot.play;
    const maxPlayRetries = 3;
    let playRetries = 0;
    this._videoSlot.play = function() {
      //this.muted = true;
      // Apply origin play, and connect to play Promise to detect autoplay exceptions
      const _playPromise = _play.apply(this, [].slice.call(arguments));
      if(_playPromise instanceof Promise) {
        _playPromise.then(_=> {
          // Autoplay worked!
          console.log('autoplay worked!!!', this);
        }).catch(err => {
          // Autoplay failed
          if(playRetries <= maxPlayRetries) {
            // Try to play as muted if failed in autoplay
            console.log('autoplay failed > play retries', playRetries);
            this.muted = true;
            this.play();

            playRetries++;
          }
        });
      }
      return _playPromise;
    };

    if (this._isVPAID) {
      this._isCreativeFunctionInvokable('startAd') && this._vpaidCreative.startAd();
    } else {

      //this._videoSlot.autoplay = true;
      this._videoSlot.load();
      this._videoSlot.play();

      this.onAdStarted();

    }
  }
};
AdsManager.prototype.getDuration = function() {
  return this.isCreativeExists() && this._attributes.duration;
};
AdsManager.prototype.pause = function() {
  if(this.isCreativeExists()) {
    if (this._isVPAID) {
      this._isCreativeFunctionInvokable('pauseAd') && this._vpaidCreative.pauseAd();
    } else {
      this._videoSlot.pause();
      this.onAdPaused();
    }
  }
};
AdsManager.prototype.resume = function() {
  if(this.isCreativeExists()) {
    if (this._isVPAID) {
      this._isCreativeFunctionInvokable('resumeAd') && this._vpaidCreative.resumeAd();
    } else {
      this._videoSlot.play();
      this.onAdPlaying();
    }
  }
};
AdsManager.prototype.stop = function() {
  if(this.isCreativeExists()) {
    if (this._isVPAID) {
      this._isCreativeFunctionInvokable('stopAd') && this._vpaidCreative.stopAd();
    } else {
      this.onAdStopped();
    }
  }
};
AdsManager.prototype.skip = function() {
  if(this.isCreativeExists()) {
    if (this._isVPAID) {
      this._isCreativeFunctionInvokable('skipAd') && this._vpaidCreative.skipAd();
    } else {
      this.onAdSkipped();
    }
  }
};
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
};
AdsManager.prototype.getVolume = function() {
  if(this.isCreativeExists()) {
    if (this._isVPAID) {
      return this._isCreativeFunctionInvokable('getAdVolume') ? this._vpaidCreative.getAdVolume() : -1;
    }
    // on iOS the video slot volume is always 1 even if the video slot is muted,
    // if video slot is muted, return 0, otherwise volume
    return this._videoSlot.muted ? 0 : this._videoSlot.volume;
  }
};
AdsManager.prototype.setVolume = function(volume) {
  if(this.isCreativeExists()) {
    if (this._isVPAID) {
      this._isCreativeFunctionInvokable('setAdVolume') && this._vpaidCreative.setAdVolume(volume);
    }
    const isVolumeChanged = volume !== this.getVolume();
    this._attributes.volume = volume;
    if(this._attributes.volume !== 0) {
      this._videoSlot.muted = false;
    } else {
      this._videoSlot.muted = true;
    }
    this._videoSlot.volume = this._attributes.volume;
    if(isVolumeChanged) {
      this.onAdVolumeChange();
    }
  }
};
AdsManager.prototype.getRemainingTime = function() {
  if(this.isCreativeExists()) {
    if (this._isVPAID) {
      return this._isCreativeFunctionInvokable('getAdRemainingTime') ? this._vpaidCreative.getAdRemainingTime() : -1
    }
    return this._attributes.remainingTime;
  }
};
AdsManager.prototype.collapse = function() {
  if(this.isCreativeExists()) {
    if(this._isVPAID) {
      this._isCreativeFunctionInvokable('collapseAd') && this._vpaidCreative.collapseAd();
    }
  }
};
AdsManager.prototype.expand = function() {
  if(this.isCreativeExists()) {
    if(this._isVPAID) {
      this._isCreativeFunctionInvokable('expandAd') && this._vpaidCreative.expandAd();
    }
  }
};
AdsManager.prototype.abort = function() {

  if(this._isDestroyed) {
    return;
  }

  // Removes ad assets loaded at runtime that need to be properly removed at the time of ad completion
  // and stops the ad and all tracking.
  window.removeEventListener('message', this._handleLoadCreativeMessage);

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
  this._adPod = null;
  this._isAdPod = false;

  this._creative = null;
  this._mediaFile = null;
  this._vpaidCreative = null;
  this._vastTracker = null;

  // Remove handlers from slot and videoSlot
  this._removeHandlers();

  // Pause video slot, and remove src
  this._videoSlot.pause();
  this._videoSlot.removeAttribute('src'); // empty source
  this._videoSlot.load();

  // Hide slot
  //this.hideSlot();
  this.hideVideoSlot();

};
AdsManager.prototype.destroy = function() {

  if(this._isDestroyed) {
    return;
  }

  // Cleans up the internal state, abort anything that is currently doing on with the AdsManager
  // and reset to a default state.

  // Reset the internal state of AdsManager
  this.abort();
  // Remove event listeners
  this.removeEventListeners(this._eventCallbacks);
  // Remove slot element from the DOM
  this.removeSlot();

  this._adContainer = null;
  this._ownSlot = null;
  this._videoSlot = null;
  this._slot = null;

  this._isDestroyed = true;

};
AdsManager.prototype.isDestroyed = function() {
  return this._isDestroyed;
};
AdsManager.prototype.getVersion = function() {
  return this._attributes.version;
};

export default AdsManager
