/* jshint expr: true */
/* global describe, it, before, after */
var fs = require('fs');
var path = require('path');
var join = path.join;
var childProcess = require('child_process');
var spawn = childProcess.spawn;
var exec = childProcess.exec;

var chai = require('chai');
var expect = chai.expect;
chai.use(require('chai-fs'));

var binPath = path.resolve(join(__dirname, '..', 'bin', 'illusionist'));
var tmpPath = path.resolve(join(__dirname, '..', 'tmp'));
var fixturesPath = path.resolve(join(__dirname, 'fixtures'));

describe('Option flags', function() {

  before(function(done) {
    exec('mkdir -p ' + tmpPath, done);
  });

  after(function(done) {
    exec('rm -r ' + tmpPath, done);
  });

  describe('--module-name', function() {
    it('should be able to change the module name', function(done) {
      var illusionist = spawn(binPath, ['-m', 'some/dir/my-module']);

      illusionist.stdout.on('data', function (data) {
        expect(Buffer.isBuffer(data)).to.be.true;
        expect(data.length).to.be.greaterThan(0);
        expect(data.toString()).to.contain('define("some/dir/my-module"');
      });

      illusionist.on('exit', function(exitCode) {
        expect(exitCode).to.equal(0);
        done();
      });

      var stdin = ['',
        'import Bar from "bar";',
        'class Foo {',
        '  constructor() {}',
        '}'
      ].join('\n');

      illusionist.stdin.write(stdin);
      illusionist.stdin.end();
    });
  });

  describe('--watch', function() {
    it('should recompile a file when it’s changed', function(done) {
      var inputPath = join(fixturesPath, 'watch', 'file.js');
      var outputDirectory = join(tmpPath, 'watch');
      var outputPath = join(outputDirectory, 'file.js');

      var illusionist = spawn(binPath, ['-w', '-o', outputDirectory, inputPath]);

      illusionist.stdout.once('data', function(data) {
        expect(data.toString()).to.contain('Watching');

        var mtime = fs.lstatSync(inputPath).mtime;

        exec('touch ' + inputPath, function() {
          illusionist.stdout.once('data', function(data) {
            expect(data.toString()).to.contain('Compiled');
            expect(fs.lstatSync(inputPath).mtime) > mtime;
            illusionist.kill('SIGINT');
          });
        });
      });

      illusionist.on('exit', function() {
        expect(outputPath).to.be.a.file().and.not.empty;
        done();
      });
    });
  });
});
