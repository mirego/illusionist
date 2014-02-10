/* jshint expr: true */
/* global describe, it */
var path = require('path');
var join = path.join;
var childProcess = require('child_process');
var exec = childProcess.exec;

var chai = require('chai');
var expect = chai.expect;
chai.use(require('chai-fs'));

var pkg = require('../package');
var binPath = path.resolve(join(__dirname, '..', 'bin', 'illusionist'));

describe('Info flags', function() {
  describe('--help', function() {
    it('should display the usage informations', function(done) {
      exec(binPath + ' -h', function(error, stdout, stderr) {
        expect(error).to.be.null;
        expect(stdout).to.be.a('string');
        expect(stdout).to.contain('Usage:');
        expect(stderr).to.equal('');
        done();
      });
    });
  });

  describe('--version', function() {
    it('should log the version present in package.json', function(done) {
      exec(binPath + ' -v', function(error, stdout, stderr) {
        expect(error).to.be.null;
        expect(stdout).to.equal(pkg.version + '\n');
        expect(stderr).to.equal('');
        done();
      });
    });
  });
});
