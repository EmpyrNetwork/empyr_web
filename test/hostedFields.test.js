var chai = require('chai');
var expect = chai.expect;
var hostedFields = require('../hostedFields');

describe('hostedFields', function() {
  describe('#setup()', function() {
    it('should exist', function() {
      expect(hostedFields.setup).to.not.be.undefined;
    });
  });
});
