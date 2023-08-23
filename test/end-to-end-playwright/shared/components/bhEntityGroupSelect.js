const TU = require('../TestUtils');
const { by } = require('../TestUtils');

const selector = '[bh-entity-group-select]';

module.exports = {
  set : async function set(entityGroup, id) {
    const locator = (id) ? by.id(id) : selector;
    const target = await TU.locator(locator);
    return TU.uiSelect('$ctrl.uuid', entityGroup, target);
  },
};
