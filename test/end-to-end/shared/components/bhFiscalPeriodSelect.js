const TU = require('../TestUtils');
const { by } = require('../TestUtils');

const mainSelector = '[bh-fiscal-period-select]';

module.exports = {

  set : async function set(fiscalYearId, periodFromId, periodToId, id) {
    const getValue = ident => `option[value="number:${ident}"]`;
    const getById = ident => `option[value="${ident}"]`;

    const bhFiscalPeriod = (id) ? TU.locator(by.id(id)) : TU.locator(mainSelector);

    let opts = bhFiscalPeriod.locator(by.model('$ctrl.selectedFiscal'));
    await opts.locator(getValue(fiscalYearId)).click();

    opts = bhFiscalPeriod.locator(by.model('$ctrl.selectedPeriodFrom'));
    await opts.locator(getById(periodFromId)).click();

    opts = bhFiscalPeriod.locator(by.model('$ctrl.selectedPeriodTo'));
    return opts.locator(getById(periodToId)).click();
  },
};
