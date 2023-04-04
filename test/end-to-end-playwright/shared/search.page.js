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
    this.element = await TU.locator(`[data-modal="${dataAttribute}"]`);
  }

  async switchToCustomFilterTab() {
    const tab = await this.element.locator(CUSTOM_FILTER_TAB);
    return tab.click();
  }

  async switchToDefaultFilterTab() {
    const tab = await this.element.locator(DEFAULT_FILTER_TAB);
    return tab.click();
  }

  isOnDefaultFilterTab() {
    const tab = await this.element.locator(DEFAULT_FILTER_TAB);
    const tabClass = await tab.getAttribute('class');
    return tabClass.includes('active');
  }

  isOnCustomFilterTab() {
    const tab = await this.element.locator(CUSTOM_FILTER_TAB);
    const tabClass = await tab.getAttribute('class');
    return tabClass.includes('active');
  }

  setCashbox(cashbox) {
    return TU.uiSelect('$ctrl.searchQueries.cashbox_id', cashbox, this.element);
  }

  setService(service) {
    return TU.select('$ctrl.searchQueries.service_uuid', service, this.element);
  }

  setDebtorGroup(name) {
    return TU.uiSelect('$ctrl.searchQueries.debtor_group_uuid', name, this.element);
  }

  setInventoryGroup(name) {
    return TU.uiSelect('$ctrl.searchQueries.group_uuid', name, this.element);
  }

  setPatientGroup(name) {
    return TU.uiSelect('$ctrl.searchQueries.patient_group_uuid', name, this.element);
  }

  setReference(reference) {
    return TU.input('$ctrl.searchQueries.reference', reference, this.element);
  }

  setDescription(description) {
    return TU.input('$ctrl.searchQueries.description', description, this.element);
  }

  setEntryExit(value) {
    return TU.radio('$ctrl.searchQueries.is_exit', value);
  }

  /*
   NOTE:
   Since these modules are shared between all search forms, please make sure you always use
   setReference() for searching on the reference of the document contained in the current
   registry under test.  Use the other setXXXReference() when you need to filter by references
   _not_ contained in the registry under test.
  */
  setPatientReference(reference) {
    return TU.input('$ctrl.searchQueries.patientReference', reference, this.element);
  }

  setCashReference(reference) {
    return TU.input('$ctrl.searchQueries.cashReference', reference, this.element);
  }

  setInvoiceReference(reference) {
    return TU.input('$ctrl.searchQueries.invoiceReference', reference, this.element);
  }

  setLimit(limit) {
    return TU.input('$ctrl.defaultQueries.limit', limit, this.element);
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
    return TU.input('$ctrl.searchQueries.label', label, this.element);
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
    return this.element.(await TU.locator('[data-method="submit"')).click();
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
    return TU.buttons.submit();
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

SearchModal.open = () => TU.buttons.search();

module.exports = SearchModal;
