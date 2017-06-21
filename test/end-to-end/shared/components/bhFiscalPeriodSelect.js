/* global browser, element, by */

const FU = require('../FormUtils');

module.exports = {
  mainSelector : '[bh-fiscal-period-select]',
  periodSelector : '[data-period-select]',
  set      : function set(fiscal_year_id, periods, id) {
      var opts, periodUibSelect;
    /** return selector for an option element */
    function getValue(id) {
      return by.css('option[value="number:?"]'.replace('?', id));
    }

    const bhFiscalPeriod = (id) ? element(by.id(id)) : element(by.css(this.mainSelector));

    opts = bhFiscalPeriod.element(by.model('$ctrl.selectedFiscal'));
    opts.element(getValue(fiscal_year_id)).click();

    periods.forEach(function (period){
        FU.uiSelect('$ctrl.selectedPeriods', period);
    });

    // click away to free the space
    element(by.id("logo")).click();
  },
};