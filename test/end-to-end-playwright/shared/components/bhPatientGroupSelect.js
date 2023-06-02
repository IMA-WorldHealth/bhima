const TU = require('../TestUtils');
const { by } = require('../TestUtils');

const selector = '[bh-patient-group-select]';

module.exports = {
  set      : async function set(patientGroup, id) {
    const locator = (id) ? by.id(id) : selector;
    const target = TU.locator(locator);
    await target.click();

    await TU.uiSelect('$ctrl.patientGroupUuid', patientGroup, target);
  },
};
