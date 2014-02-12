var fs = require('fs');
var path = require('path');
var Renderer = require('./renderer');

/**
 * Return a new `Renderer` for the given `str` and `options`
 *
 * @param {String} str
 * @param {Object} options
 * @return {Renderer}
 */
exports = module.exports = function render(str, options) {
  return new Renderer(str, options);
};

// Library version
exports.version = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../package.json'))).version;
