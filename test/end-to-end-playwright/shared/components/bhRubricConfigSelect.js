const TU = require('../TestUtils');
const { by } = require('../TestUtils');

const selector = '[bh-rubric-config-select]';

module.exports = {

  set : async function set(rubric, id) {
    const locator = (id) ? by.id(id) : selector;
    const target = await TU.locator(locator);

    await target.click();

    await TU.uiSelect('$ctrl.configRubricId', rubric, target, false, 'exact');
  },
};
