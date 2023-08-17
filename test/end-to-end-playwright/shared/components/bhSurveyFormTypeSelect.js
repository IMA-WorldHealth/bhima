const TU = require('../TestUtils');
const { by } = require('../TestUtils');

const selector = '[bh-survey-form-type-select]';

module.exports = {

  set : async function set(surveyType, id) {
    const locator = (id) ? by.id(id) : selector;
    const target = TU.locator(locator);

    await target.click();

    await TU.uiSelect('$ctrl.typeElement', surveyType, target);
  },
};
