# AdsManager

**Table Content**

- [Constructor](#constructor)
- [Methods](#public-methods)
  - [requestAds](#requestadsvasturl-options)


## Constructor

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

## Public Methods

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
