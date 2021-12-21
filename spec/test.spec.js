import { AdsManager } from '../src';

describe('AdsManager', function() {
  describe('when no ad container', () => {

    it('should throw', () => {
      expect(() => {
        var adsManager = new AdsManager();
      }).toThrow(Error);
    })

  })
});
