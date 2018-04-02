var chai = require('chai');
var expect = chai.expect;

window.empyr=window.empyr||function(){(window.empyr.q=window.empyr.q||[]).push(arguments)};window.empyr.l=+new Date;
window.empyr('setup', 'CLIENT_ID', {m: 'EMPYR_UID', watch: true});
var tracking = require('../tracking');

describe('tracking', function() {
  describe('#push()', function() {
    it('should exist', function() {
      expect(tracking.push).to.not.be.undefined;
    });
  });
});
