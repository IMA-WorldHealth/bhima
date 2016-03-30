var bhima = angular.module('bhima', [
  'bhima.controllers', 'bhima.services', 'bhima.directives', 'bhima.filters', 'bhima.components', 'ngRoute',
  'ui.bootstrap', 'pascalprecht.translate', 'ngStorage', 'chart.js', 'tmh.dynamicLocale',
  'ngFileUpload', 'ui.grid', 'ui.grid.selection', 'ui.grid.autoResize', 'ui.grid.resizeColumns', 'angularMoment', 'ngMessages',
  'ui.grid.pagination', 'ui.grid.moveColumns', 'ui.grid.grouping'
]);


function bhimaconfig($routeProvider) {
  // TODO: Dynamic routes loaded from unit database?

  /* misc routes */

  $routeProvider
  .when('/', {
    controller : 'HomeController as HomeCtrl',
    templateUrl : 'partials/home/home.html'
  })
  .when('/login', {
    controller : 'LoginController as LoginCtrl',
    templateUrl : 'partials/login/login.html'
  })
  .when('/permissions', {
    controller: 'PermissionsController as PermissionsCtrl',
    templateUrl: 'partials/permissions/permissions.html'
  })
  .when('/enterprises', {
    controller: 'EnterpriseController as EnterpriseCtrl',
    templateUrl: 'partials/enterprises/enterprises.html'
  })
  .when('/projects', {
    controller : 'ProjectController as ProjectCtrl',
    templateUrl : 'partials/projects/projects.html'
  })
  .when('/fiscal', {
    controller: 'FiscalController as FiscalCtrl',
    templateUrl: 'partials/fiscal/fiscal.html'
  })
  .when('/exchange', {
    controller : 'ExchangeRateController as ExchangeCtrl',
    templateUrl: 'partials/exchange/exchange.html'
  })
  .when('/settings/:route?', {
    controller: 'settings as SettingsCtrl',
    templateUrl: 'partials/settings/settings.html'
  })
  .when('/services', {
    controller : 'ServicesController as ServicesCtrl',
    templateUrl : 'partials/services/services.html'
  })
  .when('/caution', {
    controller : 'CautionController as CautionCtrl',
    templateUrl : 'partials/caution/caution.html'
  })
  .when('/extra_payment', {
    controller : 'ExtraPaymentController as PaymentCtrl',
    templateUrl : 'partials/cash/extra_payment/extra_payment.html'
  })
  .when('/invoice/:originId/:invoiceId', {
    controller: 'receipts',
    templateUrl: 'partials/receipts/receipts.html'
  })
  .when('/cash_discard/:receiptId?', {
    controller: 'cashDiscard',
    templateUrl: 'partials/cash/discard/discard.html'
  })
  .when('/section_bilan', {
    controller : 'sectionBilanController as sectionBilanCtrl',
    templateUrl : 'partials/section_bilan/section_bilan.html'
  })
  .when('/section_resultat', {
    controller : 'sectionResultat',
    templateUrl : 'partials/section_resultat/section_resultat.html'
  })
  .when('/variation_exploitation', {
    controller : 'variationExploitationController as variationCtrl',
    templateUrl : 'partials/reports_proposed/variation_exploitation/variation_exploitation.html'
  })
  .when('/group_invoice', {
    controller : 'GroupInvoiceController as InvoiceCtrl',
    templateUrl : 'partials/group_invoice/group_invoice.html'
  })
  .when('/support/:id?', {
    controller : 'support',
    templateUrl : 'partials/support/support.html'
  })
  .when('/accounts', {
    controller: 'AccountsController',
    templateUrl: 'partials/accounts/accounts.html'
  })
  .when('/dashboards/finance', {
    templateUrl : 'partials/dashboard/finance.html'
  })
  .when('/config_accounting', {
    controller: 'ConfigAccountingController as ConfigAccountCtrl',
    templateUrl: 'partials/payroll/config_accounting/config_accounting.html'
  })
  .when('/subsidies', {
    controller : 'SubsidyController as SubsidyCtrl',
    templateUrl : 'partials/subsidies/subsidies.html'
  })
  .when('/report/invoice/:target', {
    controller : 'configureInvoice',
    templateUrl : 'partials/reports_proposed/invoice/invoice.html'
  })

  /* Admin : depot management */
  .when('/depots_management', {
    controller : 'DepotManagementController as DepotCtrl',
    templateUrl : 'partials/depots_management/depots_management.html'
  })

  /* Admin : debtor group management */
  .when('/debtor_groups', {
    controller : 'DebtorGroupsController as DebtorGroupCtrl',
    templateUrl : 'partials/debtor_groups/debtor_groups.html'
  })

  /* employees routes */
  .when('/employees', {
    controller : 'EmployeeController as EmployeeCtrl',
    templateUrl : 'partials/employees/employees.html'
  })
  .when('/employees/fonction', {
    controller : 'FonctionController',
    templateUrl : 'partials/employees/fonction/fonction.html'
  })
  .when('/employees/grades', {
    controller : 'EmployeeGradeController',
    templateUrl : 'partials/employees/grades/grades.html'
  })
  .when('/employees/offdays', {
    controller : 'OffdayController as OffdayCtrl',
    templateUrl : 'partials/employees/offdays/offdays.html'
  })
  .when('/employees/holidays', {
    controller : 'HolidayController as HolidayCtrl',
    templateUrl : 'partials/employees/holidays/holidays.html'
  })

  /* location routes */

  .when('/locations', {
    controller : 'LocationController as LocationCtrl',
    templateUrl: 'partials/locations/locations.html'
  })
  .when('/locations/village', {
    controller : 'VillageController as VillageCtrl',
    templateUrl: 'partials/locations/village/village.html'
  })
  .when('/locations/sector', {
    controller : 'SectorController as SectorCtrl',
    templateUrl: 'partials/locations/sector/sector.html'
  })
  .when('/locations/province', {
    controller : 'ProvinceController as ProvinceCtrl',
    templateUrl: 'partials/locations/province/province.html'
  })
  .when('/locations/country', {
    controller : 'CountryController as CountryCtrl',
    templateUrl: 'partials/locations/country/country.html'
  })

  /* budget routes */

  .when('/budgets/create', {
    controller: 'NewBudgetController as BudgetCtrl',
    templateUrl: 'partials/budget/create/create.html'
  })
  .when('/budgets/update', {
    controller: 'editAccountBudget',
    templateUrl: 'partials/budget/update/update.html'
  })
  .when('/budgets/analysis', {
    controller: 'AnalysisBudgetController as BudgetCtrl',
    templateUrl: 'partials/budget/analysis/analysis.html'
  })
  .when('/budgets/:accountID?', {
    controller: 'budget',
    templateUrl: 'partials/budget/budget.html'
  })
  .when('/vouchers/simple', {
    controller: 'SimpleJournalVoucherController as SimpleVoucherCtrl',
    templateUrl: 'partials/vouchers/simple.html'
  })

  /* 2.X Journal routes */
  .when('/journal', { 
    controller : 'JournalController as JournalCtrl', 
    templateUrl : 'partials/2.X-journal/journal.html'
  })

  /* debtors routes */

  .when('/debtors/groups', {
    controller : 'DebtorGroupController as GroupCtrl',
    templateUrl: 'partials/debtors/groups.html'
  })

  /* references routes */

  .when('/references', {
    controller: 'ReferenceController',
    templateUrl: 'partials/references/references.html'
  })
  .when('/references/groups', {
    controller: 'ReferenceGroupController',
    templateUrl: 'partials/references/groups/groups.html'
  })

  /* inventory routes */

  .when('/inventory', {
    controller: 'inventory',
    templateUrl: '/partials/inventory/inventory.html'
  })
  .when('/inventory/view', {
    controller : 'inventoryView',
    templateUrl:'/partials/inventory/view/view.html'
  })
  .when('/inventory/register', {
    controller: 'InventoryRegisterController',
    templateUrl: '/partials/inventory/register/register.html'
  })
  .when('/inventory/update', {
    controller : 'InventoryUpdateController',
    templateUrl : 'partials/inventory/update_item/update_item.html'
  })
  .when('/inventory/groups', {
    controller : 'inventory.groups',
    templateUrl : 'partials/inventory/groups/groups.html'
  })
  .when('/inventory/types',  {
    controller : 'InventoryTypeController',
    templateUrl : 'partials/inventory/types/types.html'
  })
  .when('/inventory/manifest', {
    controller : 'inventory.manifest',
    templateUrl : 'partials/inventory/manifest/manifest.html'
  })
  .when('/inventory/depot', {
    controller : 'inventory.depot',
    templateUrl : 'partials/inventory/depot/depot.html'
  })
  .when('/prices', {
    controller: 'PriceListController as PriceListCtrl',
    templateUrl: 'partials/price_list/pricelist.html'
  })
  .when('/inventory/distribution/:depotId?', {
    controller : 'InventoryDistributionController',
    templateUrl : 'partials/inventory/distribution/distribution.html'
  })

  /* sales routes */

  .when('/sales', {
    controller: 'sales',
    templateUrl: '/partials/sales/sales.html'
  })
  .when('/sales/records/:recordID?', {
    controller: 'salesRecords',
    templateUrl: '/partials/records/sales_records/sales_records.html'
  })
  .when('/credit_note/:invoiceId?', {
    controller: 'CreditNoteController as NoteCtrl',
    templateUrl: 'partials/sales/credit_note/credit_note.html'
  })

  /* cash routes */

  .when('/cash', {
    controller: 'CashboxSelectController as CashboxSelectCtrl',
    templateUrl: '/partials/cash/cashboxSelect.html'
  })
  .when('/cash/:id', {
    controller: 'CashController as CashCtrl',
    templateUrl: '/partials/cash/cash.html'
  })
  .when('/cash/records/:recordID?', {
    controller: 'auxillaryRecords',
    templateUrl: '/partials/records/auxillary_cash_records/auxillary_cash_records.html'
  })

  /* creditor routes */

  .when('/creditors', {
    controller: 'SupplierController',
    templateUrl: '/partials/creditors/creditors.html'
  })
  .when('/creditors/groups', {
    controller: 'CreditorGroupController',
    templateUrl: 'partials/creditors/groups/groups.html'
  })

  /* purchase routes */


  .when('/purchases', {
    controller : 'PurchaseController',
    templateUrl : 'partials/purchases/purchases.html'
  })
  .when('/purchases/create', {
    controller: 'CreatePurchaseOrderController',
    templateUrl: 'partials/purchases/create/purchase.html'
  })
  .when('/purchases/view', {
    controller: 'purchaseRecords as purchaseRecordsCtrl',
    templateUrl: 'partials/purchases/view/purchase_records.html'
  })
  .when('/purchases/view/:option', {
    controller: 'purchase_view',
    templateUrl: 'partials/purchases/view/purchase_view.html'
  })
  .when('/purchases/confirm', {
    controller: 'PurchaseConfirm as purchaseConfirmCtrl',
    templateUrl: 'partials/purchases/confirm/confirm.html'
  })
  .when('/purchases/validate', {
    controller: 'purchaseValidate',
    templateUrl: 'partials/purchases/validate/validate.html'
  })
  .when('/purchases/authorization', {
    controller: 'purchaseAuthorization',
    templateUrl: 'partials/purchases/authorization/authorization.html'
  })

  /* cost center routes */

  .when('/cost_center', {
    controller: 'CostCenterController as CenterCtrl',
    templateUrl: 'partials/cost_center/cost_center.html'
  })
  .when('/cost_center/center', {
    controller: 'AnalysisCostCenterController as CenterCtrl',
    templateUrl: 'partials/cost_center/center/analysis_center.html'
  })
  .when('/cost_center/assigning', {
    controller: 'CostCenterAssignmentController',
    templateUrl: 'partials/cost_center/assigning/assigning.html'
  })
  .when('/cost_center/allocation', {
    controller: 'CostCenterAllocationController as CenterCtrl',
    templateUrl: 'partials/cost_center/allocation/allocation.html'
  })

  /* profit center routes */

  .when('/profit_center', {
    controller: 'ProfitCenterController as CenterCtrl',
    templateUrl: 'partials/profit_center/profit_center.html'
  })
  .when('/profit_center/center', {
    controller: 'AnalysisProfitCenterController as CenterCtrl',
    templateUrl: 'partials/profit_center/center/analysis.html'
  })
  .when('/profit_center/allocation', {
    controller: 'ProfitCenterAllocationController as ProfitCtrl',
    templateUrl: 'partials/profit_center/allocation/allocation.html'
  })

  /* patients routes */

  .when('/patients/register', {
    controller: 'PatientRegistrationController as PatientRegCtrl',
    templateUrl: 'partials/patients/registration/registration.html'
  })

  /* Patient Edit */
  .when('/patients/edit/', {
    controller  : 'PatientEditFind as PatientEditFindCtrl',
    templateUrl : 'partials/patients/edit/find.html'
  })
  .when('/patients/edit/:patientID', {
    controller: 'PatientEdit as PatientEditCtrl',
    templateUrl: 'partials/patients/edit/edit.html'
  })

  /* */
  .when('/patients/search/:patientID?', {
    controller: 'patientRecords',
    templateUrl: '/partials/patients/search/search.html'
  })
  .when('/patients/groups', {
    controller: 'patientGroup',
    templateUrl: 'partials/patients/groups/groups.html'
  })
  .when('/patients/groups/assignment', {
    controller: 'AssignPatientGroupController',
    templateUrl: 'partials/patients/groups/assignment.html'
  })
  .when('/patients/debtor', {
    controller : 'group.debtor.reassignment',
    templateUrl : 'partials/patients/debtor/swap.html'
  })

  /* primary cash routes */

  .when('/trialbalance/print', {
    controller : 'TrialBalancePrintController as PrintCtrl',
    templateUrl : 'partials/journal/trialbalance/print.html'
  })

  /* primary cash routes */

  .when('/primary_cash', {
    controller : 'PrimaryCashController as PrimaryCtrl',
    templateUrl : 'partials/primary_cash/primary.html'
  })
  .when('/primary_cash/:cashbox_id/transfer', {
    controller : 'PrimaryCashIncomeTransferController as TransferCtrl',
    templateUrl : 'partials/primary_cash/income/transfer/transfer.html'
  })
   .when('/primary_cash/:cashbox_id/convention', {
    controller : 'PrimaryCashConventionController as ConventionCtrl',
    templateUrl : 'partials/primary_cash/income/convention/convention.html'
  })
   .when('/primary_cash/:cashbox_id/support', {
    controller : 'PrimaryCashSupportController as SupportCtrl',
    templateUrl : 'partials/primary_cash/income/support/support.html'
  })
  .when('/primary_cash/:id/income/generic', {
    controller : 'PrimaryCashIncomeGenericController as GenericIncomeCtrl',
    templateUrl : 'partials/primary_cash/income/generic/generic.html'
  })
  .when('/primary_cash/:id/expense/generic', {
    controller : 'PrimaryCashExpenseGenericController as GenericExpenseCtrl',
    templateUrl: 'partials/primary_cash/expense/generic.html'
  })
  .when('/primary_cash/:cashbox/expense/purchase', {
    controller : 'PurchaseOrderCashController as PurchaseCtrl',
    templateUrl : 'partials/primary_cash/expense/purchase.html'
  })
  .when('/primary_cash/:cashbox/expense/payroll', {
    controller : 'payroll',
    templateUrl : 'partials/primary_cash/expense/payroll.html'
  })
  .when('/primary_cash/:cashbox/expense/refund', {
    controller : 'PrimaryCashReturnController as ReturnCtrl',
    templateUrl : 'partials/primary_cash/expense/cash_return.html'
  })
  .when('/primary_cash/expense/multi_payroll', {
    controller : 'MultiPayrollController as PayrollCtrl',
    templateUrl : 'partials/primary_cash/expense/multi_payroll.html'
  })
  .when('/primary_cash/:cashbox/expense/tax_payment', {
    controller : 'primary_cash.tax_payment',
    templateUrl : 'partials/primary_cash/expense/tax_payment.html'
  })
  .when('/primary_cash/:cashbox/expense/enterprise_tax_payment', {
    controller : 'primary_cash.enterprise_tax_payment',
    templateUrl : 'partials/primary_cash/expense/enterprise_tax_payment.html'
  })
  .when('/primary_cash/:cashbox/expense/cotisation_payment', {
    controller : 'primary_cash.cotisation_payment',
    templateUrl : 'partials/primary_cash/expense/cotisation_payment.html'
  })
  .when('/primary_cash/:cashbox/expense/salary_payment', {
    controller : 'primary_cash.salary_payment',
    templateUrl : 'partials/primary_cash/expense/salary_payment.html'
  })
  .when('/primary_cash/:cashbox/expense/partial_payment', {
    controller : 'primary_cash.partial_payment',
    templateUrl : 'partials/primary_cash/expense/partial_payment.html'
  })
  .when('/primary_cash/:cashbox/expense/payday_advance', {
    controller : 'primary_cash.payday_advance',
    templateUrl : 'partials/primary_cash/expense/payday_advance.html'
  })

  /* depot routes */

  .when('/depots', {
    controller : 'DepotController as DepotCtrl',
    templateUrl : 'partials/depots/depots.html'
  })
  .when('/depots/:depotId/entry', {
    controller : 'DepotEntryController',
    templateUrl : 'partials/depots/entry/entry.html'
  })
  .when('/depots/:depotId/losses', {
    controller : 'DepotLossController as LossCtrl',
    templateUrl : 'partials/depots/loss/loss.html'
  })
  .when('/depots/:depotId/movements', {
    controller : 'StockMovementController as MovementCtrl',
    templateUrl : 'partials/depots/movement/movement.html'
  })
  .when('/depots/:depotId/distributions/patients', {
    controller : 'StockDistributionsController as StockDistributionsCtrl',
    templateUrl : 'partials/depots/distributions/patients/patients.html'
  })
  .when('/depots/:depotId/distributions/services', {
    controller : 'StockServiceDistributionsController as DistributionsCtrl',
    templateUrl : 'partials/depots/distributions/services/services.html'
  })
  .when('/depots/:depotId/distributions/:consumptionId/cancel', {
    controller : 'DepotDistributionsCancelController as CancelCtrl',
    templateUrl : 'partials/depots/distributions/cancel/cancel.html'
  })
  .when('/depots/:depotId/integrations', {
    controller : 'stockIntegration as integrationCtrl',
    templateUrl : 'partials/stock/integration/integration.html'
  })
  .when('/depots/:uuid/search', {
    controller : 'DepotStockSearchController',
    templateUrl: 'partials/depots/stock_search/search.html'
  })
  .when('/depots/:depotId/reports/distributions/:type', {
    controller : 'DepotStockDistributionsController as DistributionsCtrl',
    templateUrl : 'partials/depots/reports/distributions/distributions.html'
  })
  .when('/stock/entry/report/:documentId?', {
    controller : 'stock.entry.report',
    templateUrl : 'partials/stock/entry/report.html'
  })

  // TODO -- these should probably have an /inventory/ or /depot/ prefix
  .when('/stock/count', {
    controller : 'stock.count',
    templateUrl : 'partials/stock/count/count.html'
  })
  .when('/stock/expiring/:depotId', {
    controller : 'stock.expiring',
    templateUrl : 'partials/stock/expiring/expiring.html'
  })

  /* donation routes */

  .when('/donors', {
    controller: 'DonorManagementController',
    templateUrl: '/partials/inventory/donors/donors.html'
  })
  .when('/donations/:depotId?', {
    controller : 'DonationManagementController as DonationCtrl',
    templateUrl : 'partials/donations/donations.html'
  })
  .when('/donations/confirm', {
    controller : 'ConfirmDonationController as ConfirmCtrl',
    templateUrl : 'partials/donations/confirm/confirm.html'
  })
  .when('/donations/report/:documentId', {
    controller : 'ReportDonationsController',
    templateUrl : 'partials/donations/report.html'
  })

  // TODO -- these should be namespaced/prefixed by depot
  .when('/stock/dashboard', {
    controller : 'StockDashboardController as StockDashCtrl',
    templateUrl : 'partials/stock/dashboard/dashboard.html'
  })
  .when('/stock/integration_confirm', {
    controller : 'ConfirmStockIntegrationController as ConfirmCtrl',
    templateUrl : 'partials/stock/integration/confirm_integration/confirm_integration.html'
  })

  /* snis routes */

  .when('/snis', {
    controller : 'SnisController',
    templateUrl : 'partials/snis/snis.html'
  })
  .when('/snis/create', {
    controller : 'SnisCreateController',
    templateUrl : 'partials/snis/create/create.html'
  })
  .when('/snis/update/:id', {
    controller : 'SnisUpdateController',
    templateUrl : 'partials/snis/update/update.html'
  })

  /* tax routes */

  .when('/taxes', {
    controller : 'TaxesController',
    templateUrl : 'partials/taxes/taxes.html'
  })
  .when('/taxes/create', {
    controller : 'CreateTaxController',
    templateUrl : 'partials/taxes/create/create.html'
  })
  .when('/taxes/ipr', {
    controller : 'taxes_management.ipr',
    templateUrl : 'partials/taxes/ipr/ipr.html'
  })
  .when('/taxes/config_tax', {
    controller : 'config_tax',
    templateUrl : 'partials/taxes/config/config.html'
  })

  /* cotisations management */

  .when('/cotisations_management', {
    controller : 'cotisations_management.menu',
    templateUrl : 'partials/cotisation/cotisation_management.html'
  })
  .when('/cotisations_management/create', {
    controller : 'cotisations_management.create',
    templateUrl : 'partials/cotisation/create/create_cotisation.html'
  })
  .when('/cotisations_management/config_cotisation', {
    controller : 'config_cotisation',
    templateUrl : 'partials/cotisation/config_cotisation/config_cotisation.html'
  })

  .when('/payment_period', {
    controller : 'PaymentPeriodController',
    templateUrl : 'partials/payroll/payment_period/payment_period.html'
  })

  .when('/rubric_management', {
    controller : 'rubric_management.menu',
    templateUrl : 'partials/payroll/rubrics/rubrics.html'
  })
  .when('/rubric_management/config_rubric', {
    controller : 'config_rubric',
    templateUrl : 'partials/payroll/rubrics/config_rubric/config_rubric.html'
  })
  .when('/rubric_management/rubriques_payroll', {
    controller : 'RubriquePayrollController as RubriqueCtrl',
    templateUrl : 'partials/payroll/rubrics/rubriques_payroll/rubriques_payroll.html'
  })

  /* cashbox routes */
  .when('/cashboxes', {
    controller : 'CashboxController as CashCtrl',
    templateUrl : 'partials/cash/cashboxes/cashboxes.html'
  })
  .when('/cashboxes/:uuid/currencies', {
    controller : 'cash.cashbox_account',
    templateUrl : 'partials/cash/cashboxes/currencies/currencies.html'
  })

  /* reports routes */

  .when('/reports/daily_consumption', {
    controller : 'ReportDailyConsumptionController as ReportCtrl',
    templateUrl : 'partials/reports/daily_consumption/daily_consumption.html'
  })
  .when('/reports/distributions', {
    controller : 'ReportDepotDistributionsController as ReportCtrl',
    templateUrl : 'partials/reports/distributions/distributions.html'
  })
  .when('/reports/finance', {
    controller: 'reportFinance',
    templateUrl: 'partials/reports/finance/finance_report.html'
  })
  .when('/reports/patient_registrations', {
    controller : 'reportPatientRegistrations',
    templateUrl : 'partials/reports/patient_registrations/patient_registrations.html'
  })
  .when('/reports/cash_payments', {
    controller: 'reportCashPayments',
    templateUrl: 'partials/reports/cash_payments/cash_payments.html'
  })
  .when('/reports/summary', {
    controller: 'summary',
    templateUrl: 'partials/reports/summary/summary.html'
  })
  .when('/reports/patient_group/:uuid', {
    controller : 'report.patientGroup',
    templateUrl : 'partials/reports/patient_group/patient_group.html'
  })
  .when('/reports/prices', {
    controller : 'report.prices',
    templateUrl : 'partials/reports/prices/prices.html'
  })
  .when('/reports/transactions/account', {
    controller : 'report.transactions.account',
    templateUrl : 'partials/reports/transactions/account.html'
  })
  .when('/reports/transaction_report', {
    controller: 'reportTransaction',
    templateUrl: 'partials/reports/transaction_report/transaction_report.html'
  })
  .when('/reports/patient_standing', {
    controller : 'reportPatientStanding',
    templateUrl : '/partials/reports/patient_standing/patient_standing.html'
  })
  .when('/reports/employee_standing', {
    controller : 'reportEmployeeStanding',
    templateUrl : '/partials/reports/employee_standing/employee_standing.html'
  })
  .when('/reports/ledger/general_ledger', {
    controller: 'reportGeneralLedger',
    templateUrl: '/partials/reports/ledger/general_ledger.html'
  })
  .when('/reports/payroll_report', {
    controller : 'payroll_report',
    templateUrl : 'partials/reports/payroll_report/payroll_report.html'
  })
  .when('/reports/operating_account', {
    controller : 'OperatingAccountController as OperatingCtrl',
    templateUrl : 'partials/reports/operating_account/operating_account.html'
  })
  .when('/reports/debtor_aging', {
    controller: 'reportDebitorAging',
    templateUrl: 'partials/reports/debtor_aging/debtor_aging.html'
  })
  .when('/reports/account_statement/:id?', {
    controller: 'accountStatement',
    templateUrl: 'partials/reports/account_statement/account_statement.html'
  })
  .when('/reports/income_expensive', {
    controller: 'reportIncomeExpensive',
    templateUrl: 'partials/reports/income_expensive/income_expensive.html'
  })
  .when('/reports/service_exploitation', {
    controller: 'report.service_exploitation',
    templateUrl: 'partials/reports/service_exploitation/service_exploitation.html'
  })
  .when('/reports/global_transaction', {
    controller: 'ReportGlobalTransactionController as ReportCtrl',
    templateUrl: 'partials/reports/global_transaction/global_transaction.html'
  })
  .when('/reports/balance_mensuelle', {
    controller: 'ReportBalanceMensuelleController as ReportCtrl',
    templateUrl: 'partials/reports/balance_mensuelle/balance_mensuelle.html'
  })
  .when('/reports/donation', {
    controller: 'ReportDonationController as ReportCtrl',
    templateUrl: 'partials/reports/donation/donation.html'
  })
  .when('/reports/chart_of_accounts', {
    controller: 'ReportChartOfAccountsController',
    templateUrl: 'partials/reports/chart_of_accounts/chart.html'
  })
  .when('/reports/all_transactions', {
    controller : 'allTransactions',
    templateUrl : 'partials/reports/all_transactions/all_transactions.html'
  })
  .when('/reports/expiring', {
    controller : 'ReportStockExpirationsController as ReportCtrl',
    templateUrl : 'partials/reports/expiring_stock/expiring_stock.html'
  })
  .when('/reports/stock_store/:depotId', {
    controller : 'stock_store',
    templateUrl : 'partials/reports/stock_store/stock_store.html'
  })
  .when('/reports/purchase_order', {
    controller : 'purchase_order',
    templateUrl : 'partials/reports/purchase_order/purchase_order.html'
  })
  .when('/reports/donation_confirmation', {
    controller : 'donation_confirmation',
    templateUrl : 'partials/reports/donation_confirmation/donation_confirmation.html'
  })
  .when('/reports/stock_integration', {
    controller : 'ReportStockIntegrationController as ReportCtrl',
    templateUrl : 'partials/reports/stock_integration/stock_integration.html'
  })
  .when('/reports/stock_movement', {
    controller : 'stock_movement',
    templateUrl : 'partials/reports/stock_movement/stock_movement.html'
  })
  .when('/reports/bilan', {
    controller : 'configureBilan',
    templateUrl : 'partials/reports_proposed/bilan/bilan.html'
  })
  .when('/reports/debitor_group_report', {
    controller : 'DebtorGroupReportController as debtorGroupReportCtrl',
    templateUrl : 'partials/reports_proposed/debitor_group_report/debitor_group_report.html'
  })
  .when('/reports/result_account', {
    controller : 'configureResult',
    templateUrl : 'partials/reports_proposed/result_account/result_account.html'
  })
  .when('/reports/balance', {
    controller : 'configureBalance',
    templateUrl : 'partials/reports_proposed/balance/balance.html'
  })
  .when('/reports/debtorgroup/annual', {
    controller : 'DebtorGroupAnnualReportController as AnnualCtrl',
    templateUrl : 'partials/reports_proposed/debtor_group/annual.html'
  })
  .when('/reports/grand_livre', {
    controller : 'configureGrandLivre',
    templateUrl : 'partials/reports_proposed/grand_livre/grand_livre.html'
  })
  .when('/reports/employee_state', {
    controller : 'configureEmployeeState',
    templateUrl : 'partials/reports_proposed/employee_state/employee_state.html'
  })
  .when('/reports/cotisation_payment', {
    controller : 'cotisation_payment',
    templateUrl : 'partials/reports/cotisation_payment/cotisation_payment.html'
  })
  .when('/reports/salary_payment', {
    controller : 'salary_payment',
    templateUrl : 'partials/reports/salary_payment/salary_payment.html'
  })
  .when('/reports/taxes_payment', {
    controller : 'taxes_payment',
    templateUrl : 'partials/reports/taxes_payment/taxes_payment.html'
  })
  .when('/reports/stock_status', {
    controller : 'StockStatusReportController as StatusCtrl',
    templateUrl : 'partials/reports/stock_status/stock_status.html'
  })
  .when('/reports/loss_record', {
    controller : 'loss_record',
    templateUrl : 'partials/reports/loss_record/loss_record.html'
  })
  .when('/reports/income_report', {
    controller : 'primary_cash.incomeReport',
    templateUrl : 'partials/reports/primary_cash/income/income_report.html'
  })
  .when('/reports/expense_report', {
    controller : 'primary_cash.expenseReport',
    templateUrl : 'partials/reports/primary_cash/expense/expense_report.html'
  })
  .when('/reports/cash_flow/', {
    controller : 'cashFlowReportController as ReportCtrl',
    templateUrl : 'partials/reports/cash_flow/cash_flow.html'
  })
  .when('/reports/stock_report', {
    controller : 'stock_report',
    templateUrl : 'partials/reports/stock/stock_report.html'
  })
  .when('/reports/patient_visit_status', {
    controller : 'ReportPatientVisitStatus',
    templateUrl : '/partials/reports/patient_visit_status/patient_visit_status.html'
  })
  .when('/reports/stock_entry', {
    controller : 'ReportStockEntryController',
    templateUrl : 'partials/reports/stock/stock_entry/stock_entry.html'
  })
  .otherwise({ redirectTo : '/' });
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
  $rootScope.$on('$routeChangeStart', function (event, next) {
    if (!SessionService.user) {
      $location.url('/login');
    }
  });

  // TODO Hardcoded default translation/ localisation
  amMoment.changeLocale('fr');
}

// set the proper key prifix
function localStorageConfig($localStorageProvider) {
  var PREFIX = 'bhima-';
  $localStorageProvider.setKeyPrefix(PREFIX);
}

// configuration
bhima.config(['$routeProvider', bhimaconfig]);
bhima.config(['$translateProvider', translateConfig]);
bhima.config(['tmhDynamicLocaleProvider', localeConfig]);
bhima.config(['$httpProvider', authConfig]);
bhima.config(['$localStorageProvider', localStorageConfig]);

// run
bhima.run(['$rootScope', '$location', 'SessionService', 'amMoment', startupConfig]);
