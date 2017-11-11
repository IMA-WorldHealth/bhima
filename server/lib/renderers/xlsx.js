/**
 * @overview lib/renderers/xlsx
 *
 * @description
 * This library is just a shim to ensure API uniformity with other renderers.
 * The core functionality is identical to the JSON renderer.
 *
 * @module lib/renderers/xlsx
 *
 * @requires q
 */

const q = require('q');

const headers = {
  'Content-Type' : 'application/xlsx',
  type : 'xlsx',
};

exports.render = renderXLSX;
exports.extension = '.xlsx';
exports.headers = headers;

/**
 * JSON Render Method
 * @param {Object} data      Contains data in any format that will be used to
 *                            drive the final report - this will be exposed to
 *                            the view by the renderer.
 * @param {Object} options   (Optional) parameters that can be passed to switch
 *                            render features on/off.
 * @returns {Object}          JSON Object representing a report that can be sent
 *                            to the client.
 */
function renderXLSX(data) {
  return q.resolve(data);
}
