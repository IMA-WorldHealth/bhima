const TU = require('../TestUtils');
const { by } = require('../TestUtils');

const selector = '[bh-user-select]';

module.exports = {

  /**
   * Select a user
   *
   * @param {string} user - the user id for the desired user
   * @param {string} [id] - the id of the selection field (optional)
   * @returns {Promise} for selecting the desired user
   */
  set : async function set(user, id) {
    const locator = (id) ? by.id(id) : by.css(selector);
    const target = await TU.locator(locator);

    // hack to make sure previous 'blur' event fires if we are using
    // ngModelOptions updateOn 'blur' for every input
    await target.click();

    return TU.uiSelect('$ctrl.userId', user, target);
  },
};
