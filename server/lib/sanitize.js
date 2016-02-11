var db = require('./db');
var util = require('util');

module.exports = {
  escape: util.deprecate(db.escape, 'sanitize.escape() is deprecated.  Please use db.escape instead.')
};
