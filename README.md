
[![license](https://badgen.net/github/license/basil79/ads-manager)](https://badgen.net/github/license/basil79/ads-manager)

# ads-manager

> HTML5 Video Ads Manager based on vast-client-js and IMA SDK

This README is for developers who want to use and/or contribute to ads-manager.

**Table of Contents**

- [Usage](#Usage)
- [Install](#Install)
- [Build](#Build)
- [Run](#Run)
- [Contribute](#Contribute)


## Usage

```javascript
import { AdsManager } from './ads-manager';

// Get your video element
let videoElement = document.getElementById('video');
// Get your HTML element for ad-container
let adContainer = document.getElementById('ad-container');
// Define ads manager and pass ad container
const adsManager = new AdsManager(adContainer);
// Subscribe for events
// AdsManagerLoaded
adsManager.addEventListener('AdsManagerLoaded', function() {
  // Get height and width of your video element
  let width = videoElement.clientWidth;
  let height = videoElement.clientHeight;
  let viewMode = 'normal'; // fullscreen
  // Init
  try {
    adsManager.init(width, height, viewMode);
  } catch (adError) {
    // Play your context without ads, if an error occurs
  }
});
// AdError
adsManager.addEventListener('AdError', function(adError) {
  if(adsManager) {
    adsManager.destroy();
  }
  // ... 
});
// AdLoaded
adsManager.addEventListener('AdLoaded', function(adEvent) {
  // Ad loaded, awaiting start
  // Check if ad type is linear
  if(adEvent.type === 'linear') {
    try {
      // Start ad
      adsManager.start();
    } catch (adError) {
      // Play video content without ads in case of error
    }
  } else {
    // Ad is not linear
  }
});
// AdStarted
adsManager.addEventListener('AdStarted', function() {
  // Pause your video content
  videoElement.pause();
});
// ...
// AdDurationChange
// AdSizeChange
// AdVideoStart
// AdImpression
// AdVideoFirstQuartile
// AdVideoMidpoint
// AdVideoThirdQuartile
// AdVideoComplete
// AdPaused
// AdPlaying
// AdStopped
// AdSkipped
// AdClickThru
// ...
// AllAdsCompleted
adsManager.addEventListener('AllAdsCompleted', function() {
  // Play your video content
  videoElement.play();
});


// VAST tag url
let vastUrl = 'your VAST tag url';
// Request Ads
adsManager.requestAds(vastUrl);
```

## Install

    $ git clone https://github.com/basil79/ads-manager
    $ cd ads-manager
    $ npm ci


### Supported Browsers

ads-manager is supported all modern browsers.
