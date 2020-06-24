/* global $$ */
const FU = require('./FormUtils');

const bhUserSelect = require('./components/bhUserSelect');
const bhPeriodSelect = require('./components/bhPeriodSelect');
const bhDepotSelect = require('./components/bhDepotSelect');
const bhInventorySelect = require('./components/bhInventorySelect');
const bhDateInterval = require('./components/bhDateInterval');
const bhTransactionTypeSelect = require('./components/bhTransactionTypeSelect');
const bhSupplierSelect = require('./components/bhSupplierSelect');
const bhFluxSelect = require('./components/bhFluxSelect');
const bhEntitySelect = require('./components/bhEntitySelect');
const bhEntityTypeSelect = require('./components/bhEntityTypeSelect');
const bhServiceOrDepotSelect = require('./components/bhServiceOrDepot');
const bhServiceSelect = require('./components/bhServiceSelect');

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
    return FU.select('$ctrl.searchQueries.service_uuid', service, this.element);
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

  setServiceUuid(service) {
    return bhServiceSelect.set(service);
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

  setRequestor(requestor, type) {
    return bhServiceOrDepotSelect.set(requestor, type);
  }

  submit() {
    return FU.buttons.submit();
  }

  /**
   * reset
   */
  async reset() {
    const clearButtons = await $$('[data-reset-input]');
    // start clean from the bottom to the top
    // because if the clean start from the top and arrive in the bottom, top elements
    // are not visible
    for (let i = clearButtons.length - 1; i >= 0; i--) {
      const clearBtn = clearButtons[i];
      // eslint-disable-next-line
      await clearBtn.click();
    }
  }
}

SearchModal.open = () => FU.buttons.search();

module.exports = SearchModal;
