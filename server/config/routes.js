/**
* Application Routing
*
* Initialise link between server paths and controller logic
*
* TODO Pass authenticate and authorize middleware down through
* controllers, allowing for modules to subscribe to different
* levels of authority
*
* TODO createPurchase, createSale, are all almost
* identicale modules - they should all be encapsulated as one
* module. For Example finance.createSale, finance.createPurchase
*/
var winston              = require('winston');
var auth                 = require('../controllers/auth');
var data                 = require('../controllers/data');
var users                = require('../controllers/users');
var locations            = require('../controllers/locations');
var tree                 = require('../controllers/tree');
//var createPurchase       = require('../controllers/finance/purchase');
var createSale           = require('../controllers/finance/sale');
var patient              = require('../controllers/medical/patient');
var snis                 = require('../controllers/medical/snis');
var projects             = require('../controllers/medical/projects');
var legacyReports        = require('../controllers/reports/report_legacy');
var reports              = require('../controllers/reports/reports.js');
var inventory            = require('../controllers/stock/inventory');
var depots               = require('../controllers/stock/depot');
var consumptionLoss      = require('../controllers/stock/inventory/depreciate/consumptionLoss');
var trialbalance         = require('../controllers/finance/trialbalance');
var journal              = require('../controllers/finance/journal');
var ledger               = require('../controllers/finance/ledger');
var fiscal               = require('../controllers/finance/fiscal');
var extra                = require('../controllers/finance/extraPayment');
var gl                   = require('../controllers/finance/ledgers/general');
var genericFinance       = require('../controllers/finance/financeGeneric');
var accounts             = require('../controllers/finance/accounts');
var analytics            = require('../controllers/finance/analytics');
var purchase             = require('../controllers/finance/purchase');
var budget               = require('../controllers/finance/budget');
var taxPayment           = require('../controllers/finance/taxPayment');
var donations            = require('../controllers/finance/donations');
var debtors              = require('../controllers/finance/debtors');
var cashboxes            = require('../controllers/finance/cashboxes');
var exchange             = require('../controllers/finance/exchange');
var cash                 = require('../controllers/finance/cash');
var cashflow             = require('../controllers/cashflow');
var enterprises          = require('../controllers/admin/enterprises');
var employees            = require('../controllers/admin/employees');
var priceList            = require('../controllers/finance/priceList');
var billingServices      = require('../controllers/finance/billingServices');
var account              = require('../controllers/finance/account');
var accountType          = require('../controllers/finance/accountType');
var costCenter           = require('../controllers/finance/costCenter');
var profitCenter         = require('../controllers/finance/profitCenter');
var reference            = require('../controllers/finance/reference');
var subsidy              = require('../controllers/finance/subsidy');
var patientInvoice       = require('../controllers/finance/patientInvoice');
var discounts            = require('../controllers/finance/discounts');
var financeServices      = require('../controllers/categorised/financeServices');
var depreciatedInventory = require('../controllers/categorised/inventory_depreciate');
var depreciatedReports   = require('../controllers/categorised/reports_depreciate');
var payroll              = require('../controllers/categorised/payroll');
var caution              = require('../controllers/categorised/caution');
var subsidies            = require('../controllers/categorised/subsidies');
var units                = require('../controllers/units');
var transfers            = require('../controllers/finance/transfers');
var debtorGroups         = require('../controllers/finance/debtorGroups');
var currencies           = require('../controllers/finance/currencies');
var services             = require('../controllers/admin/services');
var conventions          = require('../controllers/finance/conventions');
var vouchers             = require('../controllers/finance/vouchers');
var suppliers            = require('../controllers/admin/suppliers');
var functions            = require('../controllers/admin/functions');
var grades               = require('../controllers/admin/grades');
var creditorGroups       = require('../controllers/finance/creditorGroups');


// Middleware for handle uploaded file
var multipart            = require('connect-multiparty');

exports.configure = function (app) {
  winston.debug('Configuring routes');

  // exposed to the outside without authentication
  app.get('/languages', users.getLanguages);
  app.get('/projects', projects.list);

  app.get('/units', units.list);

  app.post('/login', auth.login);
  app.get('/logout', auth.logout);

  app.get('/exchange', exchange.list);
  app.post('/exchange', exchange.create);
  app.put('/exchange/:id', exchange.update);
  app.delete('/exchange/:id', exchange.delete);

  // application data
  app.post('/data', data.create);
  app.get('/data', data.read);
  app.put('/data', data.update);
  app.delete('/data/:table/:column/:value', data.deleteRecord);

  /**  API for locations */
  app.get('/locations/villages', locations.villages);
  app.get('/locations/sectors', locations.sectors);
  app.get('/locations/provinces', locations.provinces);
  app.get('/locations/countries', locations.countries);
  app.post('/locations/countries', locations.create.country);
  app.post('/locations/provinces', locations.create.province);
  app.post('/locations/sectors', locations.create.sector);
  app.post('/locations/villages', locations.create.village);

  app.get('/locations/detail/:uuid', locations.detail);

  // API for account routes crud
  app.get('/accounts', account.list);
  app.get('/accounts/:id', account.detail);
  app.get('/accounts/:id/balance', account.getSold);
  app.post('/accounts', account.create);
  app.put('/accounts/:id', account.update);

  //API for account type routes crud
  app.get('/account_types', accountType.list);
  app.get('/account_types/:id', accountType.detail);
  app.post('/account_types', accountType.create);
  app.put('/account_types/:id', accountType.update);
  app.delete('/account_types/:id', accountType.remove);

  //API for cost_center routes crud
  app.get('/cost_centers', costCenter.list);
  app.get('/cost_centers/:id', costCenter.detail);
  app.get('/cost_centers/:id/cost', costCenter.getCostValue);
  app.post('/cost_centers', costCenter.create);
  app.put('/cost_centers/:id', costCenter.update);
  app.delete('/cost_centers/:id', costCenter.remove);

  //API for service routes

  app.post('/services', services.create);
  app.get('/services', services.list);
  app.get('/services/:id', services.detail);
  app.put('/services/:id', services.update);
  app.delete('/services/:id', services.remove);

  //API for profit_center routes crud
  app.get('/profit_centers', profitCenter.list);
  app.get('/profit_centers/:id', profitCenter.detail);
  app.get('/profit_centers/:id/profit', profitCenter.getProfitValue);
  app.post('/profit_centers', profitCenter.create);
  app.put('/profit_centers/:id', profitCenter.update);
  app.delete('/profit_centers/:id', profitCenter.remove);


  //API for reference routes crud
  app.get('/references', reference.list);
  app.get('/references/:id', reference.detail);
  app.post('/references', reference.create);
  app.put('/references/:id', reference.update);
  app.delete('/references/:id', reference.remove);

 //API for subsidy routes crud
  app.get('/subsidies', subsidy.list);
  app.get('/subsidies/:id', subsidy.detail);
  app.post('/subsidies', subsidy.create);
  app.put('/subsidies/:id', subsidy.update);
  app.delete('/subsidies/:id', subsidy.remove);


  // -> Add :route
  app.post('/report/build/:route', reports.build);
  app.get('/report/serve/:target', reports.serve);

  // app.post('/sale/', createSale.execute);
  app.post('/consumption_loss/', consumptionLoss.execute);

  // trial balance routes
  app.post('/journal/trialbalance', trialbalance.postTrialBalance);
  app.post('/journal/togeneralledger', trialbalance.postToGeneralLedger); // TODO : rename?

  app.get('/journal/:table/:id', journal.lookupTable);

  // TODO Transition to journal API (this route should be /journal)
  app.get('/journal_list/', journal.transactions);


  // ledger routes
  // TODO : needs renaming
  app.get('/ledgers/debitor/:id', ledger.compileDebtorLedger);
  app.get('/ledgers/debitor_group/:id', ledger.compileGroupLedger);
  app.get('/ledgers/employee_invoice/:id', ledger.compileEmployeeLedger);
  app.get('/ledgers/distributableSale/:id', ledger.compileSaleLedger);
  app.get('/ledgers/debitor_sale/:id/:saleId', ledger.compileDebtorLedgerSale);

  /* fiscal year controller */

  app.get('/fiscal', fiscal.getFiscalYears);
  app.post('/fiscal/create', fiscal.createFiscalYear);

  app.get('/reports/:route/', legacyReports.buildReport);

  /* load a user's tree */
  app.get('/tree', tree.generate);

  // snis controller
  app.get('/snis/getAllReports', snis.getAllReports);
  app.get('/snis/getReport/:id', snis.getReport);
  app.post('/snis/createReport', snis.createReport);
  app.delete('/snis/deleteReport/:id', snis.deleteReport);
  app.post('/snis/populateReport', snis.populateReport);
  app.get('/snis/healthZones',snis.healthZones);

  /**
   * refactor-categorisation
   *
   * @todo test all routes below to ensure no broken links
   */

  // Financial services - cost/ profit centers, services etc.
  app.get('/services/', financeServices.listServices);
  app.get('/available_cost_center/', financeServices.availableCostCenters);
  app.get('/available_profit_center/', financeServices.availableProfitCenters);
  app.get('/cost/:id_project/:cc_id', financeServices.costCenterCost);
  app.get('/profit/:id_project/:pc_id', financeServices.profitCenterCost);
  app.get('/costCenterAccount/:id_enterprise/:cost_center_id', financeServices.costCenterAccount);
  app.get('/profitCenterAccount/:id_enterprise/:profit_center_id', financeServices.profitCenterAccount);
  app.get('/removeFromCostCenter/:tab', financeServices.removeFromCostCenter);
  app.get('/removeFromProfitCenter/:tab', financeServices.removeFromProfitCenter);
  app.get('/auxiliairyCenterAccount/:id_enterprise/:auxiliairy_center_id', financeServices.auxCenterAccount);

  // DEPRECIATED Inventory routes - these should be removed as soon as possible
  // FIXME Depreciate routes
  app.get('/lot/:inventory_uuid', depreciatedInventory.getInventoryLot);
  app.get('/stockIn/:depot_uuid/:df/:dt', depreciatedInventory.stockIn);
  app.get('/inv_in_depot/:depot_uuid', depreciatedInventory.inventoryByDepot);
  app.get('/getExpiredTimes/', depreciatedInventory.listExpiredTimes);
  app.get('/getStockEntry/', depreciatedInventory.listStockEntry);
  app.get('/getStockConsumption/', depreciatedInventory.listStockConsumption);
  app.get('/monthlyConsumptions/:inventory_uuid/:nb', depreciatedInventory.listMonthlyConsumption);
  app.get('/getConsumptionTrackingNumber/', depreciatedInventory.listConsumptionByTrackingNumber);
  app.get('/getMonthsBeforeExpiration/:id', depreciatedInventory.formatLotsForExpiration);
  app.get('/stockIntegration/', depreciatedInventory.getStockIntegration);

  // Employee management
  app.get('/employee_list/', employees.list);
  app.get('/holiday_list/:pp/:employee_id', employees.listHolidays);
  app.get('/getCheckHollyday/', employees.checkHoliday);
  app.get('/getCheckOffday/', employees.checkOffday);

  app.get('/caution/:debitor_uuid/:project_id', caution.debtor);

  app.get('/getAccount6', accounts.listIncomeAccounts);
  app.get('/getAccount7/', accounts.listExpenseAccounts);
  app.get('/getClassSolde/:account_class/:fiscal_year', accounts.getClassSolde);
  app.get('/getTypeSolde/:fiscal_year/:account_type_id/:is_charge', accounts.getTypeSolde);


  app.get('available_payment_period/', taxPayment.availablePaymentPeriod);
  app.post('/payTax/', taxPayment.submit);
  app.put('/setTaxPayment/', taxPayment.setTaxPayment);

  app.get('/cost_periodic/:id_project/:cc_id/:start/:end', financeServices.costByPeriod);
  app.get('/profit_periodic/:id_project/:pc_id/:start/:end', financeServices.profitByPeriod);

  // TODO Remove or upgrade (model in database) every report from report_depreciate
  app.get('/getDistinctInventories/', depreciatedReports.listDistinctInventory);
  app.get('/getReportPayroll/', depreciatedReports.buildPayrollReport);

  // Payroll
  app.get('/getDataPaiement/', payroll.listPaiementData);
  app.get('/getEmployeePayment/:id', payroll.listPaymentByEmployee);
  app.get('/getEnterprisePayment/:employee_id', payroll.listPaymentByEnterprise);
  app.post('/payCotisation/', payroll.payCotisation);
  app.post('/posting_promesse_payment/', payroll.payPromesse);
  app.post('/posting_promesse_cotisation/', payroll.payPromesseCotisation);
  app.post('/posting_promesse_tax/', payroll.payPromesseTax);
  app.put('/setCotisationPayment/', payroll.setCotisationPayment);
  app.get('/getEmployeeCotisationPayment/:id', payroll.listEmployeeCotisationPayments);
  app.get('/taxe_ipr_currency/', payroll.listTaxCurrency);

  app.post('/posting_donation/', donations.post);

  app.get('/getSubsidies/', subsidies.list);

  /*  Inventory and Stock Managment */
  app.get('/inventory/metadata', inventory.getInventoryItems);
  app.get('/inventory/:uuid/metadata', inventory.getInventoryItemsById);

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

  app.get('/inventory/donations', inventory.getInventoryDonations);
  app.get('/inventory/:uuid/donations', inventory.getInventoryDonationsById);

  /* Depot routes */
  app.get('/depots', depots.list);
  app.get('/depots/:uuid', depots.detail);
  app.put('/depots/:uuid', depots.update);
  app.post('/depots', depots.create);

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

  /* continuing on ... */

  // stock API
  app.get('/donations', donations.getRecentDonations);

  app.post('/posting_fiscal_resultat/', fiscal.fiscalYearResultat);

  // Extra Payement
  app.post('/extraPayment/', extra.handleExtraPayment);

  // general ledger controller
  // transitioning to a more traditional angular application architecture
  app.get('/ledgers/general', gl.route);

  // finance controller
  app.get('/finance/debtors', genericFinance.getDebtors);
  app.get('/finance/creditors', genericFinance.getCreditors);
  app.get('/finance/profitcenters', genericFinance.getProfitCenters);
  app.get('/finance/costcenters', genericFinance.getCostCenters);
  app.post('/finance/journalvoucher', genericFinance.postJournalVoucher);

  // currencies API
  app.get('/currencies', currencies.list);
  app.get('/currencies/:id', currencies.detail);

  // accounts controller
  app.get('/accounts', accounts.list);
  app.get('/InExAccounts/:id_enterprise/', accounts.listInExAccounts);
  app.get('/availableAccounts/:id_enterprise/', accounts.listEnterpriseAccounts);
  app.get('/availableAccounts_profit/:id_enterprise/', accounts.listEnterpriseProfitAccounts);

  // Patient invoice API

  // TODO Decide if the route should be named patient invoice
  app.get('/sales', patientInvoice.list);
  app.post('/sales', patientInvoice.create);
  app.get('/sales/search', patientInvoice.search);
  app.get('/sales/:uuid', patientInvoice.details);
  app.get('/sales/references/:reference', patientInvoice.reference);

  // Patients API
  app.get('/patients', patient.list);
  app.post('/patients', patient.create);
  app.put('/patients/:uuid', patient.update);

  app.get('/patients/search', patient.search);
  app.get('/patients/groups', patient.listGroups);
  app.get('/patients/:uuid', patient.details);

  app.get('/patients/:uuid/groups', patient.groups);
  app.post('/patients/:uuid/groups', patient.updateGroups);

  app.get('/patients/checkHospitalId/:id', patient.verifyHospitalNumber);
  app.post('/patients/visit', patient.visit);

  // app.get('/patients/search', patient.search);
  app.get('/patients/search/name/:value', patient.searchFuzzy);
  app.get('/patients/search/reference/:value', patient.searchReference);

  /** Debtors API */
  /** @deprecated `/debtors/groups` please use `/debtor_groups` at the client side */
  /** @deprecated `/debtors/groups/:uuid` please use `/debtor_groups/:uuid` at the client side */
  app.get('/debtors/groups', debtors.listGroups);
  app.get('/debtors/groups/:uuid', debtors.groupDetails);
  app.get('/debtors/:uuid/invoices', debtors.fetchInvoices);
  app.put('/debtors/:uuid', debtors.update);

  /** Debtor Groups API */
  app.post('/debtor_groups', debtorGroups.create);
  app.get('/debtor_groups', debtorGroups.list);
  app.get('/debtor_groups/:uuid', debtorGroups.detail);
  app.get('/debtor_groups/:uuid/invoices', debtorGroups.getInvoices);

  // search stuff
  // TODO merge with patients API
  app.get('/patient/:uuid', patient.details);
  app.get('/patient/search/fuzzy/:match', patient.searchFuzzy);
  app.get('/patient/search/reference/:reference', patient.searchReference);

  // analytics for financial dashboard
  // cash flow analytics
  app.get('/analytics/cashboxes', analytics.cashflow.getCashBoxes);
  app.get('/analytics/cashboxes/:id/balance', analytics.cashflow.getCashBoxBalance);
  app.get('/analytics/cashboxes/:id/history', analytics.cashflow.getCashBoxHistory);

  // debtor analytics
  app.get('/analytics/debtorgroups/top', analytics.cashflow.getTopDebtorGroups);
  app.get('/analytics/debtors/top', analytics.cashflow.getTopDebtors);

  // users controller
  app.get('/users', users.list);
  app.get('/users/:id', users.details);
  app.get('/users/:id/projects', users.projects.list);
  app.get('/users/:id/permissions', users.permissions.list);
  app.post('/users', users.create);
  app.post('/users/:id/permissions', users.permissions.assign);
  app.put('/users/:id', users.update);
  app.put('/users/:id/password', users.password);
  app.delete('/users/:id', users.delete);
  // @deprecated
  app.get('/editsession/authenticate/:pin', users.authenticatePin);

  // budget controller
  app.post('/budget/upload', multipart({ uploadDir: 'client/upload'}), budget.upload);
  app.post('/budget/update', budget.update);

  // projects controller
  app.get('/projects/:id', projects.details);
  app.put('/projects/:id', projects.update);
  app.post('/projects', projects.create);
  app.delete('/projects/:id', projects.delete);

  // cashbox controller
  app.get('/cashboxes', cashboxes.list);
  app.get('/cashboxes/:id', cashboxes.details);
  app.post('/cashboxes', cashboxes.create);
  app.put('/cashboxes/:id', cashboxes.update);
  app.delete('/cashboxes/:id', cashboxes.delete);

  // cashbox currencies
  app.get('/cashboxes/:id/currencies', cashboxes.currencies.list);
  app.get('/cashboxes/:id/currencies/:currencyId', cashboxes.currencies.details);
  app.post('/cashboxes/:id/currencies', cashboxes.currencies.create);
  app.put('/cashboxes/:id/currencies/:currencyId', cashboxes.currencies.update);

  // price lists
  app.get('/prices', priceList.list);
  app.get('/prices/:uuid', priceList.details);
  app.post('/prices', priceList.create);
  app.put('/prices/:uuid', priceList.update);
  app.delete('/prices/:uuid', priceList.delete);

  /**
  * transfers
  * NOTE: The `/cash/transfers` API endpoint must be above the `/cash` API endpoint
  */
  app.get('/cash/transfers', transfers.list);
  app.get('/cash/transfers/:id', transfers.detail);
  app.post('/cash/transfers', transfers.create);

  /**
  * conventions
  * NOTE: The `/cash/conventions` API endpoint must be above the `/cash` API endpoint
  */
  app.post('/cash/conventions', conventions.create);

  /** cash (aux/primary) */
  app.get('/cash', cash.list);
  app.get('/cash/:uuid', cash.detail);
  app.post('/cash', cash.create);
  app.put('/cash/:uuid', cash.update);
  app.delete('/cash/:uuid', cash.debitNote);
  app.get('/cash/references/:reference', cash.reference);

  /** @todo - classify these */
  app.get('/cashflow/report/', cashflow.getReport);
  //app.get('/stock/entries?', depots.getStockEntry);

  // Enterprises api
  app.get('/enterprises', enterprises.list);
  app.get('/enterprises/:id', enterprises.detail);
  app.post('/enterprises', enterprises.create);
  app.put('/enterprises/:id', enterprises.update);

  // employees api

  /** employees */
  app.get('/employees', employees.list);
  app.get('/employees/:id', employees.detail);
  app.get('/employees/:key/:value', employees.search);
  app.put('/employees/:id', employees.update);
  app.post('/employees', employees.create);

  /** billing services */
  app.get('/billing_services', billingServices.list);
  app.get('/billing_services/:id', billingServices.detail);
  app.post('/billing_services', billingServices.create);
  app.put('/billing_services/:id', billingServices.update);
  app.delete('/billing_services/:id', billingServices.delete);


  /** discounts */
  app.get('/discounts', discounts.list);
  app.get('/discounts/:id', discounts.detail);
  app.post('/discounts', discounts.create);
  app.put('/discounts/:id', discounts.update);
  app.delete('/discounts/:id', discounts.delete);

  /** voucher api endpoint */
  app.get('/vouchers', vouchers.list);
  app.get('/vouchers/:uuid', vouchers.detail);
  app.post('/vouchers', vouchers.create);

  /** Suppliers api */
  app.get('/suppliers/search', suppliers.search);
  app.get('/suppliers', suppliers.list);
  app.get('/suppliers/:uuid', suppliers.detail);
  app.post('/suppliers', suppliers.create);
  app.put('/suppliers/:uuid', suppliers.update);

  /** purchase */
  app.post('/purchase', purchase.create);
  app.get('/purchase', purchase.list);
  app.get('/purchase/:uuid', purchase.detail);
  app.put('/purchase/:uuid', purchase.update);

  /** functions api */
  app.get('/functions', functions.list);
  app.get('/functions/:id', functions.detail);
  app.post('/functions', functions.create);
  app.put('/functions/:id', functions.update);
  app.delete('/functions/:id', functions.delete);

  /** Grades api */
  app.get('/grades', grades.list);
  app.get('/grades/:uuid', grades.detail);
  app.post('/grades', grades.create);
  app.put('/grades/:uuid', grades.update);
  app.delete('/grades/:uuid', grades.delete);

  /** Creditor Groups API */
  app.post('/creditor_groups', creditorGroups.create);
  app.get('/creditor_groups', creditorGroups.list);
  app.get('/creditor_groups/:uuid', creditorGroups.detail);
  app.put('/creditor_groups/:uuid', creditorGroups.update);

};
