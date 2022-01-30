# AdsManager

**Table of Contents**

- [Constructor](#constructor)
- [Methods](#public-methods)
  - [getVersion](#getversion-string)
  - [addEventListener](#addeventlistenereventname-callback)
  - [removeEventListener](#removeeventlistenereventname)
  - [requestAds](#requestadsvasturl-options)
  - [init](#initwidth-height-viewmode)
  - [start](#start)
  - [pause](#pause)
  - [resume](#resume)
  - [stop](#stop)
  - [skip](#skip)
  - [resize](#resizewidth-height-viewmode)
  - [getDuration](#getduration-number)
  - [getRemainingTime](#getremainingtime-number)
  - [getVolume](#getvolume-number)
  - [setVolume](#setvolumevolume)
  - [destroy](#destroy)
- [Events](#events)


## Constructor

The constructor signature is:

```Javascript
constructor(adContainer)
```

#### Parameter

- **`adContainer: HTMLElement`** - (required) HTML element of the ad container

#### Example

```Javascript
import { AdsManager } from 'ads-manager';

const adContainer = document.getElementById('ad-container');
// Define ads manager
const adsManager = new AdsManager(adContainer);
```

## Public Methods

### getVersion(): String

Get the version of `AdsManager`.

#### Returns

- **`String`** - The current version of `AdsManager`.

### addEventListener(eventName, callback)

Register a listener to a particular event.

#### Parameters

- **`eventName: String`** - Event name
- **`callback: Function`** - Callback

### removeEventListener(eventName)

Remove a listener for a particular event.

#### Parameter

- **`eventName: String`** - Event name

### requestAds(vastUrl, options)

Request ads from a server.

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

Call init to initialize the ad experience on the ads manager. 

#### Parameters

- **`width: Number`** - The desired width of the ad.
- **`height: Number`** - The desired height of the ad.
- **`viewMode: String`** - The desired view mode. Value must not be null. Possible values (`"normal"`, `"thumbnail"` or `"fullscreen"`). Width and height are not required when
  viewMode is fullscreen.

### start()

Start playing the ads.

### pause()

Pauses the current ad that is playing.

### resume()

Resumes the current ad that is loaded and paused.

### stop()

Stop playing the ads. Calling this will get publisher back to the content.

### skip()

Skips the current ad, after the skip is completed the `AdsManager` fires an `AdSkipped` event.

### resize(width, height, viewMode)

Resizes the current ad. After the resize is completed the `AdsManager` fires an `AdSizeChange` event.

#### Parameters

- **`width: Number`** - New ad slot width.
- **`height: Number`** - New ad slot height.
- **`viewMode: String`** - The new view mode. Value must not be null. Possible values (`"normal"`, `"thumbnail"` or `"fullscreen"`). Width and height are not required when
  viewMode is fullscreen.

### getDuration(): Number

Get the duration of the current ad.

- **`Number`** - The duration of the current ad.

### getRemainingTime(): Number

Get the remaining time of the current ad that is playing. If the ad is not loaded yet or has finished playing, the API would return `-1`.

#### Returns

- **`Number`** - Returns the time remaining for current ad. If the remaining time is `undefined` for the current ad (for example custom ads), the value returns `-1`.

### getVolume(): Number

Get the volume for the current ad.

#### Returns

- **`Number`** - The volume of the current ad, from `0` (muted) to `1` (loudest).

### setVolume(volume)

Set the volume for the current ad.

#### Parameter

- **`volume: Number`** - The volume to set, from `0` (muted) to `1` (loudest).

### destroy()

Removes ad assets loaded at runtime that need to be properly removed at the time of ad completion and stops the ad and all tracking.



## Events

| **Event**                 | **Description**                                                                          
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------
| `AdsManagerLoaded`        | Fired when the ads have been loaded and an AdsManager is available.   
| `AdError`                 | Fires when an error occurs.                                           
| `AdLoaded`                | Fired when ad data is available.
| `AdStarted`               | Fired when the ad starts playing.
| `AdDurationChange`        | Fired when the ad's duration changes.
| `AdSizeChange`            | Fired when the ad size has changed.
| `AdImpression`            | Fired when the impression URL has been pinged.
| `AdVideoStart`            | Fired when the ad is started.
| `AdVideoFirstQuartile`    | Fired when the ad playhead crosses first quartile.
| `AdVideoMidpoint`         | Fired when the ad playhead crosses midpoint.
| `AdVideoThirdQuartile`    | Fired when the ad playhead crosses third quartile.
| `AdVideoComplete`         | Fired when the ad completes playing.
| `AdPaused`                | Fired when the ad is paused.
| `AdPlaying`               | Fired when the ad is resumed.
| `AdStopped`               | Fired when the ad is stopped.
| `AdSkipped`               | Fired when the ad is skipped by the user.
| `AdClickThru`             | Fired when the ad is clicked.
| `AdVolumeChange`          | Fired when the ad volume has changed.
| `AllAdsCompleted`         | Fired when the ads manager is done playing all the valid ads in the ads response, or when the response doesn't return any valid ads.


