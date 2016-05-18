/**
 * @overview
 * BHIMA JSON Report Renderer (Wrapper)
 *
 * This server library is responsible for rendering reports in JSON format.
 * It adheres to the standard BHIMA Report Renderer API, accepting data
 * and options and returning a single compiled object.
 *
 * This renderer demonstrates the API however is mostly a wrapper to be used
 * uniformly with the other renderers (PDF/ HTML/ CSV).
 *
 * @todo    JSON Wrapper is currently just a wrapper to provide a uniform API, it
 *          could also provide functionality like JSON verification (JSON parse/
 *          JSON stringify).
 *
 * @module  lib/renderers/json
 */
var q = require('q');

module.exports = renderJSON;

/**
 * JSON Render Method
 *
 * @param {Object} data      Contains data in any format that will be used to
 *                            drive the final report - this will be exposed to
 *                            the view by the renderer.
 * @param {Object} options   (Optional) parameters that can be passed to switch
 *                            render features on/off.
 *
 * @returns {Object}          JSON Object representing a report that can be sent
 *                            to the client.
 */
function renderJSON(data, options) {
  return q.resolve(data);
}
