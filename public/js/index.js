(function() {

    // var playButton = document.getElementById('play-button');
    var testAdButton = document.getElementById('test-ad-button');

    var pauseAdButton = document.getElementById('pause-ad-button');
    // var resumeAdButton = document.getElementById('resume-ad-button');
    var stopAdButton = document.getElementById('stop-ad-button');
    var skipAdButton = document.getElementById('skip-ad-button');
    var resizeAdButton = document.getElementById('resize-ad-button');

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

    // Example
    var videoElement = document.getElementById('video-element');

    var adContainer = document.getElementById('ad-container');
    var adsManager = new ssp4.tv.AdsManager(adContainer);

    var isAdPaused = false;

    // Subscribe for events
    adsManager.addEventListener('AdError', function(adError) {
        console.log('AdError', adError);
        appendEvent('AdError : ' + adError);

        if(adsManager) {
            adsManager.destroy();
        }

        isAdPaused = false;
        videoElement.play();
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
        console.log('AdLoaded > ad type is', adEvent.type);
        appendEvent('AdLoaded');
        if(adEvent.type === 'linear') {
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
    adsManager.addEventListener('AdStarted', function() {
        console.log('AdStarted');
        appendEvent('AdStarted');
        videoElement.pause();
        enableAdButtons();
    });
    adsManager.addEventListener('AdDurationChange', function() {
        console.log('AdDurationChange');
        console.log('getDuration >', adsManager.getDuration());
        appendEvent('AdDurationChange');
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
    adsManager.addEventListener('AllAdsCompleted', function () {
        console.log('AllAdsCompleted');
        appendEvent('AllAdsCompleted');
        isAdPaused = false;
        videoElement.play();
        disableAdButtons();
    });

    // Ad Request
    //var vastUrl = 'http://v.ssp4.tv/test/sample.xml';
    //var vastUrl = 'http://v.ssp4.tv/test/wrapper-multiple-ads.xml';
    //var vastUrl = 'https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ct%3Dlinearvpaid2js&correlator=';
    var vastUrl = 'http://v.ssp4.tv/pg/vast-vpaid.xml?ip=$[ip]&w=$[width]&h=$[height]&url=$[pageUrl]&cb=$[cb]&origin_url=$[originUrl]'; //'http://localhost:3100/ads/pg/vast-vpaid.xml?ip=$[ip]&w=$[width]&h=$[height]&url=$[pageUrl]&cb=$[cb]&origin_url=$[originUrl]';
    //var vastUrl = 'https://vid.springserve.com/vast/184920?ima=$[sps_ima_mode]&w=$[width]&h=$[height]&url=$[pageUrl]&cb=$[cb]&widgetid=$[widgetId]&lob=$[abc]&clipid=$[clipId]&key_custom1=^w=$[widgetId]^c=$[clipId]^i=$[clipPlayCounter]^ab=$[abc]^v=$[v]^p=$[publisherId]&key_custom2=^d=$[domain]^u=$[utm]^dv=$[device]^co=$[geo]^pl=$[playback_type]&gdpr=$[gdpr]&consent=$[cd]&viewability=$[v]&schain=$[schain]&us_privacy=$[us_privacy]&domain=$[domain]&key_custom3=$[cma1]';
    //var vastUrl = 'http://v.ssp4.tv/pg/vast.xml?ip=$[ip]&w=$[width]&h=$[height]&url=$[pageUrl]&cb=$[cb]&origin_url=$[originUrl]'; //'http://localhost:3100/ads/pg/vast.xml?ip=$[ip]&w=$[width]&h=$[height]&url=$[pageUrl]&cb=$[cb]&origin_url=$[originUrl]';
    //var vastUrl = 'https://vid.springserve.com/vast-xml/247996?id=184920&a_cc=s.184920-d.247996-cv.1025&w=640&h=360&d=demo.anyclip.com&url=http%3A%2F%2Fdemo.anyclip.com%2FLuminousX%2FTestPage.html&ssid=5937c6fd-4be6-4781-b42e-e9a31c91eef9.1597672072856&uuid=4349b3fb-4108-493a-907d-c6ceca437a8f&url=http%3A%2F%2Fdemo.anyclip.com%2FLuminousX%2FTestPage.html&_rcc=en.20954_vp.20247&_vlurl=http%3A%2F%2Fwww.anyclip.com%2F';
    //var vastUrl = 'https://vid.springserve.com/vast/184920?ima=1&w=640&h=360&url=http%3A%2F%2Fdemo.anyclip.com%2FLuminousX%2FTestPage.html&cb=129511830&widgetid=demo_efi&lob=&clipid=my2hs5dygnvueqsrob5dmy2rpbdge5tc&key_custom1=^w=demo_efi^c=my2hs5dygnvueqsrob5dmy2rpbdge5tc^i=1^ab=^v=1^p=lre_demo_page&key_custom2=^d=demo.anyclip.com^u=^dv=1^co=IL^pl=a&gdpr=&consent=&viewability=1&schain=1.0,1!anyclip.com,001w000001fC68UAAS,1,,,,&us_privacy=&domain=demo.anyclip.com';
    //var vastUrl = 'https://vid.springserve.com/vast/412415?w=$[w]&h=$[h]&url=$[url]&cb=$[cb]&pid=$[pid]&cid=$[cid]&wid=$[wid]&ip=$[ip]&ua=$[ua]&dom=$[dom]&abtest=$[abc]';
    //var vastUrl = 'https://vid.springserve.com/vast-xml/243952?id=412415&a_cc=s.412415-d.243952-cv.1011&url=%24%5Burl%5D&ua=%24%5Bua%5D&ssid=3a865307-ac69-42b7-9ea7-087889c9345c.1625055605015&uuid=db9cc521-a0db-4607-8b61-f381e99f89bb&url=%24%5Burl%5D&_rcc=en.22277_vp.22315&_vlurl=http%3A%2F%2Fanyclip.com';
    //var vastUrl = 'http://v.ssp4.tv/test/wrapper-a.xml?ip=$[ip]&w=$[width]&h=$[height]&url=$[pageUrl]&cb=$[cb]&origin_url=$[originUrl]'; //'http://localhost:3100/ads/test/wrapper-a.xml?ip=$[ip]&w=$[width]&h=$[height]&url=$[pageUrl]&cb=$[cb]&origin_url=$[originUrl]';
    //var vastUrl = 'http://v.ssp4.tv/test/empty-no-ad.xml?ip=$[ip]&w=$[width]&h=$[height]&url=$[pageUrl]&cb=$[cb]&origin_url=$[originUrl]'; //'http://localhost:3100/ads/test/empty-no-ad.xml?ip=$[ip]&w=$[width]&h=$[height]&url=$[pageUrl]&cb=$[cb]&origin_url=$[originUrl]';
    //var vastUrl = 'http://v.ssp4.tv/test/empty-no-creative.xml?ip=$[ip]&w=$[width]&h=$[height]&url=$[pageUrl]&cb=$[cb]&origin_url=$[originUrl]'; //'http://localhost:3100/ads/test/empty-no-creative.xml?ip=$[ip]&w=$[width]&h=$[height]&url=$[pageUrl]&cb=$[cb]&origin_url=$[originUrl]';
    //var vastUrl = 'http://v.ssp4.tv/test/inline-linear.xml?ip=$[ip]&w=$[width]&h=$[height]&url=$[pageUrl]&cb=$[cb]&origin_url=$[originUrl]'; //'http://localhost:3100/ads/test/inline-linear.xml?ip=$[ip]&w=$[width]&h=$[height]&url=$[pageUrl]&cb=$[cb]&origin_url=$[originUrl]';
    //var vastUrl = 'http://v.ssp4.tv/test/wrapper-ad-pod.xml?ip=$[ip]&w=$[width]&h=$[height]&url=$[pageUrl]&cb=$[cb]&origin_url=$[originUrl]'; //'http://localhost:3100/ads/test/wrapper-ad-pod.xml?ip=$[ip]&w=$[width]&h=$[height]&url=$[pageUrl]&cb=$[cb]&origin_url=$[originUrl]';


    videoElement.muted = true;
    videoElement.load();
    videoElement.play();

    window.addEventListener('resize', function(event) {
        console.log("window resized");
        var width = adContainer.clientWidth;
        var height = adContainer.clientHeight;
        var viewMode = 'normal';
        adsManager.resize(width, height, viewMode);
    });

    // Request ads
    console.log('ad request');

    // Test VAST XML instead of VAST URL
    var vastXML = `<?xml version="1.0" encoding="UTF-8"?>
    <VAST version="2.0">
      <Error><![CDATA[http://example.com/empty-no-ad]]></Error>
    </VAST>`;
    //adsManager.requestAds(vastXML);

    adsManager.requestAds(vastUrl, {
      resolveAll : false,
      withCredentials: false
    });

    /*
    setInterval(function() {
        console.log('ad request');
        adsManager.requestAds(vastUrl);
    }, 10000);
     */


    /*
    playButton.addEventListener('click', function(event) {
        console.log('play');
        videoElement.play();
    }, false);
     */

    testAdButton.addEventListener('click', function() {
        console.log('test button click');
        var eventsList = document.getElementById('events-list');
        eventsList.innerHTML = '';

        var giveVastUrl = document.getElementById('vast-url-input').value;

        if(videoElement.paused) {
          videoElement.play();
        }

        adsManager.requestAds(giveVastUrl, {
          resolveAll : false,
          withCredentials: false
        });
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
        var width = adContainer.clientWidth;
        var height = adContainer.clientHeight;
        var viewMode = 'normal';
        adsManager.resize(width, height, viewMode);
    }, false);
    clearLogsButton.addEventListener('click', function() {
        var eventsList = document.getElementById('events-list');
        eventsList.innerHTML = '';
    }, false);

})()
