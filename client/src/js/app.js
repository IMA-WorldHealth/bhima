var bhima = angular.module('bhima', [
  'bhima.controllers', 'bhima.services', 'bhima.directives', 'bhima.filters', 'bhima.components', 'ui.router',
  'ui.bootstrap', 'pascalprecht.translate', 'ngStorage', 'chart.js', 'tmh.dynamicLocale',
  'ngFileUpload', 'ui.grid', 'ui.grid.selection', 'ui.grid.autoResize', 'ui.grid.resizeColumns', 'angularMoment', 'ngMessages',
  'ui.grid.pagination', 'ui.grid.moveColumns', 'ui.grid.grouping'
]);


function bhimaConfig($stateProvider, $urlRouterProvider) {
  /* misc routes */

  $stateProvider
  .state('index', {
    url : '/',
    controller : 'HomeController as HomeCtrl',
    templateUrl : 'partials/home/home.html'
  })
  .state('login', {
    url : '/login',
    controller : 'LoginController as LoginCtrl',
    templateUrl : 'partials/login/login.html'
  })
  .state('permissions', {
    url : '/permissions',
    controller: 'PermissionsController as PermissionsCtrl',
    templateUrl: 'partials/permissions/permissions.html'
  })
  .state('enterprises', {
    url : '/enterprises',
    controller: 'EnterpriseController as EnterpriseCtrl',
    templateUrl: 'partials/enterprises/enterprises.html'
  })
  .state('projects', {
    url : '/projects',
    controller : 'ProjectController as ProjectCtrl',
    templateUrl : 'partials/projects/projects.html'
  })
  .state('fiscal', {
    url : '/fiscal',
    controller: 'FiscalController as FiscalCtrl',
    templateUrl: 'partials/fiscal/fiscal.html'
  })
  .state('exchange', {
    url : '/exchange',
    controller : 'ExchangeRateController as ExchangeCtrl',
    templateUrl: 'partials/exchange/exchange.html'
  })
  .state('settings', {
    url : '/settings',
    controller: 'settings as SettingsCtrl',
    templateUrl: 'partials/settings/settings.html'
  })
  .state('services', {
    url : '/services',
    controller : 'ServicesController as ServicesCtrl',
    templateUrl : 'partials/services/services.html'
  })
  .state('caution', {
    url : '/caution',
    controller : 'CautionController as CautionCtrl',
    templateUrl : 'partials/caution/caution.html'
  })
  .state('extra_payment', {
    url : '/extra_payment',
    controller : 'ExtraPaymentController as PaymentCtrl',
    templateUrl : 'partials/cash/extra_payment/extra_payment.html'
  })
  
  /**
   * @fixme - this is to allow end to end testing of the patient invoice module
   * @todo - replace this with a real receipt.
   */
  .state('invoiceMessage', {
    url : '/invoice/sale/:invoiceId',
    template: '<div id="temp-success-message">Successfully created a patient invoice!</div>'
  })
  .state('invoice', {
    url : '/invoice/:originId/:invoiceId',
    controller: 'receipts',
    templateUrl: 'partials/receipts/receipts.html'
  })
  .state('/cash_discard/:receiptId?', {
    controller: 'cashDiscard',
    templateUrl: 'partials/cash/discard/discard.html'
  })
  .state('configBilan', {
    url: '/section_bilan',
    controller : 'sectionBilanController as sectionBilanCtrl',
    templateUrl : 'partials/section_bilan/section_bilan.html'
  })
  .state('configResultat', {
    url : '/section_resultat',
    controller : 'sectionResultatController as sectionResultatCtrl',
    templateUrl : 'partials/section_resultat/section_resultat.html'
  })
  .state('/variation_exploitation', {
    controller : 'variationExploitationController as variationCtrl',
    templateUrl : 'partials/reports_proposed/variation_exploitation/variation_exploitation.html'
  })
  .state('groupInvoice', {
    url : '/group_invoice',
    controller : 'GroupInvoiceController as InvoiceCtrl',
    templateUrl : 'partials/group_invoice/group_invoice.html'
  })
  .state('support', {
    url : '/support/:id?',
    controller : 'support',
    templateUrl : 'partials/support/support.html'
  })
  .state('accounts', {
    url : '/accounts',
    controller: 'AccountsController as AccountsCtrl',
    templateUrl: 'partials/accounts/accounts.html'
  })
  .state('dashboards/finance', {
    url : '/dashboards/finance',
    templateUrl : 'partials/dashboard/finance.html'
  })
  .state('/config_accounting', {
    controller: 'ConfigAccountingController as ConfigAccountCtrl',
    templateUrl: 'partials/payroll/config_accounting/config_accounting.html'
  })
  .state('subsidies', {
    url : '/subsidies',
    controller : 'SubsidyController as SubsidyCtrl',
    templateUrl : 'partials/subsidies/subsidies.html'
  })
  .state('/report/invoice/:target', {
    controller : 'configureInvoice',
    templateUrl : 'partials/reports_proposed/invoice/invoice.html'
  })

  /* Admin : depot management */
  .state('/depots_management', {
    url : '/depots_management',
    controller : 'DepotManagementController as DepotCtrl',
    templateUrl : 'partials/depots_management/depots_management.html'
  })

  /* Admin : debtor group management */
  .state('debtor_groups', {
    url : '/debtor_groups',
    controller : 'DebtorGroupsController as DebtorGroupCtrl',
    templateUrl : 'partials/debtor_groups/debtor_groups.html'
  })

  /* employees routes */
  .state('employees', {
    url : '/employees',
    controller : 'EmployeeController as EmployeeCtrl',
    templateUrl : 'partials/employees/employees.html'
  })
  .state('/employees/fonction', {
    controller : 'FonctionController',
    templateUrl : 'partials/employees/fonction/fonction.html'
  })
  .state('/employees/grades', {
    controller : 'EmployeeGradeController',
    templateUrl : 'partials/employees/grades/grades.html'
  })
  .state('/employees/offdays', {
    controller : 'OffdayController as OffdayCtrl',
    templateUrl : 'partials/employees/offdays/offdays.html'
  })
  .state('/employees/holidays', {
    controller : 'HolidayController as HolidayCtrl',
    templateUrl : 'partials/employees/holidays/holidays.html'
  })

  /* location routes */

  .state('/locations', {
    url : '/locations',
    controller : 'LocationController as LocationCtrl',
    templateUrl: 'partials/locations/locations.html'
  })
  .state('locations/village', {
    url : '/locations/village',
    controller : 'VillageController as VillageCtrl',
    templateUrl: 'partials/locations/village/village.html'
  })
  .state('locations/sector', {
    url : '/locations/sector',
    controller : 'SectorController as SectorCtrl',
    templateUrl: 'partials/locations/sector/sector.html'
  })
  .state('locations/province', {
    url : '/locations/province',
    controller : 'ProvinceController as ProvinceCtrl',
    templateUrl: 'partials/locations/province/province.html'
  })
  .state('locations/country', {
    url : '/locations/country',
    controller : 'CountryController as CountryCtrl',
    templateUrl: 'partials/locations/country/country.html'
  })

  /* budget routes */

  .state('/budgets/create', {
    controller: 'NewBudgetController as BudgetCtrl',
    templateUrl: 'partials/budget/create/create.html'
  })
  .state('/budgets/update', {
    controller: 'editAccountBudget',
    templateUrl: 'partials/budget/update/update.html'
  })
  .state('/budgets/analysis', {
    controller: 'AnalysisBudgetController as BudgetCtrl',
    templateUrl: 'partials/budget/analysis/analysis.html'
  })
  .state('/budgets/:accountID?', {
    controller: 'budget',
    templateUrl: 'partials/budget/budget.html'
  })

  /* journal routes */

  .state('/journal', {
    controller: 'journal.grid',
    templateUrl:'partials/journal/journal.html'
  })
  .state('/journal/print', {
    controller : 'journal.print',
    templateUrl : 'partials/journal/print.html'
  })
  .state('/journal/voucher', {
    controller: 'JournalVoucherController as JournalVoucherCtrl',
    templateUrl: 'partials/journal/voucher/voucher.html'
  })
  .state('simpleVouchers', {
    url : '/vouchers/simple',
    controller: 'SimpleJournalVoucherController as SimpleVoucherCtrl',
    templateUrl: 'partials/vouchers/simple.html'
  })

  /* 2.X Journal routes */
  .when('/journal', { 
    controller : 'JournalController as JournalCtrl', 
    templateUrl : 'partials/2.X-journal/journal.html'
  })

  /* debtors routes */

  .state('debtors/groups', {
    url : '/debtors/groups',
    controller : 'DebtorGroupController as GroupCtrl',
    templateUrl: 'partials/debtors/groups.html'
  })

  /* references routes */

  .state('references', {
    url : '/references',
    controller: 'ReferenceController',
    templateUrl: 'partials/references/references.html'
  })
  .state('/references/groups', {
    controller: 'ReferenceGroupController as ReferenceGroupCtrl',
    templateUrl: 'partials/references/groups/groups.html'
  })

  /* inventory routes */

  .state('/inventory', {
    controller: 'inventory',
    templateUrl: '/partials/inventory/inventory.html'
  })
  .state('/inventory/view', {
    controller : 'inventoryView',
    templateUrl:'/partials/inventory/view/view.html'
  })
  .state('/inventory/register', {
    controller: 'InventoryRegisterController',
    templateUrl: '/partials/inventory/register/register.html'
  })
  .state('/inventory/update', {
    controller : 'InventoryUpdateController',
    templateUrl : 'partials/inventory/update_item/update_item.html'
  })
  .state('/inventory/groups', {
    controller : 'inventory.groups',
    templateUrl : 'partials/inventory/groups/groups.html'
  })
  .state('/inventory/types',  {
    controller : 'InventoryTypeController',
    templateUrl : 'partials/inventory/types/types.html'
  })
  .state('/inventory/manifest', {
    controller : 'inventory.manifest',
    templateUrl : 'partials/inventory/manifest/manifest.html'
  })
  .state('/inventory/depot', {
    controller : 'inventory.depot',
    templateUrl : 'partials/inventory/depot/depot.html'
  })
  .state('prices', {
    url : '/prices',
    controller: 'PriceListController as PriceListCtrl',
    templateUrl: 'partials/price_list/pricelist.html'
  })
  .state('/inventory/distribution/:depotId?', {
    controller : 'InventoryDistributionController',
    templateUrl : 'partials/inventory/distribution/distribution.html'
  })

  /* sales routes */
  .state('sales', {
    url : '/sales',
    controller: 'sales',
    templateUrl: '/partials/sales/sales.html'
  })

  /* cash routes */

  .state('/cash', {
    url : '/cash',
    controller: 'CashboxSelectController as CashboxSelectCtrl',
    templateUrl: '/partials/cash/cashboxSelect.html'
  })
  .state('/cash/:id', {
    url : '/cash/:id',
    controller: 'CashController as CashCtrl',
    templateUrl: '/partials/cash/cash.html'
  })

  /* creditor routes */

  .state('creditors', {
    url : '/creditors',
    controller: 'SupplierController as SupplierCtrl',
    templateUrl: '/partials/creditors/creditors.html'
  })
  .state('creditors/groups', {
    url : '/creditors/groups',
    controller: 'CreditorGroupController',
    templateUrl: 'partials/creditors/groups/groups.html'
  })

  /* purchase routes */


  .state('purchases', {
    url : '/purchases',
    controller : 'PurchaseController',
    templateUrl : 'partials/purchases/purchases.html'
  })
  .state('/purchases/create', {
    controller: 'CreatePurchaseOrderController',
    templateUrl: 'partials/purchases/create/purchase.html'
  })
  .state('/purchases/view', {
    controller: 'purchaseRecords as purchaseRecordsCtrl',
    templateUrl: 'partials/purchases/view/purchase_records.html'
  })
  .state('/purchases/view/:option', {
    controller: 'purchase_view',
    templateUrl: 'partials/purchases/view/purchase_view.html'
  })
  .state('/purchases/confirm', {
    controller: 'PurchaseConfirm as purchaseConfirmCtrl',
    templateUrl: 'partials/purchases/confirm/confirm.html'
  })
  .state('/purchases/validate', {
    controller: 'purchaseValidate',
    templateUrl: 'partials/purchases/validate/validate.html'
  })
  .state('/purchases/authorization', {
    controller: 'purchaseAuthorization',
    templateUrl: 'partials/purchases/authorization/authorization.html'
  })

  /* cost center routes */

  .state('/cost_center', {
    controller: 'CostCenterController as CenterCtrl',
    templateUrl: 'partials/cost_center/cost_center.html'
  })
  .state('/cost_center/center', {
    controller: 'AnalysisCostCenterController as CenterCtrl',
    templateUrl: 'partials/cost_center/center/analysis_center.html'
  })
  .state('/cost_center/assigning', {
    controller: 'CostCenterAssignmentController',
    templateUrl: 'partials/cost_center/assigning/assigning.html'
  })
  .state('/cost_center/allocation', {
    controller: 'CostCenterAllocationController as CenterCtrl',
    templateUrl: 'partials/cost_center/allocation/allocation.html'
  })

  /* profit center routes */

  .state('/profit_center', {
    controller: 'ProfitCenterController as CenterCtrl',
    templateUrl: 'partials/profit_center/profit_center.html'
  })
  .state('/profit_center/center', {
    controller: 'AnalysisProfitCenterController as CenterCtrl',
    templateUrl: 'partials/profit_center/center/analysis.html'
  })
  .state('/profit_center/allocation', {
    controller: 'ProfitCenterAllocationController as ProfitCtrl',
    templateUrl: 'partials/profit_center/allocation/allocation.html'
  })

  /* patients routes */

  .state('patients/register', {
    url : '/patients/register',
    controller: 'PatientRegistrationController as PatientRegCtrl',
    templateUrl: 'partials/patients/registration/registration.html'
  })

  /* Patient Edit */
  .state('patients/edit/', {
    url  : '/patients/edit',
    controller  : 'PatientEditFind as PatientEditFindCtrl',
    templateUrl : 'partials/patients/edit/find.html'
  })
  .state('patients/edit/:patientID', {
    url : '/patients/edit/:patientID',
    controller: 'PatientEdit as PatientEditCtrl',
    templateUrl: 'partials/patients/edit/edit.html'
  })

  /* */

  .state('patientInvoice', {
    url : '/invoices/patient',
    controller : 'PatientInvoiceController as PatientInvoiceCtrl',
    templateUrl : 'partials/patient_invoice/patientInvoice.html'
  })

  .state('/patients/search/:patientID?', {
    controller: 'patientRecords',
    templateUrl: '/partials/patients/search/search.html'
  })
  .state('/patients/groups', {
    controller: 'patientGroup',
    templateUrl: 'partials/patients/groups/groups.html'
  })
  .state('/patients/groups/assignment', {
    controller: 'AssignPatientGroupController',
    templateUrl: 'partials/patients/groups/assignment.html'
  })
  .state('/patients/debtor', {
    controller : 'group.debtor.reassignment',
    templateUrl : 'partials/patients/debtor/swap.html'
  })
  .state('/trialbalance/print', {
    controller : 'TrialBalancePrintController as PrintCtrl',
    templateUrl : 'partials/journal/trialbalance/print.html'
  })

  /* depot routes */
  .state('depots', {
    url : '/depots',
    controller : 'DepotController as DepotCtrl',
    templateUrl : 'partials/depots/depots.html'
  })
  .state('/depots/:depotId/entry', {
    controller : 'DepotEntryController',
    templateUrl : 'partials/depots/entry/entry.html'
  })
  .state('/depots/:depotId/losses', {
    controller : 'DepotLossController as LossCtrl',
    templateUrl : 'partials/depots/loss/loss.html'
  })
  .state('/depots/:depotId/movements', {
    controller : 'StockMovementController as MovementCtrl',
    templateUrl : 'partials/depots/movement/movement.html'
  })
  .state('/depots/:depotId/distributions/patients', {
    controller : 'StockDistributionsController as StockDistributionsCtrl',
    templateUrl : 'partials/depots/distributions/patients/patients.html'
  })
  .state('/depots/:depotId/distributions/services', {
    controller : 'StockServiceDistributionsController as DistributionsCtrl',
    templateUrl : 'partials/depots/distributions/services/services.html'
  })
  .state('/depots/:depotId/distributions/:consumptionId/cancel', {
    controller : 'DepotDistributionsCancelController as CancelCtrl',
    templateUrl : 'partials/depots/distributions/cancel/cancel.html'
  })
  .state('/depots/:depotId/integrations', {
    controller : 'stockIntegration as integrationCtrl',
    templateUrl : 'partials/stock/integration/integration.html'
  })
  .state('/depots/:uuid/search', {
    controller : 'DepotStockSearchController',
    templateUrl: 'partials/depots/stock_search/search.html'
  })
  .state('/depots/:depotId/reports/distributions/:type', {
    controller : 'DepotStockDistributionsController as DistributionsCtrl',
    templateUrl : 'partials/depots/reports/distributions/distributions.html'
  })
  .state('/stock/entry/report/:documentId?', {
    controller : 'stock.entry.report',
    templateUrl : 'partials/stock/entry/report.html'
  })

  // TODO -- these should probably have an /inventory/ or /depot/ prefix
  .state('/stock/count', {
    controller : 'stock.count',
    templateUrl : 'partials/stock/count/count.html'
  })
  .state('/stock/expiring/:depotId', {
    controller : 'stock.expiring',
    templateUrl : 'partials/stock/expiring/expiring.html'
  })

  /* donation routes */

  .state('donors', {
    url : '/donors',
    controller: 'DonorManagementController',
    templateUrl: '/partials/inventory/donors/donors.html'
  })
  .state('/donations/:depotId?', {
    controller : 'DonationManagementController as DonationCtrl',
    templateUrl : 'partials/donations/donations.html'
  })
  .state('/donations/confirm', {
    controller : 'ConfirmDonationController as ConfirmCtrl',
    templateUrl : 'partials/donations/confirm/confirm.html'
  })
  .state('/donations/report/:documentId', {
    controller : 'ReportDonationsController',
    templateUrl : 'partials/donations/report.html'
  })

  // TODO -- these should be namespaced/prefixed by depot
  .state('/stock/dashboard', {
    controller : 'StockDashboardController as StockDashCtrl',
    templateUrl : 'partials/stock/dashboard/dashboard.html'
  })
  .state('/stock/integration_confirm', {
    controller : 'ConfirmStockIntegrationController as ConfirmCtrl',
    templateUrl : 'partials/stock/integration/confirm_integration/confirm_integration.html'
  })

  /* snis routes */

  .state('/snis', {
    controller : 'SnisController',
    templateUrl : 'partials/snis/snis.html'
  })
  .state('/snis/create', {
    controller : 'SnisCreateController',
    templateUrl : 'partials/snis/create/create.html'
  })
  .state('/snis/update/:id', {
    controller : 'SnisUpdateController',
    templateUrl : 'partials/snis/update/update.html'
  })

  /* tax routes */

  .state('/taxes', {
    controller : 'TaxesController',
    templateUrl : 'partials/taxes/taxes.html'
  })
  .state('/taxes/create', {
    controller : 'CreateTaxController',
    templateUrl : 'partials/taxes/create/create.html'
  })
  .state('/taxes/ipr', {
    controller : 'taxes_management.ipr',
    templateUrl : 'partials/taxes/ipr/ipr.html'
  })
  .state('/taxes/config_tax', {
    controller : 'config_tax',
    templateUrl : 'partials/taxes/config/config.html'
  })

  /* cotisations management */

  .state('/cotisations_management', {
    controller : 'cotisations_management.menu',
    templateUrl : 'partials/cotisation/cotisation_management.html'
  })
  .state('/cotisations_management/create', {
    controller : 'cotisations_management.create',
    templateUrl : 'partials/cotisation/create/create_cotisation.html'
  })
  .state('/cotisations_management/config_cotisation', {
    controller : 'config_cotisation',
    templateUrl : 'partials/cotisation/config_cotisation/config_cotisation.html'
  })
  .state('/payment_period', {
    controller : 'PaymentPeriodController',
    templateUrl : 'partials/payroll/payment_period/payment_period.html'
  })
  .state('/rubric_management', {
    controller : 'rubric_management.menu',
    templateUrl : 'partials/payroll/rubrics/rubrics.html'
  })
  .state('/rubric_management/config_rubric', {
    controller : 'config_rubric',
    templateUrl : 'partials/payroll/rubrics/config_rubric/config_rubric.html'
  })
  .state('/rubric_management/rubriques_payroll', {
    controller : 'RubriquePayrollController as RubriqueCtrl',
    templateUrl : 'partials/payroll/rubrics/rubriques_payroll/rubriques_payroll.html'
  })

  /* cashbox routes */
  .state('cashboxes', {
    url : '/cashboxes',
    controller : 'CashboxController as CashCtrl',
    templateUrl : 'partials/cash/cashboxes/cashboxes.html'
  })
  .state('cashboxes.currencies', {
    url : '/cashboxes/:uuid/currencies',
    controller : 'cash.cashbox_account',
    templateUrl : 'partials/cash/cashboxes/currencies/currencies.html'
  })

  /* reports routes */

  .state('/reports/daily_consumption', {
    controller : 'ReportDailyConsumptionController as ReportCtrl',
    templateUrl : 'partials/reports/daily_consumption/daily_consumption.html'
  })
  .state('/reports/distributions', {
    controller : 'ReportDepotDistributionsController as ReportCtrl',
    templateUrl : 'partials/reports/distributions/distributions.html'
  })
  .state('/reports/finance', {
    controller: 'reportFinance',
    templateUrl: 'partials/reports/finance/finance_report.html'
  })
  .state('/reports/patient_registrations', {
    controller : 'reportPatientRegistrations',
    templateUrl : 'partials/reports/patient_registrations/patient_registrations.html'
  })
  .state('/reports/cash_payments', {
    controller: 'reportCashPayments',
    templateUrl: 'partials/reports/cash_payments/cash_payments.html'
  })
  .state('/reports/summary', {
    controller: 'summary',
    templateUrl: 'partials/reports/summary/summary.html'
  })
  .state('/reports/patient_group/:uuid', {
    controller : 'report.patientGroup',
    templateUrl : 'partials/reports/patient_group/patient_group.html'
  })
  .state('/reports/prices', {
    controller : 'report.prices',
    templateUrl : 'partials/reports/prices/prices.html'
  })
  .state('/reports/transactions/account', {
    controller : 'report.transactions.account',
    templateUrl : 'partials/reports/transactions/account.html'
  })
  .state('/reports/transaction_report', {
    controller: 'reportTransaction',
    templateUrl: 'partials/reports/transaction_report/transaction_report.html'
  })
  .state('/reports/patient_standing', {
    controller : 'reportPatientStanding',
    templateUrl : '/partials/reports/patient_standing/patient_standing.html'
  })
  .state('/reports/employee_standing', {
    controller : 'reportEmployeeStanding',
    templateUrl : '/partials/reports/employee_standing/employee_standing.html'
  })
  .state('/reports/ledger/general_ledger', {
    controller: 'reportGeneralLedger',
    templateUrl: '/partials/reports/ledger/general_ledger.html'
  })
  .state('/reports/payroll_report', {
    controller : 'payroll_report',
    templateUrl : 'partials/reports/payroll_report/payroll_report.html'
  })
  .state('/reports/operating_account', {
    controller : 'OperatingAccountController as OperatingCtrl',
    templateUrl : 'partials/reports/operating_account/operating_account.html'
  })
  .state('/reports/debtor_aging', {
    controller: 'reportDebitorAging',
    templateUrl: 'partials/reports/debtor_aging/debtor_aging.html'
  })
  .state('/reports/account_statement/:id?', {
    controller: 'accountStatement',
    templateUrl: 'partials/reports/account_statement/account_statement.html'
  })
  .state('/reports/income_expensive', {
    controller: 'reportIncomeExpensive',
    templateUrl: 'partials/reports/income_expensive/income_expensive.html'
  })
  .state('/reports/service_exploitation', {
    controller: 'report.service_exploitation',
    templateUrl: 'partials/reports/service_exploitation/service_exploitation.html'
  })
  .state('/reports/global_transaction', {
    controller: 'ReportGlobalTransactionController as ReportCtrl',
    templateUrl: 'partials/reports/global_transaction/global_transaction.html'
  })
  .state('/reports/balance_mensuelle', {
    controller: 'ReportBalanceMensuelleController as ReportCtrl',
    templateUrl: 'partials/reports/balance_mensuelle/balance_mensuelle.html'
  })
  .state('/reports/donation', {
    controller: 'ReportDonationController as ReportCtrl',
    templateUrl: 'partials/reports/donation/donation.html'
  })
  .state('/reports/chart_of_accounts', {
    controller: 'ReportChartOfAccountsController',
    templateUrl: 'partials/reports/chart_of_accounts/chart.html'
  })
  .state('/reports/all_transactions', {
    controller : 'allTransactions',
    templateUrl : 'partials/reports/all_transactions/all_transactions.html'
  })
  .state('/reports/expiring', {
    controller : 'ReportStockExpirationsController as ReportCtrl',
    templateUrl : 'partials/reports/expiring_stock/expiring_stock.html'
  })
  .state('/reports/stock_store/:depotId', {
    controller : 'stock_store',
    templateUrl : 'partials/reports/stock_store/stock_store.html'
  })
  .state('/reports/purchase_order', {
    controller : 'purchase_order',
    templateUrl : 'partials/reports/purchase_order/purchase_order.html'
  })
  .state('/reports/donation_confirmation', {
    controller : 'donation_confirmation',
    templateUrl : 'partials/reports/donation_confirmation/donation_confirmation.html'
  })
  .state('/reports/stock_integration', {
    controller : 'ReportStockIntegrationController as ReportCtrl',
    templateUrl : 'partials/reports/stock_integration/stock_integration.html'
  })
  .state('/reports/stock_movement', {
    controller : 'stock_movement',
    templateUrl : 'partials/reports/stock_movement/stock_movement.html'
  })
  .state('/reports/bilan', {
    controller : 'configureBilan',
    templateUrl : 'partials/reports_proposed/bilan/bilan.html'
  })
  .state('/reports/debitor_group_report', {
    controller : 'DebtorGroupReportController as debtorGroupReportCtrl',
    templateUrl : 'partials/reports_proposed/debitor_group_report/debitor_group_report.html'
  })
  .state('/reports/result_account', {
    controller : 'configureResult',
    templateUrl : 'partials/reports_proposed/result_account/result_account.html'
  })
  .state('/reports/balance', {
    controller : 'configureBalance',
    templateUrl : 'partials/reports_proposed/balance/balance.html'
  })
  .state('/reports/debtorgroup/annual', {
    controller : 'DebtorGroupAnnualReportController as AnnualCtrl',
    templateUrl : 'partials/reports_proposed/debtor_group/annual.html'
  })
  .state('/reports/grand_livre', {
    controller : 'configureGrandLivre',
    templateUrl : 'partials/reports_proposed/grand_livre/grand_livre.html'
  })
  .state('/reports/employee_state', {
    controller : 'configureEmployeeState',
    templateUrl : 'partials/reports_proposed/employee_state/employee_state.html'
  })
  .state('/reports/cotisation_payment', {
    controller : 'cotisation_payment',
    templateUrl : 'partials/reports/cotisation_payment/cotisation_payment.html'
  })
  .state('/reports/salary_payment', {
    controller : 'salary_payment',
    templateUrl : 'partials/reports/salary_payment/salary_payment.html'
  })
  .state('/reports/taxes_payment', {
    controller : 'taxes_payment',
    templateUrl : 'partials/reports/taxes_payment/taxes_payment.html'
  })
  .state('/reports/stock_status', {
    controller : 'StockStatusReportController as StatusCtrl',
    templateUrl : 'partials/reports/stock_status/stock_status.html'
  })
  .state('/reports/loss_record', {
    controller : 'loss_record',
    templateUrl : 'partials/reports/loss_record/loss_record.html'
  })
  .state('/reports/income_report', {
    controller : 'primary_cash.incomeReport',
    templateUrl : 'partials/reports/primary_cash/income/income_report.html'
  })
  .state('/reports/expense_report', {
    controller : 'primary_cash.expenseReport',
    templateUrl : 'partials/reports/primary_cash/expense/expense_report.html'
  })
  .state('/reports/cash_flow/', {
    controller : 'cashFlowReportController as ReportCtrl',
    templateUrl : 'partials/reports/cash_flow/cash_flow.html'
  })
  .state('/reports/stock_report', {
    controller : 'stock_report',
    templateUrl : 'partials/reports/stock/stock_report.html'
  })
  .state('/reports/patient_visit_status', {
    controller : 'ReportPatientVisitStatus',
    templateUrl : '/partials/reports/patient_visit_status/patient_visit_status.html'
  })
  .state('/reports/stock_entry', {
    controller : 'ReportStockEntryController',
    templateUrl : 'partials/reports/stock/stock_entry/stock_entry.html'
  });

  $urlRouterProvider.otherwise('/');
}

function translateConfig($translateProvider) {
  //TODO Review i18n and determine if this it the right solution/grade_employers/
  $translateProvider.useStaticFilesLoader({
    prefix: '/i18n/',
    suffix: '.json'
  });

  $translateProvider.useSanitizeValueStrategy('escape');

  $translateProvider.preferredLanguage('fr');
}

function localeConfig(tmhDynamicLocaleProvider) {

  // TODO Hardcoded default translation/ localisation
  tmhDynamicLocaleProvider.localeLocationPattern('/i18n/locale/angular-locale_{{locale}}.js');
  tmhDynamicLocaleProvider.defaultLocale('fr-be');
}

// Logs HTTP errors to the console, even if uncaught
// TODO - in production, we shouldn't log as many errors
function authConfig($httpProvider) {
  $httpProvider.interceptors.push(['$injector', function ($injector) {
    return $injector.get('AuthInjectorFactory');
  }]);
}

// Redirect to login if not signed in.
function startupConfig($rootScope, $location, SessionService, amMoment) {
  $rootScope.$on('$stateChangeStart', function (event, next) {
    if (!SessionService.user) {
      $location.url('/login');
    }
  });

  // make sure $stateChangeErrors are emitted to the console.
  $rootScope.$on('$stateChangeError', console.log.bind(console));

  // TODO Hardcoded default translation/ localisation
  amMoment.changeLocale('fr');
}

// set the proper key prifix
function localStorageConfig($localStorageProvider) {
  var PREFIX = 'bhima-';
  $localStorageProvider.setKeyPrefix(PREFIX);
}

/**
 * This function is responsible for configuring anulgar's $http service. Any 
 * relevent services/ factories are registered at this point. 
 *
 * @params {Object} $httpProvider   Angular provider bject containing 
 *                                  'interceptors' that are chained on any HTTP request
 */
function httpConfig($httpProvider) { 
  
  // register error handling interceptor 
  $httpProvider.interceptors.push('ErrorInterceptor');
}

// configuration
bhima.config(['$stateProvider', '$urlRouterProvider', bhimaConfig]);
bhima.config(['$translateProvider', translateConfig]);
bhima.config(['tmhDynamicLocaleProvider', localeConfig]);
bhima.config(['$httpProvider', authConfig]);
bhima.config(['$localStorageProvider', localStorageConfig]);
bhima.config(['$httpProvider', httpConfig]);

// run
bhima.run(['$rootScope', '$location', 'SessionService', 'amMoment', startupConfig]);
