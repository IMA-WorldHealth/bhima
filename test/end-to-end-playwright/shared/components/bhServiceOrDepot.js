const TU = require('../TestUtils');
const { by } = require('../TestUtils');

const bhService = require('./bhServiceSelect');
const bhDepot = require('./bhDepotSelect');

const selector = '[bh-service-or-depot-select]';

module.exports = {

  /**
   * select a service or depot
   *
   * @param {string} requestor - the requester
   * @param {string} type - the type (service or depot)
   * @param {string} [id] - id of selection field (optional)
   */
  set : async function set(requestor, type = 'service', id = undefined) {
    const map = {
      service : bhService,
      depot : bhDepot,
    };

    const locator = (id) ? by.id(id) : by.css(selector);
    const target = await TU.locator(locator);

    const option = await target.locator(by.css(`[data-requestor-option="${type}"]`));
    await option.click();
    await map[type].set(requestor, id);
  },
};
