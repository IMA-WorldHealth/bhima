/* eslint  */
/**
 * This class represents a modal search page
 * behaviour so it is a modal search page object
 */

const FU = require('../shared/FormUtils');
const components = require('../shared/components');

class SearchModalPage {
  payrollPeriod(period) {
    return components.payrollPeriodSelect.set(period);
  }

  selectCurrency(currency) {
    return components.currencySelect.set(currency);
  }

  submit() {
    return FU.modal.submit();
  }
}

module.exports = SearchModalPage;
