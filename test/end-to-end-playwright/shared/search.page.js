const TU = require('./TestUtils');

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
 * A generic wrapper for all search forms.  It's gigantic so that the spec.js
 * runners can be smaller.  It should be able to handle most test runners as
 * needed.
 *
 * @example
 * let modal;
 * beforeEach(() => {
 *   modal = new SearchModal('your-search-modal-attribute');
 *   await modal.init();
 *   await SearchModal.open();
 * });
 *
 * test('can do stuff', () => {
 *   modal.setReference('TP.OKY.1');
 *   modal.submit();
 * });
 */
class SearchModal {
  constructor(selector) {
    this.selector = `[data-modal="${selector}"]`;
  }

  async init() {
    this.element = await TU.locator(this.selector);
  }

  async open() {
    return TU.buttons.search();
  }

  async close() {
    return TU.buttons.submit();
  }

  async submit() {
    return TU.buttons.submit();
  }

  async switchToCustomFilterTab() {
    const tab = await this.element.locator(CUSTOM_FILTER_TAB);
    return tab.click();
  }

  async switchToDefaultFilterTab() {
    const tab = await this.element.locator(DEFAULT_FILTER_TAB);
    return tab.click();
  }

  async isOnDefaultFilterTab() {
    const tab = await this.element.locator(DEFAULT_FILTER_TAB);
    const tabClass = await tab.getAttribute('class');
    return tabClass.includes('active');
  }

  async isOnCustomFilterTab() {
    const tab = await this.element.locator(CUSTOM_FILTER_TAB);
    const tabClass = await tab.getAttribute('class');
    return tabClass.includes('active');
  }

  async setCashbox(cashbox) {
    return TU.uiSelect('$ctrl.searchQueries.cashbox_id', cashbox, this.element);
  }

  async setService(service) {
    return TU.select('$ctrl.searchQueries.service_uuid', service, this.element);
  }

  async setDebtorGroup(name) {
    return TU.uiSelect('$ctrl.searchQueries.debtor_group_uuid', name, this.element);
  }

  async setInventoryGroup(name) {
    return TU.uiSelect('$ctrl.searchQueries.group_uuid', name, this.element);
  }

  async setPatientGroup(name) {
    return TU.uiSelect('$ctrl.searchQueries.patient_group_uuid', name, this.element);
  }

  async setReference(reference) {
    return TU.input('$ctrl.searchQueries.reference', reference, this.element);
  }

  async setDescription(description) {
    return TU.input('$ctrl.searchQueries.description', description, this.element);
  }

  async setEntryExit(value) {
    return TU.radio('$ctrl.searchQueries.is_exit', value);
  }

  /*
   NOTE:
   Since these modules are shared between all search forms, please make sure you always use
   setReference() for searching on the reference of the document contained in the current
   registry under test.  Use the other setXXXReference() when you need to filter by references
   _not_ contained in the registry under test.
  */
  async setPatientReference(reference) {
    return TU.input('$ctrl.searchQueries.patientReference', reference, this.element);
  }

  async setCashReference(reference) {
    return TU.input('$ctrl.searchQueries.cashReference', reference, this.element);
  }

  async setInvoiceReference(reference) {
    return TU.input('$ctrl.searchQueries.invoiceReference', reference, this.element);
  }

  async setLimit(limit) {
    return TU.input('$ctrl.defaultQueries.limit', limit, this.element);
  }

  async setUser(user) {
    return bhUserSelect.set(user);
  }

  async setSupplier(supplier) {
    return bhSupplierSelect.set(supplier);
  }

  async setDepot(depot) {
    return bhDepotSelect.set(depot);
  }

  async setServiceUuid(service) {
    return bhServiceSelect.set(service);
  }

  async setInventory(inventory) {
    return bhInventorySelect.set(inventory);
  }

  async setLotLabel(label) {
    return TU.input('$ctrl.searchQueries.label', label, this.element);
  }

  async setdateInterval(dateFrom, dateTo, id) {
    return bhDateInterval.range(dateFrom, dateTo, id);
  }

  async setTransactionType(transactionTypes) {
    return bhTransactionTypeSelect.set(transactionTypes);
  }

  async setPeriod(period) {
    return bhPeriodSelect.select(period);
  }

  async setCustomPeriod(start, end) {
    return bhPeriodSelect.custom(start, end);
  }

  async setMovementReason(flux) {
    return bhFluxSelect.set(flux);
  }

  async setEntity(entity) {
    return bhEntitySelect.set(entity);
  }

  async setEntityType(type) {
    return bhEntityTypeSelect.set(type);
  }

  async setRequestor(requestor, type) {
    return bhServiceOrDepotSelect.set(requestor, type);
  }

  /**
   * reset
   */
  async reset() {
    const clearButtons = await (await TU.locator('[data-reset-input]')).all();
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

module.exports = SearchModal;
