
var uuid = require('node-uuid');
var util = require('util');

/**
 * generates version 4 UUIds
 * @deprecated Use node-uuid directly instead
 */
function generate() {
  return uuid.v4();
}

module.exports =
  util.deprecate(generate, 'uuid() is deprecated. Please require(\'node-uuid\') and use it directly.');
