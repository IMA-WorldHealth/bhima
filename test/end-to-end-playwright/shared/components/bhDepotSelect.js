const TU = require('../TestUtils');

/**
 * set the depot
 *
 * @param {string} depot - name of selected depot
 * @param {id} id - CSS id for anchor containing the depot select field (defaults to 'body')
 * @returns {Promise} of the typing into the selection field
 */
async function set(depot, id) {
  const anchor = (id) ? await TU.locator(`#${id}`) : await TU.locator('body');
  const elt = await anchor.locator('[ng-model="$ctrl.depotText"]');
  return elt.type(depot);
}

module.exports = {
  selector : '[bh-depot-select]',
  set,
};
