/* global browser, element, by */

const FU = require('../FormUtils');

module.exports = {
  selector : '[bh-projects-multiple-select]',
  set      : function set(projectsMultipleStatus, id) {
    const locator = (id) ? by.id(id) : by.css(this.selector);
    const target = element(locator);

    target.click();

    projectsMultipleStatus.forEach(function (projects){
        FU.uiSelect('$ctrl.selectedProjects', projects);
    });
  },
};
