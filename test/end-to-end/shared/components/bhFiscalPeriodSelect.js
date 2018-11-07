/* global element, by */

module.exports = {
  mainSelector : '[bh-fiscal-period-select]',
  set : function set(fiscalYearId, periodFromId, periodToId, id) {
    const getValue = ident => by.css(`option[value="number:${ident}"]`);
    const getById = ident => by.css(`option[value="${ident}"]`);

    const bhFiscalPeriod = (id) ? element(by.id(id)) : element(by.css(this.mainSelector));

    let opts = bhFiscalPeriod.element(by.model('$ctrl.selectedFiscal'));
    opts.element(getValue(fiscalYearId)).click();

    opts = bhFiscalPeriod.element(by.model('$ctrl.selectedPeriodFrom'));
    opts.element(getById(periodFromId)).click();

    opts = bhFiscalPeriod.element(by.model('$ctrl.selectedPeriodTo'));
    opts.element(getById(periodToId)).click();
  },
};
