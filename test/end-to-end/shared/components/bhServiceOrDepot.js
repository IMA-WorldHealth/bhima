/* global element, by */
const bhService = require('./bhServiceSelect');
const bhDepot = require('./bhDepotSelect');

module.exports = {
  selector : '[bh-service-or-depot-select]',
  set      : async function set(requestor, type = 'service', id) {
    const map = {
      service : bhService,
      depot : bhDepot,
    };

    await element(by.css(`[data-requestor-option="${type}"]`)).click();
    await map[type].set(requestor, id);
  },
};
