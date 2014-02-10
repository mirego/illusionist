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

describe('Compilation', function() {

  before(function(done) {
    exec('mkdir -p ' + tmpPath, done);
  });

  after(function(done) {
    exec('rm -r ' + tmpPath, done);
  });

  it('should be able to read from stdin and write to stdout', function(done) {
    var illusionist = spawn(binPath);

    illusionist.stdout.on('data', function (data) {
      expect(Buffer.isBuffer(data)).to.be.true;
      expect(data.length).to.be.greaterThan(0);
      expect(data.toString()).to.contain('function Foo()');
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

  it('should be able to read from stdin and write to a file', function(done) {
    var outputPath = join(tmpPath, 'stdin.js');

    var illusionist = spawn(binPath, ['-o', tmpPath]);

    illusionist.on('exit', function(exitCode) {
      expect(exitCode).to.equal(0);
      expect(outputPath).to.be.a.file().and.not.empty;
      expect(fs.readFileSync(outputPath, 'utf8')).to.contain('function Foo()');
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

  it('should be able to read from a file and write to stdout', function(done) {
    var inputPath = join(fixturesPath, 'file-input', 'file.js');

    var illusionist = spawn(binPath, [inputPath]);

    illusionist.stdout.on('data', function (data) {
      expect(Buffer.isBuffer(data)).to.be.true;
      expect(data.length).to.be.greaterThan(0);
      expect(data.toString()).to.contain('function Foo()');
    });

    illusionist.on('exit', function(exitCode) {
      expect(exitCode).to.equal(0);
      done();
    });
  });

  it('should be able to read from a file and write to a file', function(done) {
    var inputPath = join(fixturesPath, 'file-input', 'file.js');
    var outputPath = join(tmpPath, 'file.js');

    var illusionist = spawn(binPath, ['-o', tmpPath, inputPath]);

    illusionist.on('exit', function(exitCode) {
      expect(exitCode).to.equal(0);
      expect(outputPath).to.be.a.file().and.not.empty;
      expect(fs.readFileSync(outputPath, 'utf8')).to.contain('function Foo()');
      done();
    });
  });

  it('should be able to read from multiple files and write to stdout', function(done) {
    var inputPath1 = join(fixturesPath, 'multiple-files-input', 'file1.js');
    var inputPath2 = join(fixturesPath, 'multiple-files-input', 'file2.js');
    var stdout;

    var illusionist = spawn(binPath, [inputPath1, inputPath2]);

    illusionist.stdout.on('data', function (data) {
      stdout += data;
      expect(Buffer.isBuffer(data)).to.be.true;
      expect(data.length).to.be.greaterThan(0);
    });

    illusionist.on('exit', function(exitCode) {
      expect(exitCode).to.equal(0);
      expect(stdout.toString()).to.contain('function Foo()');
      expect(stdout.toString()).to.contain('function Bar()');
      done();
    });
  });

  it('should be able to read from multiple files and write to a directory', function(done) {
    var inputPath1 = join(fixturesPath, 'multiple-files-input', 'file1.js');
    var inputPath2 = join(fixturesPath, 'multiple-files-input', 'file2.js');
    var outputDirectory = join(tmpPath, 'multiple-files-input');
    var outputPath1 = join(tmpPath, 'multiple-files-input', 'file1.js');
    var outputPath2 = join(tmpPath, 'multiple-files-input', 'file2.js');

    var illusionist = spawn(binPath, ['-o', outputDirectory, inputPath1, inputPath2]);

    illusionist.on('exit', function(exitCode) {
      expect(exitCode).to.equal(0);
      expect(outputPath1).to.be.a.file().and.not.empty;
      expect(fs.readFileSync(outputPath1, 'utf8')).to.contain('function Foo()');
      expect(outputPath2).to.be.a.file().and.not.empty;
      expect(fs.readFileSync(outputPath2, 'utf8')).to.contain('function Bar()');
      done();
    });
  });

  it('should be able to read a directory recursively and write to stdout and keep the structure in module names', function(done) {
    var inputPath = join(fixturesPath, 'tree-input');
    var stdout;

    var illusionist = spawn(binPath, ['-t', inputPath]);

    illusionist.stdout.on('data', function (data) {
      stdout += data;
      expect(Buffer.isBuffer(data)).to.be.true;
      expect(data.length).to.be.greaterThan(0);
    });

    illusionist.on('exit', function(exitCode) {
      expect(exitCode).to.equal(0);

      expect(stdout).to.contain('new App()');
      expect(stdout).to.contain('define("app/app"');
      expect(stdout).to.contain('define("app/controllers/posts/index"');
      expect(stdout).to.contain('define("app/controllers/posts/show"');
      expect(stdout).to.contain('define("app/models/post"');
      expect(stdout).to.contain('define("app/views/posts"');

      done();
    });
  });

  it('should be able to read a directory recursively and write to a directory and keep the structure', function(done) {
    var inputPath = join(fixturesPath, 'tree-input');
    var outputPath = join(tmpPath, 'tree-input');

    var mainFilePath = join(outputPath, 'main.js');
    var appFilePath = join(outputPath, 'app', 'app.js');
    var indexControllerFilePath = join(outputPath, 'app', 'controllers', 'posts', 'index.js');
    var showControllerFilePath = join(outputPath, 'app', 'controllers', 'posts', 'show.js');
    var modelFilePath = join(outputPath, 'app', 'models', 'post.js');
    var viewFilePath = join(outputPath, 'app', 'views', 'posts.js');

    var illusionist = spawn(binPath, ['-t', '-o', outputPath, inputPath]);

    illusionist.on('exit', function(exitCode) {
      expect(exitCode).to.equal(0);
      expect(outputPath).to.be.a.directory().and.not.empty;

      expect(mainFilePath).to.be.a.file().and.not.empty;
      expect(fs.readFileSync(mainFilePath, 'utf8')).to.contain('new App()');

      expect(appFilePath).to.be.a.file().and.not.empty;
      expect(fs.readFileSync(appFilePath, 'utf8')).to.contain('define("app/app"');

      expect(indexControllerFilePath).to.be.a.file().and.not.empty;
      expect(fs.readFileSync(indexControllerFilePath, 'utf8')).to.contain('define("app/controllers/posts/index"');

      expect(showControllerFilePath).to.be.a.file().and.not.empty;
      expect(fs.readFileSync(showControllerFilePath, 'utf8')).to.contain('define("app/controllers/posts/show"');

      expect(modelFilePath).to.be.a.file().and.not.empty;
      expect(fs.readFileSync(modelFilePath, 'utf8')).to.contain('define("app/models/post"');

      expect(viewFilePath).to.be.a.file().and.not.empty;
      expect(fs.readFileSync(viewFilePath, 'utf8')).to.contain('define("app/views/posts"');

      done();
    });
  });
});
