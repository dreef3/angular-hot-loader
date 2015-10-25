'use strict';

var path = require('path');
var SourceNode = require('source-map').SourceNode;
var SourceMapConsumer = require('source-map').SourceMapConsumer;
var makeIdentitySourceMap = require('./makeIdentitySourceMap');

module.exports = function (source, map) {
  if (this.cacheable) {
    this.cacheable();
  }

  var resourcePath = this.resourcePath;
  if (/[\\/]webpack[\\/]buildin[\\/]module\.js|[\\/]loader-runtime[\\/]/.test(resourcePath)) {
    return this.callback(null, source, map);
  }

  var filename = path.basename(resourcePath),
      separator = '\n\n',
      prependText,
      appendText,
      node,
      result;

  prependText = [
    '/* ANGULAR HOT LOADER */',
    separator,
    'if (module.hot) {',
      '(function () {',
        'var HmrRuntime = require(' + JSON.stringify(require.resolve('./loader-runtime/runtime')) + ');',
        'module.__runtime = module.hot.data ? module.hot.data.__runtime : HmrRuntime.register(module);',
        'module.__export = module.hot.data ? module.hot.data.__export : null;',
      '})();',
    '}',
    'try {',
      '(function () {',
  ].join('\n');

  appendText = [
      separator,
      '/* ANGULAR HOT LOADER */',
      '}).call(this);',
    '} finally {',
      'if (module.hot) {',
        '(function () {',
          'var canAccept = require(' + JSON.stringify(require.resolve('./loader-runtime/transform')) + ')(module);',
          'if (canAccept) {',
            'module.hot.accept(function (err) {',
              'if (err) {',
                'console.error("Cannot apply hot update to " + ' + JSON.stringify(filename) + ' + ": " + err.message);',
              '} else {',
                'module.__runtime.accepted(arguments)',
              '}',
            '});',
            'module.hot.dispose(function (data) {',
              'data.__runtime = module.__runtime;',
              'data.__export = module.__export',
              'module.__runtime.disposed(arguments)',
            '});',
            'module.__runtime.reloaded(arguments);',
          '}',
        '})();',
      '}',
    '}'
  ].join('\n');

  if (this.sourceMap === false) {
    return this.callback(null, [
      prependText,
      source,
      appendText
    ].join(separator));
  }

  if (!map) {
    map = makeIdentitySourceMap(source, this.resourcePath);
  }

  node = new SourceNode(null, null, null, [
    new SourceNode(null, null, this.resourcePath, prependText),
    SourceNode.fromStringWithSourceMap(source, new SourceMapConsumer(map)),
    new SourceNode(null, null, this.resourcePath, appendText)
  ]).join(separator);

  result = node.toStringWithSourceMap();

  this.callback(null, result.code, result.map.toString());
};
