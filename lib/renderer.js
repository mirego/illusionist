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
    var moduleName = path.basename(this.options.fileName, '.js');
    return new ES6ModuleCompiler(this.buffer, moduleName).toAMD();
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
  }
};



module.exports = Renderer;
