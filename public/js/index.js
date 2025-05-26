(function() {



  var companioAdWrapper = document.getElementById('companion-ad-wrapper');
  function showCompanionAd() {
    companioAdWrapper.style.backgroundColor = '#000';
    companioAdWrapper.style.zIndex = '10';
    companioAdWrapper.style.pointerEvents = 'all';
  }
  function hideCompanionAd() {
    companioAdWrapper.style.backgroundColor = 'transparent';
    companioAdWrapper.style.zIndex = null;
    companioAdWrapper.style.pointerEvents = 'none';
  }

  var companionAdContainer = document.getElementById('companion-ad-container');
  var scalablePlacement = new ScalablePlacement(companionAdContainer);




  function renderCompanionAd(target, html, width, height) {
    console.log('render companion ad')
    const iframe = document.createElement('iframe');
    iframe.width = width || '100%';
    iframe.height = height || '100%';
    iframe.scrolling = 'no';
    iframe.marginWidth = '0';
    iframe.marginHeight = '0';
    iframe.frameBorder = '0';
    iframe.tabIndex = 0;
    iframe.style.border = '0';
    iframe.style.verticalAlign = 'bottom';
    iframe.src = 'about:blank';
    target.appendChild(iframe);
    //debugger

    iframe.contentWindow.document.open();
    iframe.contentWindow.document.write(html);
    iframe.contentWindow.document.close();


  }

  function clearCompanionAds() {
    console.log('clear companion ads')
    const c = document.getElementsByClassName('companion-ad');
    for(let i = 0; i < c.length; i++) {
      c[i].innerHTML = ''
    }
  }



  var playContentButton = document.getElementById('play-content-button');
  var testAdButton = document.getElementById('test-ad-button');

  var pauseAdButton = document.getElementById('pause-ad-button');
  // var resumeAdButton = document.getElementById('resume-ad-button');
  var stopAdButton = document.getElementById('stop-ad-button');
  var skipAdButton = document.getElementById('skip-ad-button');
  var resizeAdButton = document.getElementById('resize-ad-button');
  var setAdVolume1Button = document.getElementById('set-ad-volume-1-button');
  var setAdVolume0Button = document.getElementById('set-ad-volume-0-button');

  function enableAdButtons() {
    console.log('enable ad buttons');
    var buttons = document.getElementsByClassName('ad-button');
    for(var button of buttons) {
      button.removeAttribute('disabled');
    }
  }
  function disableAdButtons() {
    console.log('disable ad buttons');
    var buttons = document.getElementsByClassName('ad-button');
    for(var button of buttons) {
      button.setAttribute('disabled', true);
    }
  }

  var clearLogsButton = document.getElementById('clear-logs-button');

  // Events list
  var eventsList = document.getElementById('events-list');
  function appendEvent(text) {
    var today = new Date();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds() + ":" + today.getMilliseconds();
    var eventItem = document.createElement('li');
    eventItem.innerHTML = time + ' ' + text;
    eventsList.appendChild(eventItem);
  }
  function clearEvents() {
    eventsList.innerHTML = '';
  }

  // Example
  var videoElement = document.getElementById('video-element');

  var adContainer = document.getElementById('ad-container');
  var adsManager = new adserve.AdsManager(adContainer);

  console.log('AdsManager version is', adsManager.getVersion());

  var isAdPaused = false;

  // Subscribe for events
  adsManager.addEventListener('AdError', function(adError) {

    console.log('AdError', adError);
    console.log('AdError -> typeof', typeof adError);
    if(typeof adError === 'object') {
      console.log('AdError Message', adError.getMessage());
    }

    appendEvent('AdError : ' + adError);

    if(adsManager) {
      // Removes ad assets loaded at runtime that need to be properly removed at the time of ad completion
      // and stops the ad and all tracking.
      adsManager.abort();
    }

    isAdPaused = false;
    if(videoElement.paused) {
      videoElement.play();
    }

    disableAdButtons();
  });
  adsManager.addEventListener('AdsManagerLoaded', function() {
    console.log('AdsManagerLoaded');
    appendEvent('AdsManagerLoaded');
    console.log('ads manager loaded');

    var width = videoElement.clientWidth;
    var height = videoElement.clientHeight;
    var viewMode = 'normal'; // fullscreen

    try {
      adsManager.init(width, height, viewMode);
    } catch (adError) {
      // Play the video without ads, if an error occurs
      console.log("AdsManager could not initialize ad");
    }

  });
  adsManager.addEventListener('AdLoaded', function(adEvent) {
    console.log('AdLoaded > ad type is linear?', adEvent.isLinear());
    appendEvent('AdLoaded');
    //if(adEvent.type === 'linear') {
    if(adEvent.isLinear()) {
      try {
        adsManager.start();
      } catch (adError) {
        // Play the video without ads, if an error occurs
        console.log("AdsManager could not be started");
      }
    } else {
      console.log('ADM > AdLoaded > ad is not linear');
    }
  });
  adsManager.addEventListener('AdStarted', function(adEvent) {
    console.log('AdStarted', adEvent);
    appendEvent('AdStarted');



    // available sizes
    const sizes = [
      /*{width: 120, height: 60},
      {width: 234, height: 60},
      {width: 300, height: 50},
      {width: 320, height: 50},
      {width: 468, height: 60},*/
      // new sizes
      {width: 200, height: 200},
      {width: 250, height: 250},
      {width: 256, height: 256}, // TODO: remove
      {width: 300, height: 250}, // scale, rectangle
      {width: 336, height: 280}, // scale
      /*{width: 580, height: 400}, // scale*/
      {width: 970, height: 250}, // scale, leaderboard
      {width: 728, height: 90}, // scale,
      {width: 930, height: 180}, // scale,
      {width: 970, height: 90}, // scale,
      {width: 980, height: 120}, // scale,*/
    ];

    // sort sizes by area
    sizes.sort((a, b) => {
      let aArea = a.width * a.height;
      let bArea = b.width * b.height;
      // compare the area of each
      return bArea - aArea;
    });


    // get list of companion ads
    var companionAds = adEvent.getCompanionAds();


    var companionAd = null;

    function getCompanionBySize(size) {
      for(var i = 0; i < companionAds.length; i++) {
        if(companionAds[i].getWidth() == size.width && companionAds[i].getHeight() == size.height) {
          return companionAds[i];
        }
      }
    }
    // find compatible ad
    for(var i = 0; i < sizes.length; i++) {
      companionAd = getCompanionBySize(sizes[i]);
      if(companionAd) {
        break
      }
    }

    console.log('companion ad', companionAd);
    if(companionAd) {
      // render ad through scalable placement
      scalablePlacement.renderAd(companionAd.getContent(), companionAd.getWidth(), companionAd.getHeight());
      showCompanionAd();
    }


    // list and render rest
    companionAds.forEach((companion) => {
      // get placement
      var placement = document.getElementById(`companion-ad-${companion.getWidth()}-${companion.getHeight()}`);
      if(placement) {
        renderCompanionAd(placement, companion.getContent(), companion.getWidth(), companion.getHeight());
      }
    });
    // end companion ads



    // Pause
    console.log('CONTENT_PAUSE_REQUESTED > is video not paused?', !videoElement.paused)
    if(!videoElement.paused) {
      videoElement.pause();
    }

    enableAdButtons();
  });
  adsManager.addEventListener('AdDurationChange', function() {
    console.log('AdDurationChange');
    console.log('getDuration >', adsManager.getDuration());
    appendEvent('AdDurationChange');
  });
  adsManager.addEventListener('AdVolumeChange', function() {
    console.log('AdVolumeChange');
    console.log('getVolume >', adsManager.getVolume());
    appendEvent('AdVolumeChange');
  });
  adsManager.addEventListener('AdSizeChange', function() {
    console.log('AdSizeChange');
    appendEvent('AdSizeChange');
  });
  adsManager.addEventListener('AdVideoStart', function() {
    console.log('AdVideoStart');
    appendEvent('AdVideoStart');
  });
  adsManager.addEventListener('AdImpression', function() {
    console.log('AdImpression');
    appendEvent('AdImpression');
  });
  adsManager.addEventListener('AdVideoFirstQuartile', function() {
    console.log('AdVideoFirstQuartile');
    appendEvent('AdVideoFirstQuartile');
  });
  adsManager.addEventListener('AdVideoMidpoint', function() {
    console.log('AdVideoMidpoint');
    appendEvent('AdVideoMidpoint');
  });
  adsManager.addEventListener('AdVideoThirdQuartile', function() {
    console.log('AdVideoThirdQuartile');
    appendEvent('AdVideoThirdQuartile');
  });
  adsManager.addEventListener('AdPaused', function() {
    console.log('AdPaused');
    isAdPaused = true;
    pauseAdButton.innerHTML = 'Resume Ad';
    appendEvent('AdPaused');
  });
  adsManager.addEventListener('AdPlaying', function() {
    console.log('AdPlaying');
    isAdPaused = false;
    pauseAdButton.innerHTML = 'Pause Ad';
    appendEvent('AdPlaying');
  });
  adsManager.addEventListener('AdVideoComplete', function () {
    console.log('AdVideoComplete');
    appendEvent('AdVideoComplete');
  });
  adsManager.addEventListener('AdStopped', function () {
    console.log('AdStopped');
    appendEvent('AdStopped');
  });
  adsManager.addEventListener('AdSkipped', function() {
    console.log('AdSkipped');
    appendEvent('AdSkipped');
  });
  adsManager.addEventListener('AdClickThru', function(url, id) {
    console.log('AdClickThru', url);
    appendEvent('AdClickThru');
  });
  adsManager.addEventListener('AllAdsCompleted', async function () {
    console.log('AllAdsCompleted');
    appendEvent('AllAdsCompleted');
    isAdPaused = false;

    // companion ads
    // TODO: scalable placement, destroy ad
    if(scalablePlacement) {
      scalablePlacement.destroyAd();
      hideCompanionAd();
    }

    console.log('CONTENT_RESUME_REQUESTED')
    // Resume player
    if(!videoElement.ended) {
      videoElement.play();

      //console.log('set timeout of 5000, after ad complete and request ad again');
      //setTimeout(requestAd, 5000);
    }

    disableAdButtons();
  });

  // Ad Request
  //var vastUrl = 'http://v.adserve.tv/test/sample.xml';
  //var vastUrl = 'http://v.adserve.tv/test/wrapper-multiple-ads.xml';
  //var vastUrl = 'https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ct%3Dlinearvpaid2js&correlator=';
  var vastUrl = 'https://v.adserve.tv/pg/vast-vpaid.xml';
  //var vastUrl = 'https://vid.springserve.com/vast/184920?ima=$[sps_ima_mode]&w=$[width]&h=$[height]&url=$[pageUrl]&cb=$[cb]&widgetid=$[widgetId]&lob=$[abc]&clipid=$[clipId]&key_custom1=^w=$[widgetId]^c=$[clipId]^i=$[clipPlayCounter]^ab=$[abc]^v=$[v]^p=$[publisherId]&key_custom2=^d=$[domain]^u=$[utm]^dv=$[device]^co=$[geo]^pl=$[playback_type]&gdpr=$[gdpr]&consent=$[cd]&viewability=$[v]&schain=$[schain]&us_privacy=$[us_privacy]&domain=$[domain]&key_custom3=$[cma1]';
  //var vastUrl = 'http://v.adserve.tv/pg/vast.xml?ip=$[ip]&w=$[width]&h=$[height]&url=$[pageUrl]&cb=$[cb]&origin_url=$[originUrl]'; //'http://localhost:3100/ads/pg/vast.xml?ip=$[ip]&w=$[width]&h=$[height]&url=$[pageUrl]&cb=$[cb]&origin_url=$[originUrl]';
  //var vastUrl = 'https://vid.springserve.com/vast-xml/247996?id=184920&a_cc=s.184920-d.247996-cv.1025&w=640&h=360&d=demo.anyclip.com&url=http%3A%2F%2Fdemo.anyclip.com%2FLuminousX%2FTestPage.html&ssid=5937c6fd-4be6-4781-b42e-e9a31c91eef9.1597672072856&uuid=4349b3fb-4108-493a-907d-c6ceca437a8f&url=http%3A%2F%2Fdemo.anyclip.com%2FLuminousX%2FTestPage.html&_rcc=en.20954_vp.20247&_vlurl=http%3A%2F%2Fwww.anyclip.com%2F';
  //var vastUrl = 'https://vid.springserve.com/vast/184920?ima=1&w=640&h=360&url=http%3A%2F%2Fdemo.anyclip.com%2FLuminousX%2FTestPage.html&cb=129511830&widgetid=demo_efi&lob=&clipid=my2hs5dygnvueqsrob5dmy2rpbdge5tc&key_custom1=^w=demo_efi^c=my2hs5dygnvueqsrob5dmy2rpbdge5tc^i=1^ab=^v=1^p=lre_demo_page&key_custom2=^d=demo.anyclip.com^u=^dv=1^co=IL^pl=a&gdpr=&consent=&viewability=1&schain=1.0,1!anyclip.com,001w000001fC68UAAS,1,,,,&us_privacy=&domain=demo.anyclip.com';
  //var vastUrl = 'https://vid.springserve.com/vast/412415?w=$[w]&h=$[h]&url=$[url]&cb=$[cb]&pid=$[pid]&cid=$[cid]&wid=$[wid]&ip=$[ip]&ua=$[ua]&dom=$[dom]&abtest=$[abc]';
  //var vastUrl = 'https://vid.springserve.com/vast-xml/243952?id=412415&a_cc=s.412415-d.243952-cv.1011&url=%24%5Burl%5D&ua=%24%5Bua%5D&ssid=3a865307-ac69-42b7-9ea7-087889c9345c.1625055605015&uuid=db9cc521-a0db-4607-8b61-f381e99f89bb&url=%24%5Burl%5D&_rcc=en.22277_vp.22315&_vlurl=http%3A%2F%2Fanyclip.com';
  //var vastUrl = 'http://v.adserve.tv/test/wrapper-a.xml?ip=$[ip]&w=$[width]&h=$[height]&url=$[pageUrl]&cb=$[cb]&origin_url=$[originUrl]'; //'http://localhost:3100/ads/test/wrapper-a.xml?ip=$[ip]&w=$[width]&h=$[height]&url=$[pageUrl]&cb=$[cb]&origin_url=$[originUrl]';
  //var vastUrl = 'http://v.adserve.tv/test/empty-no-ad.xml?ip=$[ip]&w=$[width]&h=$[height]&url=$[pageUrl]&cb=$[cb]&origin_url=$[originUrl]'; //'http://localhost:3100/ads/test/empty-no-ad.xml?ip=$[ip]&w=$[width]&h=$[height]&url=$[pageUrl]&cb=$[cb]&origin_url=$[originUrl]';
  //var vastUrl = 'http://v.adserve.tv/test/empty-no-creative.xml?ip=$[ip]&w=$[width]&h=$[height]&url=$[pageUrl]&cb=$[cb]&origin_url=$[originUrl]'; //'http://localhost:3100/ads/test/empty-no-creative.xml?ip=$[ip]&w=$[width]&h=$[height]&url=$[pageUrl]&cb=$[cb]&origin_url=$[originUrl]';
  //var vastUrl = 'http://v.adserve.tv/test/inline-linear.xml?ip=$[ip]&w=$[width]&h=$[height]&url=$[pageUrl]&cb=$[cb]&origin_url=$[originUrl]'; //'http://localhost:3100/ads/test/inline-linear.xml?ip=$[ip]&w=$[width]&h=$[height]&url=$[pageUrl]&cb=$[cb]&origin_url=$[originUrl]';
  //var vastUrl = 'http://v.adserve.tv/test/wrapper-ad-pod.xml?ip=$[ip]&w=$[width]&h=$[height]&url=$[pageUrl]&cb=$[cb]&origin_url=$[originUrl]'; //'http://localhost:3100/ads/test/wrapper-ad-pod.xml?ip=$[ip]&w=$[width]&h=$[height]&url=$[pageUrl]&cb=$[cb]&origin_url=$[originUrl]';


  // TODO:
  /*
  videoElement.muted = true;
  videoElement.load();
  videoElement.play();
   */

  window.addEventListener('resize', function(event) {
    console.log("window resized");
    var width = videoElement.clientWidth;
    var height = videoElement.clientHeight;
    var viewMode = 'normal';
    adsManager.resize(width, height, viewMode);
  });

  /*
  // Request ads
  console.log('ad request');

  // Test VAST XML instead of VAST URL
  var vastXML = `<?xml version="1.0" encoding="UTF-8"?>
  <VAST version="2.0">
    <Error><![CDATA[http://example.com/empty-no-ad]]></Error>
  </VAST>`;
  //adsManager.requestAds(vastXML);

  adsManager.requestAds(vastUrl);
   */

  /*
  setInterval(function() {
    console.log('ad request');
    adsManager.requestAds(vastUrl);
  }, 10000);
   */



  playContentButton.addEventListener('click', function(event) {
    console.log('play content');

    videoElement.play();
    requestAd();
    /*
    var playPromise = videoElement.play();
    if(playPromise !== undefined) {
      playPromise.then(_ => {
        // Automatic playback started!
        // Show playing UI.
        console.log('playback started');
        //videoElement.pause();
        //videoElement.load();
        return requestAd();
      }).catch(error => {
        // Auto-play was prevented
        // Show paused UI.
        console.log('prevented')
       });
    }
     */
  }, false);


  function requestAd() {

    console.log('request ad');

    isAdPaused = false;
    pauseAdButton.innerHTML = 'Pause Ad';

    // Clear events
    clearEvents();
    clearCompanionAds();

    if(scalablePlacement) {
      scalablePlacement.destroyAd();
      hideCompanionAd();
    }

    var giveVastUrl = document.getElementById('vast-url-input').value;

    if(videoElement.paused) {
      videoElement.play();
    }

    adsManager.requestAds(giveVastUrl, { muted: false });
  }

  testAdButton.addEventListener('click', function() {
    console.log('test button click');
    videoElement.muted = true;
    requestAd();
  }, false);

  pauseAdButton.addEventListener('click', function(event) {
    if(!isAdPaused) {
      adsManager.pause();
    } else {
      adsManager.resume();
    }
  }, false);
  /*
  resumeAdButton.addEventListener('click', function() {
    adsManager.resume();
  }, false);
   */
  stopAdButton.addEventListener('click', function() {
    adsManager.stop();
  }, false);

  skipAdButton.addEventListener('click', function() {
    adsManager.skip();
  }, false);

  resizeAdButton.addEventListener('click', function() {
    var width = videoElement.clientWidth;
    var height = videoElement.clientHeight;
    var viewMode = 'normal';
    adsManager.resize(width, height, viewMode);
  }, false);

  setAdVolume1Button.addEventListener('click', function() {
    adsManager.setVolume(1);
  }, false);

  setAdVolume0Button.addEventListener('click', function() {
    adsManager.setVolume(0);
  }, false);

  clearLogsButton.addEventListener('click', function() {
    // Clear events
    clearEvents();
  }, false);

})()
