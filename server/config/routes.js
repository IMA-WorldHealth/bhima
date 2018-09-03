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
const unitCtrl = require('../controllers/admin/unit');
const users = require('../controllers/admin/users');
const projects = require('../controllers/admin/projects');
const enterprises = require('../controllers/admin/enterprises');
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

// payroll routes
const payrollConfig = require('../controllers/payroll/configuration');
const rubrics = require('../controllers/payroll/rubrics');
const rubricConfig = require('../controllers/payroll/rubricConfig');
const accountConfig = require('../controllers/payroll/accounts');
const weekendConfig = require('../controllers/payroll/weekendConfig');
const employeeConfig = require('../controllers/payroll/employeeConfig');
const multiplePayroll = require('../controllers/payroll/multiplePayroll');

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

// finance routes
const trialBalance = require('../controllers/finance/trialBalance');
const fiscal = require('../controllers/finance/fiscal');
const gl = require('../controllers/finance/ledgers/general');
const purchases = require('../controllers/finance/purchases');
const debtors = require('../controllers/finance/debtors');
const cashboxes = require('../controllers/finance/cashboxes');
const exchange = require('../controllers/finance/exchange');
const cash = require('../controllers/finance/cash');
const priceList = require('../controllers/finance/priceList');
const invoicingFees = require('../controllers/finance/invoicingFees');
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

const dashboardDebtors = require('../controllers/dashboard/debtorGroups');
const stats = require('../controllers/dashboard/stats');
const transactions = require('../controllers/finance/transactions');

const reportDebtor = require('../controllers/finance/reports/debtors/debtorAccountBalance');

// looking up an entity by it reference
const referenceLookup = require('../lib/referenceLookup');

const operating = require('../controllers/finance/reports/operating/index');

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

  // API for account importation
  app.get('/accounts/template', accounts.importing.downloadTemplate);
  app.post('/accounts/import', upload.middleware('csv', 'file'), accounts.importing.importAccounts);

  // API for account routes crud
  app.get('/accounts', accounts.list);
  app.get('/accounts/:id', accounts.detail);
  app.get('/accounts/:id/balance', accounts.getBalance);
  app.get('/accounts/:id/openingBalance', accounts.getOpeningBalanceForPeriod);
  app.post('/accounts', accounts.create);
  app.put('/accounts/:id', accounts.update);
  app.delete('/accounts/:id', accounts.remove);

  // API for service routes
  app.post('/services', services.create);
  app.get('/services', services.list);
  app.get('/services/:id', services.detail);
  app.put('/services/:id', services.update);
  app.delete('/services/:id', services.remove);

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

  // API for journal
  app.get('/journal/:record_uuid', journal.getTransaction);
  app.post('/journal/:record_uuid/edit', journal.editTransaction);
  app.post('/journal/:uuid/reverse', journal.reverse);
  app.put('/transactions/comments', transactions.commentTransactions);

  // API for general ledger
  app.get('/general_ledger', generalLedger.list);
  app.get('/general_ledger/transactions', generalLedger.getTransactions);
  app.get('/general_ledger/aggregates', generalLedger.getAggregates);

  app.get('/transactions/:uuid/history', journal.getTransactionEditHistory);
  app.delete('/transactions/:uuid', transactions.deleteTransaction);

  /* fiscal year controller */
  app.get('/fiscal', fiscal.list);
  app.get('/fiscal/date', fiscal.getFiscalYearsByDate);
  app.get('/fiscal/:id', fiscal.detail);
  app.post('/fiscal', fiscal.create);
  app.put('/fiscal/:id', fiscal.update);
  app.delete('/fiscal/:id', fiscal.remove);

  app.get('/fiscal/:id/balance/:period_number?', fiscal.getBalance);
  app.get('/fiscal/:id/opening_balance', fiscal.getOpeningBalance);
  app.post('/fiscal/:id/opening_balance', fiscal.setOpeningBalance);
  app.put('/fiscal/:id/closing', fiscal.closing);

  app.get('/fiscal/:id/periods', fiscal.getPeriods);

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
  // route for inventory list receipt

  /**
   * @deprecated: /inventory/:uuid/metadata route
   * these routes below are deprecated
   * use /inventory/metadata/:uuid route for the API instead
   */
  app.get('/inventory/:uuid/metadata', inventory.getInventoryItemsById);
  app.put('/inventory/:uuid/metadata', inventory.updateInventoryItems);

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


  /** @todo: These routes below need to be implemented */
  /*
  app.get('/inventory/consumption', inventory.getInventoryConsumption);
  app.get('/inventory/:uuid/consumption', inventory.getInventoryConsumptionById);

  app.get('/inventory/leadtimes', inventory.getInventoryLeadTimes);
  app.get('/inventory/:uuid/leadtimes', inventory.getInventoryLeadTimesById);

  app.get('/inventory/stock', inventory.getInventoryStockLevels);
  app.get('/inventory/:uuid/stock', inventory.getInventoryStockLevelsById);

  app.get('/inventory/expirations', inventory.getInventoryExpirations);
  app.get('/inventory/:uuid/expirations', inventory.getInventoryExpirationsById);

  app.get('/inventory/lots', inventory.getInventoryLots);
  app.get('/inventory/:uuid/lots', inventory.getInventoryLotsById);

  app.get('/inventory/status', inventory.getInventoryStatus);
  app.get('/inventory/:uuid/status', inventory.getInventoryStatusById);
  */

  /* Depot routes */
  app.get('/depots', depots.list);
  app.get('/depots/:uuid', depots.detail);
  app.put('/depots/:uuid', depots.update);
  app.post('/depots', depots.create);
  app.delete('/depots/:uuid', depots.remove);

  /* Depot distributions routes */
  app.get('/depots/:depotId/distributions', depots.listDistributions);
  app.get('/depots/:depotId/distributions/:uuid', depots.detailDistributions);
  app.post('/depots/:depotId/distributions', depots.createDistributions);

  /**
   * Depot inventories and lots routes
   * get the lots of a particular inventory item in the depot
   * @todo -- should this be renamed? /stock? /lots?
   */
  app.get('/depots/:depotId/inventory', depots.listAvailableLots);
  app.get('/depots/:depotId/inventory/:uuid', depots.detailAvailableLots);
  app.get('/depots/:depotId/expired', depots.listExpiredLots);
  app.get('/depots/:depotId/expirations', depots.listStockExpirations);

  // general ledger controller
  // transitioning to a more traditional angular application architecture
  app.get('/ledgers/general', gl.route);

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

  // reports API: Invoices (receipts)
  app.get('/reports/medical/patients', medicalReports.patientRegistrations);
  app.get('/reports/medical/patients/:uuid', medicalReports.receipts.patients);
  app.get('/reports/medical/patients/:uuid/checkins', medicalReports.patientCheckins);

  app.get('/reports/inventory/purchases/:uuid', inventoryReports.receipts.purchases);
  app.get('/reports/inventory/items', inventoryReports.reports.prices);

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
  app.get('/reports/finance/cash_report', financeReports.cashReport.document);
  app.get('/reports/finance/balance', financeReports.balance.document);
  app.get('/reports/finance/balance_sheet', financeReports.balanceSheet.document);
  app.get('/reports/finance/account_report', financeReports.reportAccounts.document);
  app.get('/reports/finance/journal', financeReports.journal.postingReport);
  app.get('/reports/finance/account_statement', financeReports.accountStatement.report);
  app.get('/reports/finance/clientsReport', financeReports.clientsReport.document);
  app.get('/reports/finance/general_ledger/', financeReports.generalLedger.report);
  app.get('/reports/finance/creditors/aged', financeReports.creditors.aged);
  app.get('/reports/finance/purchases', financeReports.purchases.report);
  app.get('/reports/finance/ohada_balance_sheet', financeReports.ohadaBalanceSheet.document);
  app.get('/reports/finance/account_reference', financeReports.accountReference.report);

  app.get('/reports/finance/employeeStanding/', financeReports.employee);

  app.get('/reports/keys/:key', report.keys);

  // list of saved reports
  app.get('/reports/saved/:reportId', report.list);

  // lookup saved report document
  app.get('/reports/archive/:uuid', report.sendArchived);
  app.post('/reports/archive/:uuid/email', report.emailArchived);
  app.delete('/reports/archive/:uuid', report.deleteArchived);

  app.get('/reports/debtorAccountBalance', reportDebtor.debtorAccountBalance);
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

  // Patients API
  app.get('/patients', patients.read);
  app.post('/patients', patients.create);
  app.get('/patients/:uuid', patients.detail);
  app.put('/patients/:uuid', patients.update);
  app.get('/patients/:uuid/groups', patients.groups.list);
  app.post('/patients/:uuid/groups', patients.groups.update);

  app.get('/patients/hospital_number/:id/exists', patients.hospitalNumberExists);

  app.get('/patients/:uuid/services', patients.invoicingFees);
  app.get('/patients/:uuid/subsidies', patients.subsidies);

  app.get('/patients/:uuid/documents', patients.documents.list);
  app.post('/patients/:uuid/documents', upload.middleware('docs', 'documents'), patients.documents.create);
  app.delete('/patients/:uuid/documents/all', patients.documents.deleteAll);
  app.delete('/patients/:uuid/documents/:documentUuid', patients.documents.delete);
  app.post('/patients/:uuid/pictures', upload.middleware('pics', 'pictures'), patients.pictures.set);

  app.get('/patients/visits/:uuid', patients.visits.detail);
  app.get('/patients/:patientUuid/visits/:uuid', patients.visits.detail);
  app.get('/patients/:uuid/visits', patients.visits.listByPatient);
  app.post('/patients/:uuid/visits/admission', patients.visits.admission);
  app.post('/patients/:uuid/visits/discharge', patients.visits.discharge);

  // misc patients financial routes
  app.get('/patients/:uuid/finance/activity', patients.getFinancialStatus);
  app.get('/patients/:uuid/finance/balance', patients.getDebtorBalance);

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
  app.get('/users/:id/permissions', users.permissions.list);
  app.post('/users/:id/permissions', users.permissions.create);
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

  // price lists
  app.get('/prices', priceList.list);
  app.get('/prices/:uuid', priceList.details);
  app.get('/prices/report/:uuid', financeReports.priceList);
  app.post('/prices', priceList.create);
  app.post('/prices/item', priceList.createItem);
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

  // employees
  app.get('/employees/search', employees.search);
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
  app.post('/weekend_config/:id/days', weekendConfig.createConfig);
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

  // stock flux
  app.get('/stock/flux', stock.listStockFlux);

  // stock management API
  app.post('/stock/lots/movements', stock.createMovement);
  app.get('/stock/lots/movements', stock.listLotsMovements);
  app.post('/stock/lots', stock.createStock);
  app.get('/stock/lots', stock.listLots);
  app.get('/stock/lots/origins', stock.listLotsOrigins);

  app.get('/stock/lots/depots/', stock.listLotsDepot);
  app.get('/stock/inventories/depots', stock.listInventoryDepot);

  // stock integration
  app.post('/stock/integration', stock.createIntegration);

  // stock reports API
  app.get('/reports/stock/exit', stockReports.stockExitReport);
  app.get('/reports/stock/lots', stockReports.stockLotsReport);
  app.get('/reports/stock/movements', stockReports.stockMovementsReport);
  app.get('/reports/stock/inventories', stockReports.stockInventoriesReport);
  app.get('/reports/stock/inventory', stockReports.stockInventoryReport);

  // stock receipts API
  app.get('/receipts/stock/exit_patient/:document_uuid', stockReports.stockExitPatientReceipt);
  app.get('/receipts/stock/exit_service/:document_uuid', stockReports.stockExitServiceReceipt);
  app.get('/receipts/stock/exit_depot/:document_uuid', stockReports.stockExitDepotReceipt);
  app.get('/receipts/stock/exit_loss/:document_uuid', stockReports.stockExitLossReceipt);

  app.get('/receipts/stock/entry_depot/:document_uuid', stockReports.stockEntryDepotReceipt);
  app.get('/receipts/stock/entry_purchase/:document_uuid', stockReports.stockEntryPurchaseReceipt);
  app.get('/receipts/stock/entry_integration/:document_uuid', stockReports.stockEntryIntegrationReceipt);
  app.get('/receipts/stock/entry_donation/:document_uuid', stockReports.stockEntryDonationReceipt);

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

  app.get('/reports/finance/operating', operating.document);

  // roles
  app.get('/roles', rolesCtrl.list);
  app.get('/roles/:uuid', rolesCtrl.detail);
  app.get('/roles/actions/:roleUuid', rolesCtrl.rolesAction);
  app.get('/roles/actions/user/:action_id', rolesCtrl.hasAction);
  app.get('/roles/user/:user_id/:project_id', rolesCtrl.listForUser);
  app.post('/roles', rolesCtrl.create);
  app.put('/roles/:uuid', rolesCtrl.update);
  app.delete('/roles/:uuid', rolesCtrl.remove);

  app.post('/roles/affectUnits', rolesCtrl.affectPages);
  app.post('/roles/assignTouser', rolesCtrl.affectToUser);
  app.post('/roles/actions', rolesCtrl.assignActionToRole);

  // unit
  app.get('/unit/:roleUuid', unitCtrl.list);
};
