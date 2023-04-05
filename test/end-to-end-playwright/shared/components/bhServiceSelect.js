const TU = require('../TestUtils');
const { by } = require('../TestUtils');

const selector = '[bh-service-select]';

module.exports = {

  /**
   * Select a service
   *
   * @param {string} service - name of service to select
   * @param {string} [id] - id of selection field (optional)
   * @returns {Promise} for selecting the service
   */
  set : async function set(service, id) {
    const locator = (id) ? by.id(id) : by.css(this.selector);
    const target = await TU.locator(locator);

    // hack to make sure previous 'blur' event fires if we are using
    // ngModelOptions updateOn 'blur' for every input
    await target.click();

    return TU.uiSelect('$ctrl.serviceUuid', service, target);
  },
};
