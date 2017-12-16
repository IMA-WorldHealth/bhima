/* global browser, element, by */

const FU = require('../FormUtils');

module.exports = {
  selector : '[bh-multiple-debtor-group-select]',
  set      : function set(debtorGroups, id) {
    const locator = (id) ? by.id(id) : by.css(this.selector);
    const target = element(locator);

    target.click();

    debtorGroups.forEach(function (dg){
        FU.uiSelect('$ctrl.selectedDebtorGroups', dg);
    });

    element(by.id('logo')).click();
  },
};
