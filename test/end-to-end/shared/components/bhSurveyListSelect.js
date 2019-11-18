/* global element, by */

const FU = require('../FormUtils');

module.exports = {
  selector : '[bh-survey-list-select]',
  set      : async function set(survey, id) {
    const locator = (id) ? by.id(id) : by.css(this.selector);
    const target = element(locator);

    // hack to make sure previous 'blur' event fires if we are using
    // ngModelOptions updateOn 'blur' for every input
    await target.click();

    await FU.uiSelect('$ctrl.survey', survey, target);
  },
};
