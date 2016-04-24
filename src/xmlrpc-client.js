// inspired by https://github.com/pqx/xmlrpc-lite

import { serializeMethodCall } from 'xmlrpc/lib/serializer';
import Deserializer from 'xmlrpc/lib/deserializer';
import request from 'superagent';
import isNode from 'detect-node';
import pify from 'pify';

module.exports = function(url, encoding) {
  return function(method, params) {
    const xml = serializeMethodCall(method, params);
    const deserializer = new Deserializer(encoding || 'utf-8');
    const deserialize = pify(deserializer.deserializeMethodResponse.bind(deserializer));

    const req = request
      .post(url)
      .send(xml);

    if (isNode) {
      req.setEncoding = function() {}; // ¯\_(ツ)_/¯
      return deserialize(req);
    } else {
      return pify(req.end.bind(req))()
        .then(res => {
          const stream = require('stream');
          const s = new stream.Readable();

          s.push(res.text);
          s.push(null);

          return deserialize(s);
        });
    }
  };
};
