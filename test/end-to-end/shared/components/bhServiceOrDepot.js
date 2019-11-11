/* global element, by */
const bhService = require('./bhServiceSelect');
const bhDepot = require('./bhDepotSelect');

module.exports = {
  selector : '[bh-service-or-depot-select]',
  set      : async function set(requestor, type = 'service', id) {
    const SERVICE_REQUESTOR = 'service';
    const DEPOT_REQUESTOR = 'depot';

    if (type === 'service') {
      await element(by.css(`[data-requestor-option="${SERVICE_REQUESTOR}"]`)).click();
      await bhService.set(requestor, id);
    }

    if (type === 'depot') {
      await element(by.css(`[data-requestor-option="${DEPOT_REQUESTOR}"]`)).click();
      await bhDepot.set(requestor, id);
    }
  },
};
