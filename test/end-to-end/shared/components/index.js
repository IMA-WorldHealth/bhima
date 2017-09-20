/**
 * Component Test Wrappers
 *
 * This module exposes individual test wrappers for componets created in bhima.
 * The idea is to prevent collisions when updating or working on individual
 * component's tests suites.
 *
 * @module e2e/componets
 * @public
 */

module.exports = {
  currencySelect : require('./bhCurrencySelect'),
  locationSelect : require('./bhLocationSelect'),
  currencyInput  : require('./bhCurrencyInput'),
  findPatient    : require('./bhFindPatient'),
  dateEditor     : require('./bhDateEditor'),
  modalAction    : require('./bhModalAction'),
  notification   : require('./notify'),
  dateInterval   : require('./bhDateInterval'),
  reportPeriodSelect : require('./bhReportPeriodSelect'),
  accountSelect  : require('./bhAccountSelect'),
  datePicker     : require('./bhDatePicker'),
  userSelect     : require('./bhUserSelect'),
  reportSource   : require('./bhReportSource'),
  fiscalPeriodSelect          : require('./bhFiscalPeriodSelect'),
  debtorGroupSelect           : require('./bhDebtorGroupSelect'),
  multipleDebtorGroupSelect   : require('./bhMultipleDebtorGroupSelect'),
  depotSelect                 : require('./bhDepotSelect'),
  inventorySelect             : require('./bhInventorySelect'),
  transactionTypeSelect       : require('./bhTransactionTypeSelect'),
  patientGroupSelect          : require('./bhPatientGroupSelect'),
  supplierSelect              : require('./bhSupplierSelect'),
  stockEntryExitType          : require('./bhStockEntryExitType'),
  cashboxSelect               : require('./bhCashBoxSelect'),
  addItem                     : require('./bhAddItem'),
};
