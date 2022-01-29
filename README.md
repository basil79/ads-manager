[![npm version](https://badgen.net/npm/v/ads-manager)](https://badgen.net/npm/v/ads-manager)
[![downloads per week](https://badgen.net/npm/dw/ads-manager)](https://badgen.net/npm/dw/ads-manager)
[![license](https://badgen.net/github/license/basil79/ads-manager)](https://badgen.net/github/license/basil79/ads-manager)

# ads-manager

> HTML5 Video Ads Manager based on @dailymotion/vast-client

This README is for developers who want to use and/or contribute to ads-manager.

**Table of Contents**

- [Usage](#Usage)
  - [Constructor](#constructor)
  - [Methods](#public-methods)
    - [requestAds](#requestadsvasturl-options)
- [Install](#Install)
- [Build](#Build)
- [Run](#Run)
- [Contribute](#Contribute)


## Usage

```javascript
import { AdsManager } from 'ads-manager';

// Get your video element
const videoElement = document.getElementById('video');
// Get your HTML element for ad container
const adContainer = document.getElementById('ad-container');
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
// AdImpression
// AdVideoStart
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

/*
// VAST XML
let vastXML = `<?xml version="1.0" encoding="UTF-8"?>
    <VAST version="2.0">
      <Error><![CDATA[http://example.com/empty-no-ad]]></Error>
    </VAST>`;
adsManager.requestAds(vastXML);
 */
```

### Constructor

The constructor signature is:

```Javascript
constructor(adContainer)
```

#### Parameters

- **`adContainer: HTMLElement`** - (required) HTML element of the ad container

#### Example

```Javascript
import { AdsManager } from 'ads-manager';

const adContainer = document.getElementById('ad-container');
// Define ads manager
const adsManager = new AdsManager(adContainer);
```

### Public Methods

### addEventListener(eventName, callback)

### removeEventListener(eventName)

### requestAds(vastUrl, options)

#### Parameters

- **`vastUrl: String`** - The url of the VAST tag, or VAST XML
- **`options: Object`** - An optional Object to configure the ad request
  - **`vastLoadTimeout: Number`** - VAST document load timeout (default `23000 ms`)
  - **`loadVideoTimeout: Number`** - VAST media file (assets) load timeout (default `8000 ms`)
  - **`withCredentials: Boolean`** - A boolean to enable the withCredentials options for the XHR URLHandler (default `false`)
  - **`wrapperLimit: Number`** - A number of Wrapper responses that can be received with no InLine response (default `10`)

#### Example

```Javascript
import { AdsManager } from 'ads-manager';

const adContainer = document.getElementById('ad-container');
const adsManager = new AdsManager(adContainer);
// ...
let vastUrl = 'http://v.ssp4.tv/pg/vast.xml';
// Request ads without options
adsManager.requestAds(vastUrl);
// ...
// Request ads with options
adsManager.requestAds(vastUrl, {
  loadVideoTimeout: 18000,
  wrapperLimit: 7
});
```

### init(width, height, viewMode)

### start()

### pause()

### resume()

### stop()

### skip()

### resize(with, height, viewMode)

### getDuration(): Number

### getVolume(): Number

### setVolume(value)

### getRemainingTime(): Number

### collapse()

### expand()

### destroy()

### Pre-bundled versions

#### Browser script

A pre-bundled version of ads-manager is available: [`ads-manager.js`](dist/ads-manager.js) [minified].

You can add the script directly to your page and access the library's components through the `ssp4.tv` object.

```html
<script src="ads-manager.js"></script>
```

```javascript
// Get your HTML element for ad container
let adContainer = document.getElementById('ad-container');
// Define ads manager and pass ad container
const adsManager = new ssp4.tv.AdsManager(adContainer);
```

## Install

### Get Started

ads-manager is available as an NPM package and can be easily installed with:

    $ npm i ads-manager 

### Using Git

    $ git clone https://github.com/basil79/ads-manager
    $ cd ads-manager
    $ npm ci


## Build

To build the project for development:
    
    $ npm run build:dev

To build the project for production:

    $ npm run build:prod

This will generate the following file:

+ `./dist/ads-manager.js` - Minified browser production code

## Run

    $ npm start

Then navigate to: http://localhost:8081 in your browser

### Supported Browsers

ads-manager is supported all modern browsers.

## Contribute

See [CONTRIBUTING](./CONTRIBUTING.md)
