import sinon from 'sinon';
import * as assert from 'assert';
import { AdsManager } from '../src';


var adsManager = new AdsManager();

describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal([1, 2, 3].indexOf(4), -1);
    });
  });
});
