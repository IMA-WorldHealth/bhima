const TU = require('../TestUtils');
const { by } = require('../TestUtils');

const selector = '[bh-services-multiple-select]';

module.exports = {

  set : async function set(servicesMultipleSelect, id) {
    const locator = (id) ? by.id(id) : selector;
    const target = await TU.locator(locator);

    await target.click();

    await TU.series(servicesMultipleSelect, service => TU.uiSelect('$ctrl.selectedServices', service));
  },
};
