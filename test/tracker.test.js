var chai = require('chai');
var expect = chai.expect;

var tracker = require('../tracker');

describe('tracker', function() {
  describe('#setup()', function() {
    it('should exist', function() {
      expect(tracker.setup).to.not.be.undefined;
    });
  });

  describe('#track()', function() {
    it('should exist', function() {
      expect(tracker.track).to.not.be.undefined;
    });
  });
});
