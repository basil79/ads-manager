import { AdsManager } from '../src/ads-manager';

describe('AdsManager', function() {
  describe('when no ad container', () => {

    it('should throw', () => {
      expect(() => {
        var adContainer = document.createElement('div');
        var adsManager = new AdsManager();
      }).toThrow(Error);
    })

  })
});
