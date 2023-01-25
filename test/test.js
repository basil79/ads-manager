import AdsManager from '../src/ads-manager';
import AdError from '../src/ad-error';

describe('AdsManager', function() {
  describe('#constructor', () => {
    it('check constructor', () => {
      const adContainer = document.createElement('div');
      const adsManager = new AdsManager(adContainer);
    });
  });
});

describe('AdError', function() {
  describe('#constructor', function () {
    it('check constructor', () => {
      let adError = new AdError('An unexpected error occurred within the VPAID creative. Refer to the inner error for more info.', 901, new AdError('initAd failed'));
      console.log(adError.toString());
    });
  });
});
