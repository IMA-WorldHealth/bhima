const TU = require('../TestUtils');
const { by } = require('../TestUtils');

const selector = '[bh-survey-list-select]';

module.exports = {

  set : async function set(survey, id) {
    const locator = (id) ? by.id(id) : selector;
    const target = TU.locator(locator);

    await target.click();

    await TU.uiSelect('$ctrl.survey', survey, target);
  },
};
