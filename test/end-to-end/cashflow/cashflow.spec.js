/* global element, by */

const components = require('../shared/components');
const FU = require('../shared/FormUtils');
const helpers = require('../shared/helpers');

describe.skip('Cashflow report generator', () => {
  before(() => helpers.navigate('#/finance/reports/cashflow'));

  // TODO client side report removed, required update for server PDF success
  it('GET /finance/cashflow return cashflow report at the client', () => {
    // set report configurations
    // date interval component admit date in this format : dd/MM/yyyy
    components.dateInterval.range('01/01/2016', '31/12/2016');
    FU.select('CashflowConfigCtrl.cashbox', 'Cashbox $');

    // focus on the button zone
    const area = element(by.css('[data-submit-area]'));
    area.element(by.css('[data-method="submit"]')).click();

    // cashflow report
    const locator = by.css('[data-show-details]');
    FU.exists(locator, true);
    element(locator).click();
  });
});
