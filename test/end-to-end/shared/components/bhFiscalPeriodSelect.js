/* global element, by */


const FU = require('../FormUtils');

module.exports = {
  selector : '[bh-fiscal-period-select]',
  set      : function set(fiscalId, periodFromId, periodToId, id) {
    const locator = (id) ? by.id(id) : by.css(this.selector);
    const target = element(locator);
    target.click();

    FU.uiSelect('$ctrl.selectedFiscal', fiscalId, target);

    FU.uiSelect('$ctrl.selectedPeriodFrom', periodFromId, target);
    // search period to by it label
    FU.uiSelect('$ctrl.selectedPeriodTo', periodToId, target);
  },
};

