'use strict';

var spec = {
  name: 'Channel',
  message: 'Internal Error on bitcore-channels Module {0}',
};

module.exports = require('bitcore-lib').errors.extend(spec);
