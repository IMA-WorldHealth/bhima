/**
 * @overview routes
 * Application Routing
 *
 * This file initializes the links between route controllers and the express
 * HTTP server.
 *
 * @todo Pass authenticate and authorize middleware down through controllers,
 * allowing for modules to subscribe to different levels of authority
 *
 * @requires uploader
 */

const debug = require('debug')('app');
const upload = require('../lib/uploader');

// unclassified routes
const auth = require('../controllers/auth');
const tree = require('../controllers/tree');
const units = require('../controllers/units');
const system = require('../controllers/system');
const report = require('../controllers/report');
const install = require('../controllers/install');

// admin routes
const rolesCtrl = require('../controllers/admin/roles');
const users = require('../controllers/admin/users');
const projects = require('../controllers/admin/projects');
const enterprises = require('../controllers/admin/enterprises');
const helpdesk = require('../controllers/admin/helpdesk');
const services = require('../controllers/admin/services');
const suppliers = require('../controllers/admin/suppliers');
const functions = require('../controllers/admin/functions');
const grades = require('../controllers/admin/grades');
const holidays = require('../controllers/admin/holidays');
const offdays = require('../controllers/admin/offdays');
const iprTax = require('../controllers/admin/iprTax');
const languages = require('../controllers/admin/languages');
const locations = require('../controllers/admin/locations');
const groups = require('../controllers/groups');
const entities = require('../controllers/admin/entities');
const cron = require('../controllers/admin/cron');
const cronEmailReport = require('../controllers/admin/cronEmailReport');

// payroll routes
const payrollConfig = require('../controllers/payroll/configuration');
const rubrics = require('../controllers/payroll/rubrics');
const rubricConfig = require('../controllers/payroll/rubricConfig');
const accountConfig = require('../controllers/payroll/accounts');
const weekendConfig = require('../controllers/payroll/weekendConfig');
const employeeConfig = require('../controllers/payroll/employeeConfig');
const multiplePayroll = require('../controllers/payroll/multiplePayroll');
const multiplePayrollIndice = require('../controllers/payroll/multiplePayrollIndice');
const staffingIndices = require('../controllers/payroll/staffingIndices');
const staffingIndicesReport = require('../controllers/payroll/staffingIndices/report');
// medical routes
const patients = require('../controllers/medical/patients');
const patientGroups = require('../controllers/medical/patientGroups');
const snis = require('../controllers/medical/snis');
const medicalReports = require('../controllers/medical/reports');
const diagnoses = require('../controllers/medical/diagnoses');

// human resources routes
const employees = require('../controllers/payroll/employees');
const employeeReports = require('../controllers/payroll/reports');

// stock and inventory routes
const inventory = require('../controllers/inventory');
const depots = require('../controllers/inventory/depots');
const inventoryReports = require('../controllers/inventory/reports');
const stock = require('../controllers/stock');
const stockReports = require('../controllers/stock/reports');
const stockSetting = require('../controllers/stock/setting');

// finance routes
const trialBalance = require('../controllers/finance/trialBalance');
const fiscal = require('../controllers/finance/fiscal');
const purchases = require('../controllers/finance/purchases');
const debtors = require('../controllers/finance/debtors');
const cashboxes = require('../controllers/finance/cashboxes');
const exchange = require('../controllers/finance/exchange');
const cash = require('../controllers/finance/cash');
const priceList = require('../controllers/finance/priceLists');
const priceListPreport = require('../controllers/finance/reports/priceList');
const invoicingFees = require('../controllers/finance/invoicingFees');
const unpaidInvoicePayments = require('../controllers/finance/reports/unpaid-invoice-payments');
const accounts = require('../controllers/finance/accounts');
const subsidies = require('../controllers/finance/subsidies');
const patientInvoice = require('../controllers/finance/patientInvoice');
const financeReports = require('../controllers/finance/reports');
const discounts = require('../controllers/finance/discounts');
const debtorGroups = require('../controllers/finance/debtors/groups');
const currencies = require('../controllers/finance/currencies');
const vouchers = require('../controllers/finance/vouchers');
const creditorGroups = require('../controllers/finance/creditorGroups');
const creditors = require('../controllers/finance/creditors.js');
const journal = require('../controllers/finance/journal');
const transactionType = require('../controllers/admin/transactionType');
const generalLedger = require('../controllers/finance/generalLedger');
const voucherTools = require('../controllers/finance/voucherTools');
const systemUsage = require('../controllers/finance/reports/systemUsage');

const dashboardDebtors = require('../controllers/dashboard/debtorGroups');
const stats = require('../controllers/dashboard/stats');
const transactions = require('../controllers/finance/transactions');

// looking up an entity by it reference
const referenceLookup = require('../lib/referenceLookup');

const tags = require('../controllers/admin/tags');

const ward = require('../controllers/medical/ward/ward');
const room = require('../controllers/medical/ward/room');
const bed = require('../controllers/medical/ward/bed');
const dischargeTypes = require('../controllers/medical/dischargeTypes');

const feeCenter = require('../controllers/finance/feeCenter');

const distributionConfiguration = require('../controllers/finance/distributionFeeCenter/configuration');
const distributionGetDistributed = require('../controllers/finance/distributionFeeCenter/getDistributed');
const distributionProceed = require('../controllers/finance/distributionFeeCenter/proceed');
const distributionBreakDown = require('../controllers/finance/distributionFeeCenter/breakDown');
const distributionAutomatic = require('../controllers/finance/distributionFeeCenter/automatic');
const distributionGetDistributionKey = require('../controllers/finance/distributionFeeCenter/getDistributionKey');
const setDistributionKey = require('../controllers/finance/distributionFeeCenter/setting');

const accountReferenceType = require('../controllers/finance/accounts/accountReferenceType');
const indicators = require('../controllers/finance/indicator');
const breakEvenReference = require('../controllers/finance/breakEvenReference');

const debtorSummaryReport = require('../controllers/finance/reports/debtors/summaryReport');
const clientDebts = require('../controllers/finance/reports/client_debts');
const clientSupport = require('../controllers/finance/reports/client_support');
const realizedProfit = require('../controllers/finance/reports/realized_profit');
const recoveryCapacity = require('../controllers/finance/reports/recovery_capacity');

// periods
const period = require('../controllers/finance/period');

// lots
const lots = require('../controllers/stock/lots');

// todo: the indicator folder must not be inside the finance folder
const dashboard = require('../controllers/finance/indicator/dashboard');
const indicatorRerpor = require('../controllers/finance/indicator/dashboard/report');

// Data Kit
const dataCollectorManagement = require('../controllers/admin/dataCollectorManagement');
const choicesListManagement = require('../controllers/admin/choicesListManagement');
const surveyForm = require('../controllers/admin/surveyForm');
const fillFormsData = require('../controllers/admin/fillFormsData');
const displayMetadata = require('../controllers/admin/displayMetadata');
const displayMetadataReport = require('../controllers/admin/metadataReport');
const configurationAnalysisTools = require('../controllers/finance/configurationAnalysisTools');

// expose routes to the server.
exports.configure = function configure(app) {
  debug('configuring routes.');

  // exposed to the outside without authentication
  app.get('/languages', languages.list);
  app.get('/projects', projects.list);
  app.get('/units', units.list);

  // auth gateway
  app.post('/auth/login', auth.login);
  app.get('/auth/logout', auth.logout);
  app.post('/auth/reload', auth.reload);

  // system and event helpers
  app.get('/system/information', system.info);

  // dashbord stats
  app.get('/patients/stats', stats.patients);
  app.get('/invoices/stats', stats.invoices);

  // exchange rate modules
  app.get('/exchange', exchange.list);
  app.post('/exchange', exchange.create);
  app.put('/exchange/:id', exchange.update);
  app.delete('/exchange/:id', exchange.delete);

  // API for locations
  app.get('/locations/villages', locations.villages);
  app.get('/locations/sectors', locations.sectors);
  app.get('/locations/provinces', locations.provinces);
  app.get('/locations/countries', locations.countries);
  app.post('/locations/countries', locations.create.country);
  app.post('/locations/provinces', locations.create.province);
  app.post('/locations/sectors', locations.create.sector);
  app.post('/locations/villages', locations.create.village);

  app.get('/locations/detail/:uuid', locations.detail);
  app.get('/locations/detail/', locations.list);

  app.put('/locations/villages/:uuid', locations.update.village);
  app.put('/locations/sectors/:uuid', locations.update.sector);
  app.put('/locations/provinces/:uuid', locations.update.province);
  app.put('/locations/countries/:uuid', locations.update.country);

  app.delete('/locations/countries/:uuid', locations.delete.country);
  app.delete('/locations/provinces/:uuid', locations.delete.province);
  app.delete('/locations/sectors/:uuid', locations.delete.sector);
  app.delete('/locations/villages/:uuid', locations.delete.village);

  app.post('/locations/merge/', locations.merge);

  app.post('/groups/:key/:id', groups.updateSubscriptions);

  // API for account type routes CRUD
  app.get('/accounts/types', accounts.types.list);
  app.get('/accounts/types/:id', accounts.types.detail);
  app.post('/accounts/types', accounts.types.create);
  app.put('/accounts/types/:id', accounts.types.update);
  app.delete('/accounts/types/:id', accounts.types.remove);

  // API for account categories routes CRUD
  app.get('/accounts/categories', accounts.categories.list);
  app.get('/accounts/categories/:id', accounts.categories.detail);
  app.post('/accounts/categories', accounts.categories.create);
  app.put('/accounts/categories/:id', accounts.categories.update);
  app.delete('/accounts/categories/:id', accounts.categories.remove);

  // API for account reference CRUD
  app.get('/accounts/references/values/:periodId', accounts.references.getAllValues);
  app.get('/accounts/references/values/:periodId/:abbr/:isAmoDep?', accounts.references.getValue);
  app.get('/accounts/references', accounts.references.list);
  app.get('/accounts/references/:id', accounts.references.detail);
  app.post('/accounts/references', accounts.references.create);
  app.put('/accounts/references/:id', accounts.references.update);
  app.delete('/accounts/references/:id', accounts.references.remove);
  app.get('/accounts/references/:id/accounts', accounts.references.getAccountsForReferenceHTTP);

  // API for account importation
  app.get('/accounts/template', accounts.importing.downloadTemplate);
  app.post('/accounts/import', upload.middleware('csv', 'file'), accounts.importing.importAccounts);

  // API for account routes crud
  app.get('/accounts', accounts.list);
  app.get('/accounts/:id', accounts.detail);
  app.get('/accounts/:id/balance', accounts.getBalance);
  app.get('/accounts/:id/balance/:fiscalYearId', accounts.getAnnualBalance);
  app.get('/accounts/:id/openingBalance', accounts.getOpeningBalanceForPeriod);
  app.post('/accounts', accounts.create);
  app.put('/accounts/:id', accounts.update);
  app.delete('/accounts/:id', accounts.remove);

  // API for service routes
  app.post('/services', services.create);
  app.get('/services', services.list);
  app.get('/services/count', services.countServiceByProject);
  app.get('/services/:uuid', services.detail);
  app.put('/services/:uuid', services.update);
  app.delete('/services/:uuid', services.remove);

  // API for subsidies routes crud
  app.get('/subsidies', subsidies.list);
  app.get('/subsidies/:id', subsidies.detail);
  app.post('/subsidies', subsidies.create);
  app.put('/subsidies/:id', subsidies.update);
  app.delete('/subsidies/:id', subsidies.remove);

  // API for journal
  app.get('/journal', journal.list);
  app.get('/journal/count', journal.count);

  // API for trial balance
  app.post('/journal/trialbalance', trialBalance.runTrialBalance);
  app.post('/journal/transactions', trialBalance.postToGeneralLedger);
  app.post('/journal/transactions/unpost', trialBalance.unpostTransactions);
  // API for journal
  app.get('/journal/:record_uuid', journal.getTransaction);
  app.post('/journal/:record_uuid/edit', journal.editTransaction);
  app.post('/journal/:uuid/reverse', journal.reverse);
  app.post('/journal/:uuid/correct', voucherTools.correct);
  app.put('/transactions/comments', transactions.commentTransactions);

  // API for general ledger
  app.get('/general_ledger', generalLedger.list);
  app.get('/general_ledger/transactions', generalLedger.getTransactions);
  app.get('/general_ledger/aggregates', generalLedger.getAggregates);

  app.get('/transactions/:uuid/history', journal.getTransactionEditHistory);
  app.delete('/transactions/:uuid', transactions.deleteRoute);

  /* fiscal year controller */
  app.get('/fiscal', fiscal.list);
  app.get('/fiscal/date', fiscal.getFiscalYearsByDate);
  app.get('/fiscal/:id', fiscal.detail);
  app.post('/fiscal', fiscal.create);
  app.put('/fiscal/:id', fiscal.update);
  app.delete('/fiscal/:id', fiscal.remove);

  app.get('/fiscal/:id/balance/:period_number?', fiscal.getBalance);
  app.get('/fiscal/:id/opening_balance', fiscal.getOpeningBalanceRoute);
  app.post('/fiscal/:id/opening_balance', fiscal.setOpeningBalance);
  app.put('/fiscal/:id/closing', fiscal.closing);
  app.get('/fiscal/:id/closing_balance', fiscal.getClosingBalanceRoute);

  app.get('/fiscal/:id/periods', fiscal.getPeriods);

  // periods API
  app.get('/periods', period.list);
  app.get('/periods/:id', period.details);

  /* load a user's tree */
  app.get('/tree', tree.generate);

  // snis controller
  app.get('/snis/healthZones', snis.healthZones);

  // Employee management
  app.get('/holiday_list/:pp/:employee_id', employees.listHolidays);
  app.get('/getCheckHollyday/', employees.checkHoliday);
  app.get('/getCheckOffday/', employees.checkOffday);

  /*  Inventory and Stock Management */
  app.post('/inventory/metadata', inventory.createInventoryItems);
  app.get('/inventory/metadata', inventory.getInventoryItems);
  app.get('/inventory/metadata/:uuid', inventory.getInventoryItemsById);
  app.put('/inventory/metadata/:uuid', inventory.updateInventoryItems);
  app.delete('/inventory/metadata/:uuid', inventory.deleteInventory);

  app.get('/inventory/log/:uuid', inventory.logs);
  app.get('/inventory/download/log/:uuid', inventory.logDownLoad);

  /** Inventory Group API endpoints */
  app.post('/inventory/groups', inventory.createInventoryGroups);
  app.get('/inventory/groups', inventory.listInventoryGroups);
  app.get('/inventory/groups/:uuid', inventory.detailsInventoryGroups);
  app.get('/inventory/groups/:uuid/count', inventory.countInventoryGroups);
  app.put('/inventory/groups/:uuid', inventory.updateInventoryGroups);
  app.delete('/inventory/groups/:uuid', inventory.deleteInventoryGroups);

  /** Inventory Type API endpoints */
  app.post('/inventory/types', inventory.createInventoryTypes);
  app.get('/inventory/types', inventory.listInventoryTypes);
  app.get('/inventory/types/:id', inventory.detailsInventoryTypes);
  app.put('/inventory/types/:id', inventory.updateInventoryTypes);
  app.delete('/inventory/types/:id', inventory.deleteInventoryTypes);

  /** Inventory Units API endpoints */
  app.post('/inventory/units', inventory.createInventoryUnits);
  app.get('/inventory/units', inventory.listInventoryUnits);
  app.get('/inventory/units/:id', inventory.detailsInventoryUnits);
  app.put('/inventory/units/:id', inventory.updateInventoryUnits);
  app.delete('/inventory/units/:id', inventory.deleteInventoryUnits);

  /** Inventory Import API endpoints */
  app.post('/inventory/import/', upload.middleware('csv', 'file'), inventory.importing.importInventories);
  app.get('/inventory/import/template_file', inventory.importing.downloadTemplate);

  /* Depot routes */
  app.use('/depots', depots.router);
  // currencies API
  app.get('/currencies', currencies.list);
  app.get('/currencies/:id', currencies.detail);

  // Patient invoice API
  app.get('/invoices', patientInvoice.read);
  app.post('/invoices', patientInvoice.create);
  app.get('/invoices/consumable/', patientInvoice.lookupConsumableInvoicePatient);
  app.get('/invoices/:uuid', patientInvoice.detail);
  app.get('/invoices/:uuid/balance', patientInvoice.balance);

  // interface for linking entities, it renders a report for a particular entity
  app.get('/referenceLookup/:codeRef/:language', referenceLookup.getEntity);

  // interface for employee report
  app.get('/reports/payroll/employees', employeeReports.employeeRegistrations);
  app.get('/reports/payroll/multipayroll', employeeReports.employeeMultiPayroll);
  app.get('/reports/payroll/payslip', employeeReports.payslipGenerator);

  // Payroll Configuration api
  app.get('/payroll_config', payrollConfig.list);
  app.get('/payroll_config/paiementStatus', payrollConfig.paiementStatus);
  app.get('/payroll_config/:id', payrollConfig.detail);
  app.post('/payroll_config', payrollConfig.create);
  app.put('/payroll_config/:id', payrollConfig.update);
  app.delete('/payroll_config/:id', payrollConfig.delete);

  app.post('/staffing_indices', staffingIndices.create);
  app.get('/staffing_indices', staffingIndices.list);
  app.get('/staffing_indices/:uuid', staffingIndices.detail);
  app.get('/staffing_indices/export/report', staffingIndicesReport.document);
  app.delete('/staffing_indices/:uuid', staffingIndices.remove);
  app.put('/staffing_indices/:uuid', staffingIndices.update);

  app.get('/staffing_function_indices/', staffingIndices.functionIndices.list);
  app.get('/staffing_function_indices/:uuid', staffingIndices.functionIndices.detail);
  app.post('/staffing_function_indices', staffingIndices.functionIndices.create);
  app.put('/staffing_function_indices/:uuid', staffingIndices.functionIndices.update);
  app.delete('/staffing_function_indices/:uuid', staffingIndices.functionIndices.delete);

  app.get('/staffing_grade_indices/', staffingIndices.gradeIndices.list);
  app.get('/staffing_grade_indices/:uuid', staffingIndices.gradeIndices.detail);
  app.post('/staffing_grade_indices', staffingIndices.gradeIndices.create);
  app.put('/staffing_grade_indices/:uuid', staffingIndices.gradeIndices.update);
  app.delete('/staffing_grade_indices/:uuid', staffingIndices.gradeIndices.delete);

  // reports API: Invoices (receipts)
  app.get('/reports/medical/patients', medicalReports.patientRegistrations);
  app.get('/reports/medical/patients/:uuid', medicalReports.receipts.patients);
  app.get('/reports/medical/patients/:uuid/visits', medicalReports.patientVisits);

  app.get('/reports/inventory/purchases/:uuid', inventoryReports.receipts.purchases);
  app.get('/reports/inventory/items', inventoryReports.reports.prices);
  app.get('/reports/purchases/purchases_analysis', stockReports.purchaseOrderAnalysis.report);
  app.get('/reports/inventory/changes', inventoryReports.reports.changes);

  app.get('/reports/finance/invoices', financeReports.invoices.report);
  app.get('/reports/finance/invoices/:uuid', financeReports.invoices.receipt);
  app.get('/reports/finance/invoices/:uuid/creditNote', financeReports.invoices.creditNote);
  app.get('/reports/finance/cash', financeReports.cash.report);
  app.get('/reports/finance/cash/:uuid', financeReports.cash.receipt);
  app.get('/reports/finance/debtors/aged', financeReports.debtors.aged);
  app.get('/reports/finance/debtors/open', financeReports.debtors.open);
  app.get('/reports/finance/vouchers', financeReports.vouchers.report);
  app.get('/reports/finance/vouchers/:uuid', financeReports.vouchers.receipt);
  app.get('/reports/finance/accounts/chart', financeReports.accounts.chart);
  app.get('/reports/finance/cashflow/', financeReports.cashflow.report);
  app.get('/reports/finance/cashflow/services', financeReports.cashflow.byService);
  app.get('/reports/finance/financialPatient/:uuid', financeReports.patient);
  app.get('/reports/finance/income_expense', financeReports.income_expense.document);
  app.get('/reports/finance/unpaid-invoice-payments', unpaidInvoicePayments.document);
  app.get('/reports/finance/income_expense_by_month', financeReports.income_expense_by_month.document);
  app.get('/reports/finance/income_expense_by_year', financeReports.income_expense_by_year.document);
  app.get('/reports/finance/cash_report', financeReports.cashReport.document);
  app.get('/reports/finance/balance', financeReports.balance.document);
  app.get('/reports/finance/monthly_balance', financeReports.monthlyBalance.document);
  app.get('/reports/finance/account_report', financeReports.reportAccounts.document);
  app.get('/reports/finance/account_report_multiple', financeReports.reportAccountsMultiple.document);
  app.get('/reports/finance/journal', financeReports.journal.postingReport);
  app.get('/reports/finance/account_statement', financeReports.accountStatement.report);
  app.get('/reports/finance/general_ledger/', financeReports.generalLedger.report);
  app.get('/reports/finance/creditors/aged', financeReports.creditors.aged);
  app.get('/reports/finance/purchases', financeReports.purchases.report);
  app.get('/reports/finance/ohada_balance_sheet', financeReports.ohadaBalanceSheet.document);
  app.get('/reports/finance/ohada_profit_loss', financeReports.ohadaProfitLoss.document);
  app.get('/reports/finance/account_reference', financeReports.accountReference.report);
  app.get('/reports/finance/fee_center', financeReports.feeCenter.report);
  app.get('/reports/finance/annual-clients-report', financeReports.annualClientsReport);
  app.get('/reports/finance/employeeStanding/', financeReports.employee);
  app.get('/reports/finance/break_even', financeReports.breakEven.report);
  app.get('/reports/finance/break_even_fee_center', financeReports.breakEvenFeeCenter.report);
  app.get('/reports/finance/operating', financeReports.operating.document);
  app.get('/reports/finance/debtorSummary', debtorSummaryReport.summaryReport);
  app.get('/reports/finance/clientDebts', clientDebts.report);
  app.get('/reports/finance/clientSupport', clientSupport.report);
  app.get('/reports/finance/realizedProfit', realizedProfit.report);
  app.get('/reports/finance/recoveryCapacity', recoveryCapacity.report);
  app.get('/reports/finance/invoicedReceivedStock/:uuid', financeReports.invoicedReceivedStock.report);

  app.get('/reports/finance/systemUsageStat', systemUsage.document);

  app.get('/reports/finance/analysis_auxiliary_cashbox', financeReports.analysisAuxiliaryCashbox.report);
  app.get('/reports/finance/configurable_analysis_report', financeReports.configurableAnalysisReport.report);

  // visits reports
  app.get('/reports/visits', medicalReports.visitsReports.document);

  app.get('/reports/keys/:key', report.keys);

  // list of saved reports
  app.get('/reports/saved/:reportId', report.list);

  // lookup saved report document
  app.get('/reports/archive/:uuid', report.sendArchived);
  app.post('/reports/archive/:uuid/email', report.emailArchived);
  app.delete('/reports/archive/:uuid', report.deleteArchived);

  app.get('/dashboard/debtors', dashboardDebtors.getReport);
  // patient group routes
  app.get('/patients/groups', patientGroups.list);
  app.get('/patients/groups/:uuid', patientGroups.detail);
  app.post('/patients/groups', patientGroups.create);
  app.put('/patients/groups/:uuid', patientGroups.update);
  app.delete('/patients/groups/:uuid', patientGroups.remove);

  // route specifically for quick searches on patient name, it will return minimal info
  app.get('/patients/search/name', patients.searchByName);

  app.get('/patients/visits', patients.visits.list);
  app.get('/patients/visits/:uuid', patients.visits.detail);

  // patient merge routes
  app.use('/patients/merge', patients.merge.router);

  // Patients API
  app.get('/patients', patients.read);
  app.get('/patients/:uuid', patients.detail);
  app.put('/patients/:uuid', patients.update);
  app.get('/patients/:uuid/groups', patients.groups.list);
  app.post('/patients', patients.create);
  app.post('/patients/:uuid/groups', patients.groups.update);
  app.post('/patients/groups_update', patients.groups.bulkUpdate);

  app.get('/patients/hospital_number/:id/exists', patients.hospitalNumberExists);

  app.get('/patients/:uuid/services', patients.invoicingFees);
  app.get('/patients/:uuid/subsidies', patients.subsidies);

  app.get('/patients/:uuid/documents', patients.documents.list);
  app.post('/patients/:uuid/documents', upload.middleware('docs', 'documents'), patients.documents.create);
  app.delete('/patients/:uuid/documents/all', patients.documents.deleteAll);
  app.delete('/patients/:uuid/documents/:documentUuid', patients.documents.delete);
  app.post('/patients/:uuid/pictures', upload.middleware('pics', 'pictures'), patients.pictures.set);

  app.get('/patients/visits/:uuid', patients.visits.detail);
  app.get('/patients/:uuid/visits/status', patients.visits.patientAdmissionStatus);
  app.get('/patients/:patientUuid/visits/:uuid', patients.visits.detail);
  app.get('/patients/:uuid/visits', patients.visits.listByPatient);
  app.post('/patients/:uuid/visits/admission', patients.visits.admission);
  app.post('/patients/:uuid/visits/discharge', patients.visits.discharge);
  app.post('/patients/:uuid/visits/:patient_visit_uuid/transfer', patients.visits.transfer);

  // misc patients financial routes
  app.get('/patients/:uuid/finance/activity', patients.getFinancialStatus);
  app.get('/patients/:uuid/finance/balance', patients.getDebtorBalance);
  app.get('/patients/:uuid/stock/movements', patients.getStockMovements);

  // Barcode API
  app.get('/barcode/:key', report.barcodeLookup);

  // redirect the request directly to the relevant client document
  app.get('/barcode/redirect/:key', report.barcodeRedirect);

  // Debtors API
  /** @deprecated `/debtors/groups` please use `/debtor_groups` at the client side */
  /** @deprecated `/debtors/groups/:uuid` please use `/debtor_groups/:uuid` at the client side */
  app.get('/debtors/groups', debtorGroups.list);
  app.get('/debtors/groups/:uuid', debtorGroups.detail);
  app.get('/debtors/:uuid/invoices', debtors.invoices);
  app.put('/debtors/:uuid', debtors.update);
  app.get('/debtors/:uuid', debtors.detail);
  app.get('/debtors', debtors.list);

  // Debtor Groups API
  app.get('/debtor_groups', debtorGroups.list);
  app.get('/debtor_groups/:uuid', debtorGroups.detail);
  app.get('/debtor_groups/history/:debtorUuid', debtorGroups.history);
  app.get('/debtor_groups/:uuid/invoices', debtorGroups.invoices);
  app.post('/debtor_groups', debtorGroups.create);
  app.put('/debtor_groups/:uuid', debtorGroups.update);
  app.delete('/debtor_groups/:uuid', debtorGroups.delete);

  // users controller
  app.get('/users', users.list);
  app.post('/users', users.create);
  app.get('/users/:id', users.detail);
  app.get('/users/:username/exists', users.exists);
  app.put('/users/:id', users.update);
  app.delete('/users/:id', users.delete);
  app.get('/users/:id/projects', users.projects.list);
  app.get('/users/:id/depots', users.depots.list);
  app.post('/users/:id/depots', users.depots.create);
  app.put('/users/:id/password', users.password);
  app.get('/users/:id/cashboxes', users.cashboxes.list);
  app.post('/users/:id/cashboxes', users.cashboxes.create);

  // projects controller
  app.get('/projects/:id', projects.detail);
  app.put('/projects/:id', projects.update);
  app.post('/projects', projects.create);
  app.delete('/projects/:id', projects.delete);

  // cashbox controller
  app.get('/cashboxes', cashboxes.list);

  // cashbox privileges
  app.get('/cashboxes/privileges', cashboxes.privileges);

  app.get('/cashboxes/:id', cashboxes.detail);
  app.post('/cashboxes', cashboxes.create);
  app.put('/cashboxes/:id', cashboxes.update);
  app.delete('/cashboxes/:id', cashboxes.delete);

  // cashbox currencies
  app.get('/cashboxes/:id/currencies', cashboxes.currencies.list);
  app.get('/cashboxes/:id/currencies/:currencyId', cashboxes.currencies.detail);
  app.post('/cashboxes/:id/currencies', cashboxes.currencies.create);
  app.put('/cashboxes/:id/currencies/:currencyId', cashboxes.currencies.update);

  // cashbox users
  app.get('/cashboxes/:id/users', cashboxes.users);

  // price lists
  app.get('/prices', priceList.list);
  app.get('/prices/:uuid', priceList.details);
  app.get('/prices/download/list', priceListPreport.downloadRegistry);
  app.get('/prices/download/filled_template', priceList.downloadFilledTemplate);
  app.get('/prices/report/:uuid', financeReports.priceList);
  app.post('/prices', priceList.create);
  app.post('/prices/item', priceList.createItem);
  app.post('/prices/item/import', upload.middleware('csv', 'file'), priceList.importItems);
  app.put('/prices/:uuid', priceList.update);
  app.delete('/prices/:uuid', priceList.delete);
  app.delete('/prices/item/:uuid', priceList.deleteItem);

  // cash API
  app.get('/cash', cash.read);
  app.get('/cash/:uuid', cash.detail);
  app.post('/cash', cash.create);
  app.put('/cash/:uuid', cash.update);
  app.get('/cash/checkin/:invoiceUuid', cash.checkInvoicePayment);

  // Enterprises api
  app.get('/enterprises', enterprises.list);
  app.get('/enterprises/:id', enterprises.detail);
  app.post('/enterprises', enterprises.create);
  app.put('/enterprises/:id', enterprises.update);
  app.get('/enterprises/:id/fiscal_start', fiscal.getEnterpriseFiscalStart);
  app.post('/enterprises/:id/logo', upload.middleware('pics', 'logo'), enterprises.uploadLogo);
  app.get('/helpdesk_info', helpdesk.read);

  // employees
  app.get('/employees', employees.list);
  app.get('/employees/:uuid', employees.detail);
  app.get('/employees/:uuid/advantage', employees.advantage);
  app.post('/employees', employees.create);
  app.post('/employees/patient_employee', employees.patientToEmployee);
  app.put('/employees/:uuid', employees.update);

  // billing services
  app.get('/invoicing_fees', invoicingFees.list);
  app.get('/invoicing_fees/:id', invoicingFees.detail);
  app.post('/invoicing_fees', invoicingFees.create);
  app.put('/invoicing_fees/:id', invoicingFees.update);
  app.delete('/invoicing_fees/:id', invoicingFees.delete);

  // Multiple Payroll API
  app.get('/multiple_payroll', multiplePayroll.search);
  app.get('/multiple_payroll/:id/configuration', multiplePayroll.configuration);
  app.post('/multiple_payroll/:id/configuration', multiplePayroll.setConfiguration.config);
  app.post('/multiple_payroll/:id/multiConfiguration', multiplePayroll.setMultiConfiguration.config);
  app.post('/multiple_payroll/:id/commitment', multiplePayroll.makeCommitment.config);

  app.get('/multiple_payroll_indice/', multiplePayrollIndice.read);
  app.post('/multiple_payroll_indice/', multiplePayrollIndice.create);

  app.get('/multiple_payroll_indice/parameters/:payroll_config_id', multiplePayrollIndice.parameters.detail);
  app.post('/multiple_payroll_indice/parameters/', multiplePayrollIndice.parameters.create);
  app.get('/multiple_payroll_indice/reports/', multiplePayrollIndice.reports.document);
  // discounts
  app.get('/discounts', discounts.list);
  app.get('/discounts/:id', discounts.detail);
  app.post('/discounts', discounts.create);
  app.put('/discounts/:id', discounts.update);
  app.delete('/discounts/:id', discounts.delete);

  // voucher api endpoint
  app.get('/vouchers', vouchers.list);
  app.get('/vouchers/:uuid', vouchers.detail);
  app.post('/vouchers', vouchers.create);

  // suppliers api
  app.get('/suppliers/search', suppliers.search);
  app.get('/suppliers', suppliers.list);
  app.get('/suppliers/:uuid', suppliers.detail);
  app.post('/suppliers', suppliers.create);
  app.put('/suppliers/:uuid', suppliers.update);
  app.delete('/suppliers/:uuid', suppliers.remove);

  // purchase
  app.post('/purchases', purchases.create);
  app.get('/purchases', purchases.list);
  app.get('/purchases/search', purchases.search);
  app.get('/purchases/purchaseState', purchases.purchaseState);
  app.get('/purchases/:uuid', purchases.detail);
  app.put('/purchases/:uuid', purchases.update);
  app.get('/purchases/:uuid/stock_status', purchases.stockStatus);
  app.get('/purchases/:uuid/stock_balance', purchases.stockBalance);

  // functions api
  app.get('/functions', functions.list);
  app.get('/functions/:id', functions.detail);
  app.post('/functions', functions.create);
  app.put('/functions/:id', functions.update);
  app.delete('/functions/:id', functions.delete);

  // rubrics payroll api
  app.get('/rubrics', rubrics.list);
  app.get('/rubrics/:id', rubrics.detail);
  app.post('/rubrics', rubrics.create);
  app.post('/rubrics/import_indexes', rubrics.importIndexes);
  app.put('/rubrics/:id', rubrics.update);
  app.delete('/rubrics/:id', rubrics.delete);

  // rubrics payroll Configuration api
  app.get('/rubric_config', rubricConfig.list);
  app.get('/rubric_config/:id', rubricConfig.detail);
  app.post('/rubric_config', rubricConfig.create);
  app.put('/rubric_config/:id', rubricConfig.update);
  app.get('/rubric_config/:id/setting', rubricConfig.listConfig);
  app.post('/rubric_config/:id/setting', rubricConfig.createConfig);
  app.delete('/rubric_config/:id', rubricConfig.delete);

  // grades api
  app.get('/grades', grades.list);
  app.get('/grades/:uuid', grades.detail);
  app.post('/grades', grades.create);
  app.put('/grades/:uuid', grades.update);
  app.delete('/grades/:uuid', grades.delete);

  // Holidays API
  app.get('/holidays', holidays.list);
  app.get('/holidays/:id', holidays.detail);
  app.post('/holidays', holidays.create);
  app.put('/holidays/:id', holidays.update);
  app.delete('/holidays/:id', holidays.delete);

  // Offday api
  app.get('/offdays', offdays.list);
  app.get('/offdays/:id', offdays.detail);
  app.post('/offdays', offdays.create);
  app.put('/offdays/:id', offdays.update);
  app.delete('/offdays/:id', offdays.delete);

  // IPR API
  app.get('/iprTax', iprTax.list);
  app.get('/iprTax/:id', iprTax.detail);
  app.post('/iprTax', iprTax.create);
  app.put('/iprTax/:id', iprTax.update);
  app.delete('/iprTax/:id', iprTax.delete);

  // IPR TAX CONFIG
  app.get('/iprTaxConfig', iprTax.listConfig);
  app.get('/iprTaxConfig/:id', iprTax.detailConfig);
  app.post('/iprTaxConfig', iprTax.createConfig);
  app.put('/iprTaxConfig/:id', iprTax.updateConfig);
  app.delete('/iprTaxConfig/:id', iprTax.deleteConfig);

  // account payroll Configuration api
  app.get('/account_config', accountConfig.list);
  app.get('/account_config/:id', accountConfig.detail);
  app.post('/account_config', accountConfig.create);
  app.put('/account_config/:id', accountConfig.update);
  app.delete('/account_config/:id', accountConfig.delete);

  // week end payroll Configuration api
  app.get('/weekend_config', weekendConfig.list);
  app.get('/weekend_config/:id', weekendConfig.detail);
  app.post('/weekend_config', weekendConfig.create);
  app.put('/weekend_config/:id', weekendConfig.update);
  app.get('/weekend_config/:id/days', weekendConfig.listConfig);
  app.delete('/weekend_config/:id', weekendConfig.delete);

  // Employee payroll Configuration api
  app.get('/employee_config', employeeConfig.list);
  app.get('/employee_config/:id', employeeConfig.detail);
  app.post('/employee_config', employeeConfig.create);
  app.put('/employee_config/:id', employeeConfig.update);
  app.get('/employee_config/:id/setting', employeeConfig.listConfig);
  app.post('/employee_config/:id/setting', employeeConfig.createConfig);
  app.delete('/employee_config/:id', employeeConfig.delete);

  // creditor groups API
  app.post('/creditors/groups', creditorGroups.create);
  app.get('/creditors/groups', creditorGroups.list);
  app.get('/creditors/groups/:uuid', creditorGroups.detail);
  app.put('/creditors/groups/:uuid', creditorGroups.update);
  app.delete('/creditors/groups/:uuid', creditorGroups.remove);

  app.get('/creditors', creditors.list);
  app.get('/creditors/:uuid', creditors.detail);

  // transfer type API
  app.post('/transaction_type', transactionType.create);
  app.get('/transaction_type', transactionType.list);
  app.get('/transaction_type/:id', transactionType.detail);
  app.put('/transaction_type/:id', transactionType.update);
  app.delete('/transaction_type/:id', transactionType.remove);

  // @todo - this should use the JSON renderer instead of it's own route!
  app.get('/finance/cashflow', financeReports.cashflow.report);

  // API for getting stock status
  app.get('/stock/status', stock.listStatus);

  // API routes for /stock/assign end point
  app.get('/stock/assign', stock.assign.list);
  app.get('/stock/assign/:uuid', stock.assign.detail);
  app.post('/stock/assign', stock.assign.create);
  app.put('/stock/assign/:uuid', stock.assign.update);
  app.put('/stock/assign/:uuid/remove', stock.assign.removeAssign);
  app.delete('/stock/assign/:uuid/delete', stock.assign.deleteAssign);

  // API routes for /stock/requisition end point
  app.get('/stock/requisition', stock.requisition.list);
  app.get('/stock/requisition/:uuid', stock.requisition.details);
  app.post('/stock/requisition', stock.requisition.create);

  app.put('/stock/requisition/:uuid', stock.requisition.update);
  app.delete('/stock/requisition/:uuid', stock.requisition.deleteRequisition);

  // API routes for /stock/requestor_type end point
  app.get('/stock/requestor_type', stock.requestorType.list);
  app.get('/stock/requestor_type/:id', stock.requestorType.details);

  // stock import from a file
  app.get('/stock/import/template', stock.importing.downloadTemplate);
  app.post('/stock/import', upload.middleware('csv', 'file'), upload.hasFilesToUpload, stock.importing.importStock);

  // stock flux
  app.get('/stock/flux', stock.listStockFlux);

  // stock management API
  app.get('/stock/movements', stock.listMovements);

  app.post('/stock/lots/movements', stock.createMovement);
  app.get('/stock/lots/movements', stock.listLotsMovements);

  app.post('/stock/lots', stock.createStock);
  app.get('/stock/lots', stock.listLots);
  app.get('/stock/lots/origins', stock.listLotsOrigins);

  app.get('/stock/lots/depots/', stock.listLotsDepot);
  app.get('/stock/inventories/depots', stock.listInventoryDepot);

  // stock integration
  app.post('/stock/integration', stock.createIntegration);
  app.post('/stock/inventory_adjustment', stock.createInventoryAdjustment);

  // stock settings API
  app.get('/stock/setting/:id?', stockSetting.list);
  app.put('/stock/setting/:id', stockSetting.update);

  // stock reports API
  app.get('/reports/stock/exit', stockReports.stockExitReport);
  app.get('/reports/stock/entry', stockReports.stockEntryReport);
  app.get('/reports/stock/consumption_graph', stockReports.consumptionGraph);
  app.get('/reports/stock/movement_report', stockReports.movementReport);
  app.get('/reports/stock/expiration_report', stockReports.expirationReport);

  app.get('/reports/stock/lots', stockReports.stockLotsReport);
  app.get('/reports/stock/movements', stockReports.stockMovementsReport);
  app.get('/reports/stock/inline_movements', stockReports.stockInlineMovementsReport);
  app.get('/reports/stock/inventories', stockReports.stockInventoriesReport);
  app.get('/reports/stock/sheet', stockReports.stockSheetReport);
  app.get('/reports/stock/value', stockReports.stockValue);
  app.get('/reports/stock/monthly_consumption', stockReports.monthlyConsumption.report);

  // stock receipts API
  app.get('/receipts/stock/:uuid', stockReports.renderStockReceipt);
  app.get('/receipts/stock/assign/:uuid', stockReports.stockAssignReceipt);
  app.get('/receipts/stock/requisition/:uuid', stockReports.stockRequisitionReceipt);
  app.get('/receipts/stock/adjustment/:document_uuid', stockReports.stockAdjustmentReceipt);

  // stock consumption API
  app.get('/stock/consumptions/average/:periodId', stock.getStockConsumptionAverage);
  app.get('/stock/consumptions/:periodId', stock.getStockConsumption);

  // stock transfers
  app.get('/stock/transfers', stock.getStockTransfers);

  // install
  app.get('/install', install.checkBasicInstallExist);
  app.post('/install', install.proceedInstall);

  app.get('/diagnoses', diagnoses.list);
  app.get('/roles', rolesCtrl.list);
  app.get('/roles/:uuid', rolesCtrl.detail);

  // TODO(@jniles) - migrate this to the roles controller
  app.get('/roles/:uuid/units', rolesCtrl.units);

  app.get('/roles/actions/:roleUuid', rolesCtrl.rolesAction);
  app.get('/roles/actions/user/:action_id', rolesCtrl.hasAction);
  app.get('/roles/user/:id', rolesCtrl.listForUser);
  app.post('/roles', rolesCtrl.create);
  app.put('/roles/:uuid', rolesCtrl.update);
  app.delete('/roles/:uuid', rolesCtrl.remove);

  app.post('/roles/affectUnits', rolesCtrl.assignUnitsToRole);
  app.post('/roles/assignTouser', rolesCtrl.assignRolesToUser);
  app.post('/roles/actions', rolesCtrl.assignActionToRole);

  // entities types API
  app.get('/entities/types', entities.types.list);
  app.get('/entities/types/:id', entities.types.details);
  app.put('/entities/types/:id', entities.types.update);
  app.delete('/entities/types/:id', entities.types.remove);
  app.post('/entities/types', entities.types.create);

  // entities groups API
  app.get('/entities/groups', entities.groups.list);
  app.get('/entities/groups/:uuid', entities.groups.details);
  app.put('/entities/groups/:uuid', entities.groups.update);
  app.delete('/entities/groups/:uuid', entities.groups.remove);
  app.post('/entities/groups/', entities.groups.create);

  // entities API
  app.get('/entities', entities.list);
  app.get('/entities/:uuid', entities.details);
  app.put('/entities/:uuid', entities.update);
  app.delete('/entities/:uuid', entities.remove);
  app.post('/entities', entities.create);

  // tags
  app.get('/tags', tags.read);
  app.get('/tags/:uuid', tags.detail);
  app.post('/tags', tags.create);
  app.delete('/tags/:uuid', tags.delete);
  app.put('/tags/:uuid', tags.update);

  // Fees Centers API
  app.get('/fee_center', feeCenter.list);
  app.get('/fee_center/:id', feeCenter.detail);
  app.post('/fee_center', feeCenter.create);
  app.put('/fee_center/:id', feeCenter.update);
  app.delete('/fee_center/:id', feeCenter.delete);

  // Distribution Fees Centers API
  app.get('/distribution_fee_center', distributionConfiguration.configuration);
  app.get('/distribution_fee_center/getDistributed', distributionGetDistributed.getDistributed);
  app.get('/distribution_fee_center/getDistributionKey', distributionGetDistributionKey.getDistributionKey);
  app.post('/distribution_fee_center/proceed', distributionProceed.proceed);
  app.post('/distribution_fee_center/breakDown', distributionBreakDown.breakDown);
  app.post('/distribution_fee_center/automatic', distributionAutomatic.automatic);
  app.post('/distribution_fee_center/distributionKey', setDistributionKey.setting);
  app.post('/distribution_fee_center/resetKey', setDistributionKey.resetKey);

  // ward management
  app.get('/wards', ward.read);
  app.get('/wards/:uuid', ward.detail);
  app.post('/wards', ward.create);
  app.put('/wards/:uuid', ward.update);
  app.delete('/wards/:uuid', ward.delete);

  // room management
  app.get('/rooms', room.read);
  app.get('/rooms/:uuid', room.detail);
  app.post('/rooms', room.create);
  app.put('/rooms/:uuid', room.update);
  app.delete('/rooms/:uuid', room.delete);

  // bed management
  app.get('/beds', bed.read);
  app.get('/beds/:id', bed.detail);
  app.post('/beds', bed.create);
  app.put('/beds/:id', bed.update);
  app.delete('/beds/:id', bed.delete);

  // lots API
  app.get('/lots/:uuid', lots.details);
  app.put('/lots/:uuid', lots.update);
  app.get('/lots/:uuid/assignments/:depot_uuid', lots.assignments);

  // API for Account Reference Type routes crud
  app.get('/account_reference_type', accountReferenceType.list);
  app.get('/account_reference_type/:id', accountReferenceType.detail);
  app.post('/account_reference_type', accountReferenceType.create);
  app.put('/account_reference_type/:id', accountReferenceType.update);
  app.delete('/account_reference_type/:id', accountReferenceType.delete);

  // API for discharge type
  app.get('/discharge_types', dischargeTypes.list);

  // API for indicators
  app.get('/indicators', indicators.read);
  app.get('/indicators/status', indicators.status.list);
  app.get('/indicators/types', indicators.types.list);

  app.get('/indicators/hospitalization/:uuid', indicators.hospitalization.detail);
  app.post('/indicators/hospitalization', indicators.hospitalization.create);
  app.put('/indicators/hospitalization/:uuid', indicators.hospitalization.update);
  app.delete('/indicators/hospitalization/:uuid', indicators.hospitalization.delete);

  app.get('/indicators/staff/:uuid', indicators.personel.detail);
  app.post('/indicators/staff', indicators.personel.create);
  app.put('/indicators/staff/:uuid', indicators.personel.update);
  app.delete('/indicators/staff/:uuid', indicators.personel.delete);

  app.get('/indicators/finances/:uuid', indicators.finances.detail);
  app.post('/indicators/finances', indicators.finances.create);
  app.put('/indicators/finances/:uuid', indicators.finances.update);
  app.delete('/indicators/finances/:uuid', indicators.finances.delete);

  // API for Break Even Reference routes crud
  app.get('/break_even_reference', breakEvenReference.list);
  app.get('/break_even_reference/:id', breakEvenReference.detail);
  app.post('/break_even_reference', breakEvenReference.create);
  app.put('/break_even_reference/:id', breakEvenReference.update);
  app.delete('/break_even_reference/:id', breakEvenReference.delete);

  // API dashboard
  app.get('/indicators/dashboards', dashboard.getIndicators);
  app.get('/reports/indicatorsReport', indicatorRerpor.report);

  // API cron
  app.get('/crons', cron.list);
  app.get('/crons/:id', cron.details);
  app.post('/crons', cron.create);
  app.put('/crons/:id', cron.update);
  app.delete('/crons/:id', cron.remove);

  // API cron_email_report
  app.get('/cron_email_reports', cronEmailReport.list);
  app.get('/cron_email_reports/:id', cronEmailReport.details);
  app.post('/cron_email_reports', cronEmailReport.create);
  app.post('/cron_email_reports/:id', cronEmailReport.send);
  app.delete('/cron_email_reports/:id', cronEmailReport.remove);

  // API for Data Collector Management routes crud
  app.get('/data_collector_management', dataCollectorManagement.list);
  app.get('/data_collector_management/:id', dataCollectorManagement.detail);
  app.post('/data_collector_management', dataCollectorManagement.create);
  app.put('/data_collector_management/:id', dataCollectorManagement.update);
  app.delete('/data_collector_management/:id', dataCollectorManagement.delete);

  // API for CHOISES LIST MANAGEMENT routes crud
  app.get('/choices_list_management', choicesListManagement.list);
  app.get('/choices_list_management/:id', choicesListManagement.detail);
  app.post('/choices_list_management', choicesListManagement.create);
  app.put('/choices_list_management/:id', choicesListManagement.update);
  app.delete('/choices_list_management/:id', choicesListManagement.delete);

  // API for SURVEY FORM routes crud
  app.get('/survey_form', surveyForm.list);
  app.get('/survey_form/listSurveyformtype', surveyForm.listSurveyformtype);
  app.get('/survey_form/:id', surveyForm.detail);
  app.post('/survey_form', surveyForm.create);
  app.put('/survey_form/:id', surveyForm.update);
  app.delete('/survey_form/:id', surveyForm.delete);

  // API for Fill in the forms of the data
  app.get('/fill_form/:uuid', fillFormsData.detail);
  app.post('/fill_form', fillFormsData.create);
  app.post('/fill_form/restoreImage', fillFormsData.restoreImage);
  app.post('/fill_form/:uuid/:key/image', upload.middleware('pics', 'image'), fillFormsData.uploadImage);
  app.put('/fill_form/:uuid', fillFormsData.update);

  // API for DISPLAY METADATA routes crud
  app.get('/display_metadata', displayMetadata.list);
  app.get('/display_metadata/card', displayMetadataReport.metadataCard);
  app.get('/data_kit/report', displayMetadataReport.reportMetadata);
  app.delete('/display_metadata/:uuid', displayMetadata.delete);

  // API for Configuration Analysis Tools routes crud
  app.get('/configuration_analysis_tools', configurationAnalysisTools.list);
  app.get('/analysis_tools_type', configurationAnalysisTools.toolsType);
  app.get('/configuration_analysis_tools/:id', configurationAnalysisTools.detail);
  app.post('/configuration_analysis_tools', configurationAnalysisTools.create);
  app.put('/configuration_analysis_tools/:id', configurationAnalysisTools.update);
  app.delete('/configuration_analysis_tools/:id', configurationAnalysisTools.delete);
};
