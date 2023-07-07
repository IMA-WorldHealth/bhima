const TU = require('../TestUtils');
const { by } = require('../TestUtils');

const selector = '[bh-analysis-tool-type-select]';

module.exports = {
  set  : async function set(analysisToolTypeSelect, id) {
    const locator = (id) ? by.id(id) : selector;
    const target = TU.locator(locator);

    await target.click();

    return TU.uiSelect('$ctrl.typeId', analysisToolTypeSelect);
  },
};
