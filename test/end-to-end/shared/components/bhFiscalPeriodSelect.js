/* global browser, element, by */

const FU = require('../FormUtils');

module.exports = {
  mainSelector : '[bh-fiscal-period-select]',
  set : function set(fiscal_year_id, periodFrom_id, periodTo_id, id) {
      var opts;
    /** return selector for an option element */
    function getValue(id) {
      return by.css('option[value="number:?"]'.replace('?', id));
    }

    const bhFiscalPeriod = (id) ? element(by.id(id)) : element(by.css(this.mainSelector));

    opts = bhFiscalPeriod.element(by.model('$ctrl.selectedFiscal'));
    opts.element(getValue(fiscal_year_id)).click();

    opts = bhFiscalPeriod.element(by.model('$ctrl.selectedPeriodFrom'));
    opts.element(getValue(periodFrom_id)).click();

    opts = bhFiscalPeriod.element(by.model('$ctrl.selectedPeriodTo'));
    opts.element(getValue(periodTo_id)).click();
  },
};