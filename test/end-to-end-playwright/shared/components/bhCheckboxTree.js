const TU = require('../TestUtils');
const { by } = require('../TestUtils');

const selector = '[data-bh-checkbox-tree]';

module.exports = {

  /**
   * Toggle the row selector
   * @param {string} labels - label to toggle
   * @param {string} id - selector
   */
  async toggle(labels, id) { // eslint-disable-line no-unused-vars
    throw Error('bhCheckboxTree.toggle() is not implemented');
    // const locator = (id) ? by.id(id) : selector;
    // const tree = await TU.locator(locator);
    // await await TU.series(labels, async (label) => tree.$(`[data-label="${label}"]`).click());
  },

  /**
   * Toggle the 'check' state of all checkbox in a set
   * using the "Check All" button
   *
   * @param {string} id - id of checkbox set
   * @returns {Promise} of all items being toggled
   */
  async toggleAllCheckboxes(id) {
    const locator = (id) ? by.id(id) : selector;
    return TU.locator(`${locator} [data-root-node]`).click();
  },

  /**
   * See if a checkbox is checked
   * @param {string} id - id of checkbox to check
   * @returns {Promise} of whether the checkbox is checked
   */
  async isChecked(id) {
    const locator = (id) ? by.id(id) : selector;
    const tree = await TU.locator(`${locator} [data-root-node] input`);
    return tree.isChecked();
  },

};
