const TU = require('../shared/TestUtils');

/**
 * This class represents a modal search page
 * behaviour so it is a modal search page object
 */

const components = require('../shared/components');

class SearchModalPage {
  payrollPeriod(period) {
    return components.payrollPeriodSelect.set(period);
  }

  selectCurrency(currency) {
    return components.currencySelect.set(currency);
  }

  submit() {
    return TU.modal.submit();
  }
}

module.exports = SearchModalPage;
