/* global element, by */

const FU = require('../FormUtils');

module.exports = {
  selector : '[bh-projects-multiple-select]',
  set      : async function set(projectsMultipleStatus, id) {
    const locator = (id) ? by.id(id) : by.css(this.selector);
    const target = element(locator);

    await target.click();

    await Promise.all(
      projectsMultipleStatus.map(projects => FU.uiSelect('$ctrl.selectedServices', projects))
    );
  },
};
