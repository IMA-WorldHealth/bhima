/* eslint global-require:"off" */
/**
 * Component Test Wrappers
 *
 * This module exposes individual test wrappers for components created in bhima.
 * The idea is to prevent collisions when updating or working on individual
 * component's tests suites.
 *
 * @module e2e/componets
 * @public
 */
module.exports = {
  currencySelect : require('./bhCurrencySelect'),
  locationSelect : require('./bhLocationSelect'),
  currencyInput : require('./bhCurrencyInput'),
  findPatient : require('./bhFindPatient'),
  dateEditor : require('./bhDateEditor'),
  modalAction : require('./bhModalAction'),
  notification : require('./notify'),
  dateInterval : require('./bhDateInterval'),
  reportPeriodSelect : require('./bhReportPeriodSelect'),
  accountSelect : require('./bhAccountSelect'),
  datePicker : require('./bhDatePicker'),
  userSelect : require('./bhUserSelect'),
  reportSource : require('./bhReportSource'),
  fiscalPeriodSelect : require('./bhFiscalPeriodSelect'),
  fiscalYearSelect : require('./bhFiscalYearSelect'),
  debtorGroupSelect : require('./bhDebtorGroupSelect'),
  multipleDebtorGroupSelect : require('./bhMultipleDebtorGroupSelect'),
  depotSelect : require('./bhDepotSelect'),
  inventorySelect : require('./bhInventorySelect'),
  transactionTypeSelect : require('./bhTransactionTypeSelect'),
  patientGroupSelect : require('./bhPatientGroupSelect'),
  supplierSelect : require('./bhSupplierSelect'),
  stockEntryExitType : require('./bhStockEntryExitType'),
  cashboxSelect : require('./bhCashBoxSelect'),
  addItem : require('./bhAddItem'),
  serviceSelect : require('./bhServiceSelect'),
  inventoryGroupSelect : require('./bhInventoryGroupSelect'),
  inventoryTypeSelect : require('./bhInventoryTypeSelect'),
  projectSelect : require('./bhProjectSelect'),
  fonctionSelect : require('./bhFonctionSelect'),
  gradeSelect : require('./bhGradeSelect'),
  purchaseStatusSelect : require('./bhPurchaseStatusSelect'),
  multipleDepotSelect : require('./bhMultipleDepotSelect'),
  fluxSelect : require('./bhFluxSelect'),
  multipleCashBoxSelect : require('./bhMultipleCashBoxSelect'),
  employeeSelect : require('./bhEmployeeSelect'),
  iprScale : require('./bhIprScale'),
  iprConfigSelect : require('./bhIprConfigSelect'),
  rubricConfigSelect : require('./bhRubricConfigSelect'),
  accountConfigSelect : require('./bhAccountConfigSelect'),
  weekConfigSelect : require('./bhWeekConfigSelect'),
  yesNoRadios : require('./bhYesNoRadios'),
  findInvoice : require('./bhFindInvoice'),
  payrollPeriodSelect : require('./bhPayrollPeriodSelect'),
  periodSelection : require('./bhPeriodSelection'),
  employeeConfigSelect : require('./bhEmployeeConfigSelect'),
  projectsMultipleSelect : require('./bhProjectsMultipleSelect'),
  accountReferenceSelect : require('./bhAccountReferenceSelect'),
};
