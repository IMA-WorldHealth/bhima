/**
 * This class represents a modal search page
 * behaviour so it is a modal search page object
 */

const FU = require('../shared/FormUtils');
const components = require('../shared/components');

class SearchModalPage {

  payrollPeriod(period) {
    components.payrollPeriodSelect.set(period);
  }

  selectCurrency(currency) {
    components.currencySelect.set(currency);
  }

  submit() {
    FU.modal.submit();
  }

}

module.exports = SearchModalPage;
