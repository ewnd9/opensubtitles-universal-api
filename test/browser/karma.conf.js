'use strict';

var path = require('path');
var webpackConfig = require('../../examples/browser-webpack/webpack.config.js');

delete webpackConfig.entry;

module.exports = function (config) {
  config.set({
    browsers: ['PhantomJS'],
    frameworks: ['jasmine'],
    reporters: ['spec'],
    files: ['./test.js'],
    preprocessors: {
      './test.js': ['webpack']
    },
    webpack: webpackConfig,
    webpackMiddleware: {
      noInfo: true
    },
  });
}
