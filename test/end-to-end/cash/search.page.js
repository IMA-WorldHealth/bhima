const FU = require('../shared/FormUtils');
const bhUserSelect = require('../shared/components/bhUserSelect');
const bhPeriodSelect = require('../shared/components/bhPeriodSelect');

const CUSTOM_FILTER_TAB = '[data-custom-filter-tab]';
const DEFAULT_FILTER_TAB = '[data-default-filter-tab]';

class SearchModal {

  // specify the modal attribute to use.
  constructor(dataAttribute) {
    this.element = $(`[data-modal="${dataAttribute}"]`);
  }

  switchToCustomFilterTab() {
    this.element.$(CUSTOM_FILTER_TAB).click();
  }

  switchToDefaultFilterTab() {
    this.element.$(DEFAULT_FILTER_TAB).click();
  }

  isOnDefaultFilterTab() {
    const tab = this.element.$(DEFAULT_FILTER_TAB);
    return tab
      .getAttribute('class')
      .then(classString => classString.contains('active'));
  }

  isOnCustomFilterTab() {
    const tab = this.element.$(CUSTOM_FILTER_TAB);
    return tab
      .getAttribute('class')
      .then(classString => classString.contains('active'));
  }

  setCashbox(cashbox) {
    FU.uiSelect('$ctrl.searchQueries.cashbox_id', cashbox, this.element);
  }

  setPatientReference(reference) {
    FU.input('$ctrl.searchQueries.patientReference', reference, this.element);
  }

  setPaymentReference(reference) {
    FU.input('$ctrl.searchQueries.reference', reference, this.element);
  }

  setLimit(limit) {
    FU.input('$ctrl.defaultQueries.limit', limit, this.element);
  }

  /* eslint class-methods-use-this: "off" */
  setUser(user) {
    bhUserSelect.set(user);
  }

  setPeriod(period) {
    bhPeriodSelect.select(period);
  }

  setDebtorGroup(debtorGroup) {
    FU.select('$ctrl.searchQueries.debtor_group_uuid', debtorGroup, this.element);
  }

  setCustomPeriod(start, end) {
    bhPeriodSelect.custom(start, end);
  }

  close() {
    this.element.$('[data-method="submit"').click();
  }

  submit() {
    FU.buttons.submit();
  }
}

SearchModal.open = () => FU.buttons.search();

module.exports = SearchModal;
