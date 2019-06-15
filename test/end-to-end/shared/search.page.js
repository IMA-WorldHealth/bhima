const FU = require('../shared/FormUtils');

const bhUserSelect = require('../shared/components/bhUserSelect');
const bhPeriodSelect = require('../shared/components/bhPeriodSelect');
const bhDepotSelect = require('../shared/components/bhDepotSelect');
const bhInventorySelect = require('../shared/components/bhInventorySelect');
const bhDateInterval = require('../shared/components/bhDateInterval');
const bhTransactionTypeSelect = require('../shared/components/bhTransactionTypeSelect');
const bhSupplierSelect = require('../shared/components/bhSupplierSelect');
const bhFluxSelect = require('../shared/components/bhFluxSelect');
const bhEntitySelect = require('../shared/components/bhEntitySelect');
const bhEntityTypeSelect = require('../shared/components/bhEntityTypeSelect');

const CUSTOM_FILTER_TAB = '[data-custom-filter-tab]';
const DEFAULT_FILTER_TAB = '[data-default-filter-tab]';

/**
 * @class SearchModal
 *
 * @description
 * A generic wrapper for all search forms.  It's gigantic so that the spec.js
 * runners can be smaller.  It should be able to handle most test runners as
 * needed.
 *
 * @example
 * let modal;
 * beforeEach(() => {
 *   modal = new SearchModal('your-search-modal-attribute');
 *   SearchModal.open();
 * });
 *
 * it('can do stuff', () => {
 *   modal.setReference('TP.OKY.1');
 *   modal.submit();
 * });
 */
class SearchModal {
  constructor(dataAttribute) {
    // specify the modal attribute to use.
    this.element = $(`[data-modal="${dataAttribute}"]`);
  }

  switchToCustomFilterTab() {
    return this.element.$(CUSTOM_FILTER_TAB).click();
  }

  switchToDefaultFilterTab() {
    return this.element.$(DEFAULT_FILTER_TAB).click();
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
    return FU.uiSelect('$ctrl.searchQueries.cashbox_id', cashbox, this.element);
  }

  setService(service) {
    return FU.select('$ctrl.searchQueries.service_id', service, this.element);
  }

  setDebtorGroup(name) {
    return FU.uiSelect('$ctrl.searchQueries.debtor_group_uuid', name, this.element);
  }

  setInventoryGroup(name) {
    return FU.uiSelect('$ctrl.searchQueries.group_uuid', name, this.element);
  }

  setPatientGroup(name) {
    return FU.uiSelect('$ctrl.searchQueries.patient_group_uuid', name, this.element);
  }

  setReference(reference) {
    return FU.input('$ctrl.searchQueries.reference', reference, this.element);
  }

  setDescription(description) {
    return FU.input('$ctrl.searchQueries.description', description, this.element);
  }

  setEntryExit(value) {
    return FU.radio('$ctrl.searchQueries.is_exit', value);
  }

  /*
   NOTE:
   Since these modules are shared between all search forms, please make sure you always use
   setReference() for searching on the reference of the document contained in the current
   registry under test.  Use the other setXXXReference() when you need to filter by references
   _not_ contained in the registry under test.
  */
  setPatientReference(reference) {
    return FU.input('$ctrl.searchQueries.patientReference', reference, this.element);
  }

  setCashReference(reference) {
    return FU.input('$ctrl.searchQueries.cashReference', reference, this.element);
  }

  setInvoiceReference(reference) {
    return FU.input('$ctrl.searchQueries.invoiceReference', reference, this.element);
  }

  setLimit(limit) {
    return FU.input('$ctrl.defaultQueries.limit', limit, this.element);
  }

  /* eslint  */
  setUser(user) {
    return bhUserSelect.set(user);
  }

  setSupplier(supplier) {
    return bhSupplierSelect.set(supplier);
  }

  setDepot(depot) {
    return bhDepotSelect.set(depot);
  }

  setInventory(inventory) {
    return bhInventorySelect.set(inventory);
  }

  setLotLabel(label) {
    return FU.input('$ctrl.searchQueries.label', label, this.element);
  }

  setdateInterval(dateFrom, dateTo, id) {
    return bhDateInterval.range(dateFrom, dateTo, id);
  }

  setTransactionType(transactionTypes) {
    return bhTransactionTypeSelect.set(transactionTypes);
  }

  setPeriod(period) {
    return bhPeriodSelect.select(period);
  }

  setCustomPeriod(start, end) {
    return bhPeriodSelect.custom(start, end);
  }

  close() {
    return this.element.$('[data-method="submit"').click();
  }

  setMovementReason(flux) {
    return bhFluxSelect.set(flux);
  }

  setEntity(entity) {
    return bhEntitySelect.set(entity);
  }

  setEntityType(type) {
    return bhEntityTypeSelect.set(type);
  }

  submit() {
    return FU.buttons.submit();
  }
}

SearchModal.open = () => FU.buttons.search();

module.exports = SearchModal;
