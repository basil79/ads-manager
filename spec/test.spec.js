import { AdsManager } from '../src/ads-manager';

describe('AdsManager', function() {
  describe('when no ad container', () => {

    it('should throw', () => {
      expect(() => {
        const adContainer = document.createElement('div');
        const adsManager = new AdsManager();
      }).toThrow(Error);
    })

  })
});
