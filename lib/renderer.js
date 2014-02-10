var path = require('path');

var jstransform = require('jstransform');
var ES6ModuleCompiler = require('es6-module-transpiler').Compiler;

var visitorsPath = 'jstransform/visitors';
var arrowFunction = require(visitorsPath + '/es6-arrow-function-visitors').visitorList;
var classes = require(visitorsPath + '/es6-class-visitors').visitorList;
var objectShortNotation = require(visitorsPath + '/es6-object-short-notation-visitors').visitorList;
var restParameter = require(visitorsPath + '/es6-rest-param-visitors').visitorList;
var template = require(visitorsPath + '/es6-template-visitors').visitorList;

function Renderer(buffer, options) {
  options = options || {};
  options.fileName = options.fileName || 'illusionist';
  this.options = options;
  this.buffer = buffer;
}

Renderer.prototype = {
  render: function(fn) {
    this.buffer = this.transpileES6Modules();
    this.buffer = this.transpileES6();

    if (fn) {
      fn(null, this.buffer);
    } else {
      return this.buffer;
    }
  },

  transpileES6Modules: function() {
    var moduleName;

    if (this.options.moduleName) {
      moduleName = this.options.moduleName;
    } else if (this.options.basePath) {
      moduleName = path.relative(this.options.basePath, this.options.fileName).replace(/\.js$/, '');
    } else {
      moduleName = path.basename(this.options.fileName, '.js');
    }

    var transpiledCode = new ES6ModuleCompiler(this.buffer, moduleName);
    switch(this.options.moduleType) {
    case 'amd':
      return transpiledCode.toAMD();

    case 'cjs':
      return this.wrapWithIIFE(transpiledCode.toCJS());

    case 'globals':
      return transpiledCode.toGlobals();
    }
  },

  transpileES6: function() {
    var transforms = [].concat(
      arrowFunction,
      classes,
      objectShortNotation,
      restParameter,
      template
    );

    return jstransform.transform(transforms, this.buffer).code;
  },

  wrapWithIIFE: function(code) {
    return '(function() {' + code + '})();';
  }
};

module.exports = Renderer;
