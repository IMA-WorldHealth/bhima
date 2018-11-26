-- core tables that drive system configuration - these configurations could
-- be overriden by individual enterprises however these are the defaults
-- set variables
SET foreign_key_checks = 0;

SET names 'utf8mb4';
SET character_set_database = 'utf8mb4';
SET collation_database = 'utf8mb4_unicode_ci';
SET CHARACTER SET utf8mb4, CHARACTER_SET_CONNECTION = utf8mb4;

-- units
INSERT INTO unit VALUES
  (0, 'Root', 'TREE.ROOT', 'The unseen root node', NULL, '/modules/index.html', '/root', NULL),
  (1, 'Admin', 'TREE.ADMIN', 'The Administration Super-Category', 0, '/modules/admin/index.html', '/ADMIN_FOLDER', NULL),
  (2, 'Enterprise', 'TREE.ENTERPRISE', 'Manage the registered enterprises from here', 1, '/modules/enterprise/', '/enterprises', 'enterprises'),
  (3, 'Invoice Registry', 'TREE.INVOICE_REGISTRY', 'Invoice Registry', 5, '/modules/invoices/registry/', '/invoices', 'invoiceRegistry'),
  (4, 'Users & Permissions', 'TREE.USERS', 'Manage user privileges and permissions', 1, '/modules/users/', '/users', 'users'),
  (5, 'Finance', 'TREE.FINANCE', 'The Finance Super-Category', 0, '/modules/finance/', '/FINANCE_FOLDER', NULL),
  (6, 'Account', 'TREE.ACCOUNT', 'Chart of Accounts management', 5, '/modules/accounts/', '/accounts', 'accounts'),
  (9, 'Posting Journal', 'TREE.POSTING_JOURNAL', 'Daily Log', 5, '/modules/journal/', '/journal', 'journal'),
  (10, 'General Ledger', 'TREE.GENERAL_LEDGER', 'Posted Journal Data', 5, '/modules/general_ledger/', '/general_ledger', 'generalLedger'),
  (12, 'Hospital', 'TREE.HOSPITAL', 'The Hospital Super-Category', 0, '/modules/hospital/index.html', '/HOSPITAL_FOLDER', NULL),
  (13, 'Fiscal Year', 'TREE.FISCAL_YEAR', 'Fiscal year configuration page', 5, '/modules/fiscal/', '/fiscal', 'fiscal'),
  (14, 'Patient Registration', 'TREE.PATIENT_REGISTRATION', 'Register patients', 12, '/modules/patient/register/', '/patients/register', 'patientsRegister'),
  (15, 'Patient Registry', 'TREE.PATIENT_REGISTRY', 'Patient Registry', 12, '/modules/patients/registry/', '/patients', 'patientRegistry'),
  (16, 'Patient Invoice', 'TREE.PATIENT_INVOICE', 'Create an invoice for a patient', 5, '/modules/patient_invoice/', '/invoices/patient', 'patientInvoice'),
  (18, 'Cash Window', 'TREE.CASH_WINDOW', 'Cash payments against past or future invoices', 5, '/modules/cash/', '/cash', 'cash'),
  (19, 'Register Supplier', 'TREE.REGISTER_SUPPLIER', '', 1, '/modules/suppliers/', '/suppliers', 'suppliers'),
  (20, 'Depot Management', 'TREE.DEPOTS', '', 0, '/modules/depots/', '/DEPOT_FOLDER', NULL),
  (21, 'Price List', 'TREE.PRICE_LIST', 'Configure price lists!', 1, '/modules/prices/', '/prices', 'prices'),
  (26, 'Location Manager', 'TREE.LOCATION', '', 1, '/modules/locations/locations.html', '/locations', 'locations'),
  (29, 'Patient Group', 'TREE.PATIENT_GRP', '', 1, '/modules/patients/groups/', '/patients/groups', 'patientGroups'),
  (48, 'Service Management', 'TREE.SERVICE', '', 1, 'modules/services/', '/services', 'services'),
  (57, 'Humans Ressources', 'TREE.HUMANS_RESSOURCES', '', 0, 'modules/payroll/', '/PAYROLL_FOLDER', NULL),
  (61, 'Employee', 'TREE.EMPLOYEE', 'Employees Registration', 57, 'modules/employees/register/', '/employees/register', 'employeeRegister'),
  (62, 'Employee Registry', 'TREE.EMPLOYEE_REGISTRY', 'Employee Registry', 57, '/modules/payroll/registry/', '/employees', 'employeeRegistry'),
  (82, 'Subsidies', 'TREE.SUBSIDY', 'Handles the subsidy situation', 1, '/modules/subsidies/', '/subsidies', 'subsidies'),
  (105, 'Cashbox Management', 'TREE.CASHBOX_MANAGEMENT', '', 1, '/modules/cash/cashbox/', '/cashboxes', 'cashboxes'),
  (107, 'Debtor Groups Management', 'TREE.DEBTOR_GROUP', 'Debtor Groups Management module', 1, '/modules/debtors/groups/', '/debtors/groups', 'debtorGroups'),
  (134, 'Simple Journal Vouchers', 'TREE.SIMPLE_VOUCHER', 'Creates a simple transfer slip between two accounts', 5, '/modules/vouchers/simple', '/vouchers/simple', 'simpleVouchers'),
  (135, 'Invoicing Fee', 'TREE.INVOICING_FEES', 'Configures invoicing Fee for bhima', 1, '/modules/invoicing_fees', '/invoicing_fees', 'invoicingFees'),
  (137, 'Complex Journal Vouchers', 'TREE.COMPLEX_JOURNAL_VOUCHER', 'Complex Journal vouchers module', 5, '/modules/vouchers/complex', '/vouchers/complex', 'vouchersComplex'),
  (138, 'Inventory Module', 'TREE.INVENTORY', 'Inventory management module', 0, '/modules/inventory/index', '/INVENTORY_FOLDER', NULL),
  (139, 'Inventory Registry', 'TREE.INVENTORY_REGISTRY', 'Inventory Registry module', 138, '/modules/inventory/list', '/inventory', 'inventory'),
  (140, 'Inventory Configurations', 'TREE.INVENTORY_CONFIGURATION', 'Inventory configuration module', 138, '/modules/inventory/configuration', '/inventory/configuration', 'inventoryConfiguration'),
  (141, 'Vouchers Records', 'TREE.VOUCHER_REGISTRY', 'Vouchers registry module', 5, '/modules/vouchers/index', '/vouchers', 'vouchers'),
  (143, 'Transaction Type Module', 'TREE.TRANSACTION_TYPE', 'This module is responsible for managing transaction type', 1, '/modules/transaction-type', '/transaction_type', 'transactionType'),
  (144, 'Reports (Finance)', 'TREE.REPORTS', 'A folder holding all finance reports', 0, '/modules/finance/reports', '/finance/REPORT_FOLDER', NULL),
  (145, 'Cashflow', 'TREE.CASHFLOW', 'The Cashflow Report', 144, '/modules/reports/cashflow', '/reports/cashflow', 'reportsBase.cashflow'),
  (146, 'Creditor Groups Management', 'TREE.CREDITOR_GROUP', 'Creditor Groups Management module', 1, '/modules/creditor-groups/', '/creditors/groups', 'creditorGroups'),
  (147, 'Cash Payment Registry', 'TREE.CASH_PAYMENT_REGISTRY', 'Cash Payment Registry', 5, '/modules/cash/payments/registry', '/payments', 'cashRegistry'),
  (149, 'Cash Report', 'TREE.CASH_REPORT', 'The Report of cash entry and exit', 144, '/modules/reports/cash_report', '/reports/cash_report', 'reportsBase.cash_report'),
  (150, 'Balance Report', 'TREE.BALANCE_REPORT', 'Balance report module', 144, '/modules/reports/balance_report', '/reports/balance_report', 'reportsBase.balance_report'),
  (151, 'Customer Debts', 'TREE.AGED_DEBTORS', 'Aged Debtors', 144, '/modules/reports/aged_debtors', '/reports/aged_debtors', 'reportsBase.aged_debtors'),
  (152, 'Account report', 'TREE.REPORT_ACCOUNTS', 'The Report accounts', 144, '/modules/reports/account_report', '/reports/account_report', 'reportsBase.account_report'),
  (153, 'Report Cashflow by Service', 'TREE.CASHFLOW_BY_SERVICE', 'CashflowByService', 144, '/modules/reports/cashflowByService', '/reports/cashflowByService', 'reportsBase.cashflowByService'),
  (154, 'Purchase Order', 'TREE.PURCHASE_ORDER', 'Purchase order folder', 0, '/modules/purchase_order', '/PURCHASE_FOLDER', NULL),
  (155, 'Purchase', 'TREE.PURCHASE', 'The purchase module', 154, '/modules/purchase_order/purchase', '/purchases/create', 'purchasesCreate'),
  (156, 'Purchase Registry', 'TREE.PURCHASE_REGISTRY', 'The purchase registry', 154, '/modules/purchase_order/registry', '/purchases', 'purchasesList'),
  (157, 'Open Debtors', 'REPORT.OPEN_DEBTORS.TREE', 'Open Debtors', 144, '/modules/finance/open_debtors', '/reports/open_debtors', 'reportsBase.open_debtors'),
  (159, 'Clients report', 'REPORT.CLIENTS_REPORT.TITLE', 'The Client report', 144, '/modules/reports/clients_report', '/reports/clients_report', 'reportsBase.clients_report'),
  (160, 'Stock', 'TREE.STOCK', 'The stock management module', 0, '/modules/stock', '/STOCK_FOLDER', NULL),
  (161, 'Stock Lots', 'TREE.STOCK_LOTS', 'The stock lots registry', 160, '/modules/stock/lots', '/stock/lots', 'stockLots'),
  (162, 'Stock Movements', 'TREE.STOCK_MOVEMENTS', 'The stock lots movements registry', 160, '/modules/stock/movements', '/stock/movements', 'stockMovements'),
  (163, 'Stock Inventory', 'TREE.STOCK_INVENTORY', 'The stock inventory registry', 160, '/modules/stock/inventories', '/stock/inventories', 'stockInventories'),
  (164, 'Stock Exit', 'STOCK.EXIT', 'The stock exit module', 160, '/modules/stock/exit', '/stock/exit', 'stockExit'),
  (165, 'Stock Entry', 'STOCK.ENTRY', 'The stock entry module', 160, '/modules/stock/entry', '/stock/entry', 'stockEntry'),
  (167, 'Stock Adjustment', 'STOCK.ADJUSTMENT', 'The stock adjustment module', 160, '/modules/stock/adjustment', '/stock/adjustment', 'stockAdjustment'),
  (168, 'Aged Creditors', 'TREE.AGED_CREDITORS', 'Aged Creditors', 144, '/modules/reports/aged_creditors', '/reports/aged_creditors', 'reportsBase.aged_creditors'),
  (170, 'Account Statement', 'TREE.ACCOUNT_STATEMENT', 'Account Statement Module', 5, '/modules/account_statement/', '/account_statement', 'accountStatement'),
  (171, 'Balance Sheet Statement', 'TREE.BALANCE_SHEET', 'Balance Sheet Module', 144, '/modules/reports/balance_sheet_report/', '/reports/balance_sheet_report', 'reportsBase.balance_sheet_report'),
  (180, 'Income Expenses', 'TREE.INCOME_EXPENSE', 'The Report of income and expenses', 144, '/modules/finance/income_expense', '/reports/income_expense', 'reportsBase.income_expense'),
  (181, 'Stock Report', 'TREE.STOCK_REPORT', 'The Report of inventories in stock', 144, '/modules/reports/inventory_report', '/reports/inventory_report', 'reportsBase.inventory_report'),
  (182, 'Stock File Report', 'TREE.STOCK_INVENTORY_REPORT', 'The Report of an inventory in stock', 144, '/modules/reports/inventory_file', '/reports/inventory_file', 'reportsBase.inventory_file'),
  (183, 'Grade Management', 'TREE.GRADES', '', 57, '/modules/grades/', '/grades', 'grades'),
  (184, 'Job Title Management', 'TREE.PROFESSION', '', 57, '/modules/functions/', '/functions', 'functions'),
  (185, 'Payroll Rubric Management', 'TREE.PAYROLL_RUB_MANAGEMENT', '', 57, '/modules/payroll/rubrics', '/payroll/rubrics', 'rubrics'),
  (186, 'Holidays Management', 'TREE.HOLIDAYS_MANAGEMENT', 'Holidays Management', 57, '/modules/holidays/', '/holidays', 'holidays'),
  (187, 'Offdays Management', 'TREE.OFFDAYS_MANAGEMENT', 'Offdays Management', 57, '/modules/offdays/', '/offdays', 'offdays'),
  (188, 'Tax IPR Management', 'TREE.IPR_MANAGEMENT', 'IPR Management', 57, '/modules/ipr_tax/', '/ipr_tax', 'ipr_tax'),
  (189, 'IPR Tax Configuration', 'TREE.IPR_TAX_CONFIGURATION', 'IPR Tax Configuration', 57, '/modules/ipr_tax/configuration', '/ipr_tax/configuration', 'iprConfiguration'),
  (190, 'Payroll Rubric Configuration', 'TREE.PAYROLL_RUB_CONFIGURATION', '', 57, '/modules/payroll/rubric_configuration', '/payroll/rubric_configuration', 'configurationRubric'),
  (191, 'Account Configuration', 'TREE.PAYROLL_ACCOUNT_CONFIGURATION', 'Account Configuration', 57, '/modules/payroll/account_configuration', '/payroll/account_configuration', 'configurationAccount'),
  (192, 'Operating report', 'TREE.OPERATING_ACCOUNT', 'The Report of operating', 144, '/modules/reports/operating', '/reports/operating', 'reportsBase.operating'),
  (193, 'Weekend Configuration', 'TREE.WEEKEND_CONFIGURATION', 'Weekend Configuration', 57, '/modules/payroll/weekend_configuration', '/payroll/weekend_configuration', 'configurationWeekEnd'),
  (194, 'Payroll Configuration', 'TREE.PAYROLL_CONFIGURATION', 'Payroll Configuration', 57, '/modules/payroll', '/payroll', 'payroll'),
  (195, 'Role management', 'TREE.ROLE_MANAGEMENT', 'Roles Management', 1, '/modules/role/', '/roles', 'roles'),
  (196, 'Depot Registry', 'TREE.DEPOTS_REGISTRY', '', 20, '/modules/depots/', '/depots', 'depots'),
  (197, 'Stock Exit Report', 'TREE.STOCK_EXIT_REPORT', 'Stock Exit Report', 144, '/modules/reports/generated/stock_exit', '/reports/stock_exit', 'reportsBase.stock_exit'),
  (199, 'Client Debtor Account Balance', 'REPORT.CLIENT_DEBTOR_ACCOUNT_BALANCE_REPORT', 'Client Debtor Account Balance', 144, '/modules/reports/debtor_accounts_balance', '/reports/debtorBalanceReport', 'reportsBase.debtorBalanceReport'),
  (200, 'Multiple Payroll', 'TREE.MULTI_PAYROLL', 'Multiple Payroll', 57, '/modules/multiple_payroll', '/multiple_payroll', 'multiple_payroll'),
  (201, 'Employee Standing Report', 'TREE.EMPLOYEE_STANDING_REPORT', 'Employee Standing Report', 144, '/modules/reports/employeeStanding', '/reports/employeeStanding', 'reportsBase.employeeStanding'),
  (202, 'Patient Standing Report', 'TREE.PATIENT_STANDING_REPORT', 'Patient Standing Report', 144, '/modules/reports/patientStanding', '/reports/patientStanding', 'reportsBase.patientStanding'),
  (203, 'Employees Configuration', 'TREE.PAYROLL_EMP_CONFIGURATION', '', 57, '/modules/payroll/employee_configuration', '/payroll/employee_configuration', 'configurationEmployee'),
  (204, 'Exchange Rate', 'TREE.EXCHANGE', '', 1, '/modules/exchange/exchange', '/exchange', 'exchange'),
  (205, 'Account Reference Management', 'TREE.ACCOUNT_REFERENCE_MANAGEMENT', '', 1, '/modules/account_reference', '/account_reference', 'account_reference'),
  (206, '[OHADA] Bilan', 'TREE.OHADA_BALANCE_SHEET', '', 144, '/modules/reports/ohada_balance_sheet_report', '/reports/ohada_balance_sheet_report', 'reportsBase.ohada_balance_sheet_report'),
  (207, 'Account Reference Report', 'TREE.ACCOUNT_REFERENCE_REPORT', '', 144, '/modules/reports/account_reference', '/reports/account_reference', 'reportsBase.account_reference'),
  (208, 'Import Stock From File', 'TREE.IMPORT_STOCK_FROM_FILE', '', 160, '/modules/stock/import', '/stock/import', 'stockImport'),
  (209, 'Accounts Report Multiple', 'TREE.REPORTS_MULTIPLE_ACCOUNTS', '', 144, '/modules/reports/account_report_multiple', '/reports/account_report_multiple', 'reportsBase.account_report_multiple'),
  (210, 'Unbalanced Invoice Payments', 'REPORT.UNBALANCED_INVOICE_PAYMENTS_REPORT.TITLE', '', 144, '/modules/reports/unbalanced_invoice_payments_report', '/reports/unbalanced_invoice_payments_report', 'reportsBase.unbalanced_invoice_payments_report'),
  (211, 'Income Expenses by Month', 'TREE.INCOME_EXPENSE_BY_MONTH', 'The Report of income and expenses', 144, '/modules/finance/income_expense_by_month', '/reports/income_expense_by_month', 'reportsBase.income_expense_by_month'),
  (212, 'Entity Management', 'ENTITY.MANAGEMENT', '', 1, '/modules/entities', '/entities', 'entities'),
  (213, 'Stock value Report', 'TREE.STOCK_VALUE', '', 144, '/modules/reports/stock_value', '/reports/stock_value', 'reportsBase.stock_value'),
  (214, '[OHADA] Compte de resultat', 'TREE.OHADA_RESULT_ACCOUNT', '', 144, '/modules/reports/ohada_profit_loss', '/reports/ohada_profit_loss', 'reportsBase.ohada_profit_loss'),
  (215, 'Department management', 'TREE.DEPARTMENT_MANAGEMENT', 'Department Management', 1, '/modules/department/', '/departments', 'departments'),
  (216, 'Income Expenses by Year', 'TREE.INCOME_EXPENSE_BY_YEAR', 'The Report of income and expenses', 144, '/modules/finance/income_expense_by_year', '/reports/income_expense_by_year', 'reportsBase.income_expense_by_year'),
  (217, 'Tags', 'TREE.TAGS', '', 1, '/modules/tags/tags', '/tags', 'tags'),
  (218, 'Fee Center Management','TREE.FEE_CENTER_MANAGEMENT','', 0,'/modules/fee_center','/fee_center', NULL),
  (219, 'Fee Center Management','TREE.FEE_CENTER','', 218,'/modules/fee_center','/fee_center', 'fee_center'),
  (220, 'Distributions fees Centers','TREE.DITRIBUTION_AUX_FEES_CENTERS','', 218,'/modules/distribution_center','/distribution_center', 'distribution_center'),
  (221, 'Update Distributions','TREE.UPDATE_DISTRIBUTION','', 218,'/modules/distribution_center/update','/distribution_center/update', 'update_distribution_center'),
  (222, 'Fee Center Report', 'TREE.FEE_CENTER_REPORT', 'Fee Center Report', 144, '/modules/reports/feeCenter', '/reports/feeCenter', 'reportsBase.fee_center'), 
  (223, 'Distribution keys', 'TREE.DISTRIBUTION_KEYS', 'Distribution keys', 218, '/modules/distribution_center/distribution_key', '/distribution_center/distribution_key', 'distribution_key'); 

-- Reserved system account type
INSERT INTO `account_category` VALUES
  (1, 'income', 'ACCOUNT.TYPES.INCOME'),
  (2, 'expense', 'ACCOUNT.TYPES.EXPENSE'),
  (3, 'balance', 'ACCOUNT.TYPES.BALANCE'),
  (4, 'title', 'ACCOUNT.TYPES.TITLE');

-- Reserved system account category
INSERT INTO `account_type` VALUES
  (1, 'asset', 'ACCOUNT.TYPES.ASSET', 3),
  (2, 'liability', 'ACCOUNT.TYPES.LIABILITY', 3),
  (3, 'equity', 'ACCOUNT.TYPES.EQUITY', 3),
  (4, 'income', 'ACCOUNT.TYPES.INCOME', 1),
  (5, 'expense', 'ACCOUNT.TYPES.EXPENSE', 2),
  (6, 'title', 'ACCOUNT.TYPES.TITLE', 4);

-- core BHIMA reports
INSERT INTO `report` (`id`, `report_key`, `title_key`) VALUES
  (1, 'cashflow', 'TREE.CASHFLOW'),
  (2, 'accounts_chart', 'REPORT.CHART_OF_ACCOUNTS'),
  (3, 'income_expense', 'REPORT.INCOME_EXPENSE'),
  (4, 'balance_report', 'REPORT.BALANCE'),
  (5, 'aged_debtors', 'TREE.AGED_DEBTORS'),
  (6, 'account_report', 'REPORT.REPORT_ACCOUNTS.TITLE'),
  (7, 'cashflowByService', 'TREE.CASHFLOW_BY_SERVICE'),
  (8, 'open_debtors', 'REPORT.OPEN_DEBTORS.TITLE'),
  (9, 'clients_report','REPORT.CLIENTS'),
  (10, 'aged_creditors','TREE.AGED_CREDITORS'),
  (11, 'balance_sheet_report', 'REPORT.BALANCE_SHEET.TITLE'),
  (12, 'cash_report', 'REPORT.CASH_REPORT.TITLE'),
  (13, 'inventory_report', 'REPORT.STOCK.TITLE'),
  (14, 'inventory_file', 'REPORT.STOCK.INVENTORY_REPORT'),
  (15, 'operating', 'TREE.OPERATING_ACCOUNT'),
  (16, 'stock_exit', 'REPORT.STOCK.EXIT_REPORT'),
  (17, 'debtorBalanceReport', 'REPORT.CLIENT_DEBTOR_ACCOUNT_BALANCE_REPORT'),
  (18, 'employeeStanding', 'REPORT.EMPLOYEE_STANDING.TITLE'),
  (19, 'patientStanding', 'REPORT.PATIENT_STANDING.TITLE'),
  (20, 'ohada_balance_sheet_report', 'REPORT.OHADA.BALANCE_SHEET'),
  (21, 'account_reference', 'REPORT.ACCOUNT_REFERENCE.TITLE'),
  (22, 'account_report_multiple', 'REPORT.REPORT_ACCOUNTS_MULTIPLE.TITLE'),
  (23, 'unbalanced_invoice_payments_report', 'REPORT.UNBALANCED_INVOICE_PAYMENTS_REPORT.TITLE'),
  (24, 'income_expense_by_month', 'REPORT.INCOME_EXPENSE_BY_MONTH'),
  (25, 'stock_value', 'TREE.STOCK_VALUE'),
  (26, 'ohada_profit_loss', 'TREE.OHADA_RESULT_ACCOUNT'),
  (27, 'income_expense_by_year', 'REPORT.INCOME_EXPENSE_BY_YEAR'),
  (28, 'feeCenter', 'REPORT.FEE_CENTER.TITLE');

-- Supported Languages
INSERT INTO `language` VALUES
  (1,'Francais','fr', 'fr-be'),
  (2,'English','en', 'en-us');

-- Currencies
INSERT INTO `currency` (`id`, `name`, `format_key`, `symbol`, `note`, `min_monentary_unit`) VALUES
  (1,'Congolese Francs','fc','Fc',NULL,50.00),
  (2,'United States Dollars','usd','$',NULL,0.01);

INSERT INTO `inventory_type` VALUES (1,'Article'),(2,'Assembly'),(3,'Service');
INSERT INTO `inventory_unit` VALUES (1,'Act', 'Act'),(2,'Pal', 'Pallet'),(3,'Pill', 'Pillule'),(4,'Box', 'Box'),(5,'Lot', 'Lot'),(6,'amp', 'ampoule'),(7,'bags', 'bags'),(8,'btl', 'bouteille'),(9,'cap', 'capsule'),(10,'flc', 'flacon'),(11,'jar', 'jar'),(12,'ltr', 'littre'),(13,'pce', 'piece'),(14,'sch', 'sachet'),(15,'tab', 'tablette'),(16,'tub', 'tube'),(17,'vial', 'vial');

-- fonctions
INSERT INTO `fonction` VALUES
  (1,'Infirmier'),
  (2,'Medecin Directeur');

-- transaction type
INSERT INTO `transaction_type` (`id`, `text`, `type`, `fixed`) VALUES
  (1, 'VOUCHERS.SIMPLE.GENERIC_INCOME', 'income', 1),
  (2, 'VOUCHERS.SIMPLE.CASH_PAYMENT', 'income', 1),
  (3, 'VOUCHERS.SIMPLE.CONVENTION_PAYMENT', 'income', 1),
  (4, 'VOUCHERS.SIMPLE.SUPPORT_INCOME', 'income', 1),
  (5, 'VOUCHERS.SIMPLE.TRANSFER', 'other',  1),
  (6, 'VOUCHERS.SIMPLE.GENERIC_EXPENSE', 'expense', 1),
  (7, 'VOUCHERS.SIMPLE.SALARY_PAYMENT', 'expense', 1),
  (8, 'VOUCHERS.SIMPLE.CASH_RETURN', 'expense',  1),
  (9, 'VOUCHERS.SIMPLE.PURCHASES', 'expense',  1),
  (10,'VOUCHERS.SIMPLE.CREDIT_NOTE', 'other', 1),
  (11,'VOUCHERS.SIMPLE.INVOICING', 'income', 1),
  (12, 'VOUCHERS.SIMPLE.STOCK_INTEGRATION', 'other', 1),
  (13, 'VOUCHERS.SIMPLE.STOCK_EXIT', 'other', 1),
  (14, 'VOUCHERS.SIMPLE.STOCK_ENTRY', 'other', 1),
  (15, 'VOUCHERS.SIMPLE.COMMITMENT', 'other', 1),
  (16, 'VOUCHERS.SIMPLE.EMPLOYEE_WITHHOLDINGS', 'other', 1),
  (17, 'VOUCHERS.SIMPLE.CHARGE_REMUNERATION', 'other', 1),
  (18, 'VOUCHERS.SIMPLE.ADJUSTMENT', 'other', 1),
  (19, 'VOUCHERS.SIMPLE.CAUTION_LINK', 'other', 1);

-- Stock Movement Flux
INSERT INTO `flux` VALUES
  (1,  'STOCK_FLUX.FROM_PURCHASE'),
  (2,  'STOCK_FLUX.FROM_OTHER_DEPOT'),
  (3,  'STOCK_FLUX.FROM_ADJUSTMENT'),
  (4,  'STOCK_FLUX.FROM_PATIENT'),
  (5,  'STOCK_FLUX.FROM_SERVICE'),
  (6,  'STOCK_FLUX.FROM_DONATION'),
  (7,  'STOCK_FLUX.FROM_LOSS'),
  (8,  'STOCK_FLUX.TO_OTHER_DEPOT'),
  (9,  'STOCK_FLUX.TO_PATIENT'),
  (10, 'STOCK_FLUX.TO_SERVICE'),
  (11, 'STOCK_FLUX.TO_LOSS'),
  (12, 'STOCK_FLUX.TO_ADJUSTMENT'),
  (13, 'STOCK_FLUX.FROM_INTEGRATION');

-- Roles Actions

INSERT INTO `actions`(`id`, `description`) VALUES
  (1, 'FORM.LABELS.CAN_EDIT_ROLES');

-- Purchase Status
INSERT INTO `purchase_status` (`id`, `text`) VALUES
  (1,  'PURCHASES.STATUS.WAITING_CONFIRMATION'),
  (2,  'PURCHASES.STATUS.CONFIRMED'),
  (3,  'PURCHASES.STATUS.RECEIVED'),
  (4,  'PURCHASES.STATUS.PARTIALLY_RECEIVED'),
  (5,  'PURCHASES.STATUS.CANCELLED'),
  (6,  'PURCHASES.STATUS.EXCESSIVE_RECEIVED_QUANTITY');

-- Paiement Status
INSERT INTO `paiement_status` (`id`, `text`) VALUES
  (1,  'PAYROLL_STATUS.WAITING_FOR_CONFIGURATION'),
  (2,  'PAYROLL_STATUS.CONFIGURED'),
  (3,  'PAYROLL_STATUS.WAITING_FOR_PAYMENT'),
  (4,  'PAYROLL_STATUS.PARTIALLY_PAID'),
  (5,  'PAYROLL_STATUS.PAID');

-- locations (default enterprise location only)
INSERT INTO `country` VALUES (HUID('dbe330b6-5cde-4830-8c30-dc00eccd1a5f'),'République Démocratique du Congo');
INSERT INTO `province`(`uuid`, `name`, `country_uuid`)
VALUES (HUID(UUID()), 'Bas-Uele', HUID('dbe330b6-5cde-4830-8c30-dc00eccd1a5f')),
  (HUID(UUID()), 'Équateur', HUID('dbe330b6-5cde-4830-8c30-dc00eccd1a5f')),
  (HUID(UUID()), 'Haut-Katanga', HUID('dbe330b6-5cde-4830-8c30-dc00eccd1a5f')),
  (HUID(UUID()), 'Haut-Lomami', HUID('dbe330b6-5cde-4830-8c30-dc00eccd1a5f')),
  (HUID(UUID()), 'Ituri', HUID('dbe330b6-5cde-4830-8c30-dc00eccd1a5f')),
  (HUID(UUID()), 'Kasaï', HUID('dbe330b6-5cde-4830-8c30-dc00eccd1a5f')),
  (HUID(UUID()), 'Kasaï-Central', HUID('dbe330b6-5cde-4830-8c30-dc00eccd1a5f')),
  (HUID(UUID()), 'Kasaï-Oriental', HUID('dbe330b6-5cde-4830-8c30-dc00eccd1a5f')),
  (HUID('f6fc7469-7e58-45cb-b87c-f08af93edade'),'Kinshasa', HUID('dbe330b6-5cde-4830-8c30-dc00eccd1a5f')),
  (HUID(UUID()), 'Kongo-Centra', HUID('dbe330b6-5cde-4830-8c30-dc00eccd1a5f')),
  (HUID(UUID()), 'Kwango', HUID('dbe330b6-5cde-4830-8c30-dc00eccd1a5f')),
  (HUID(UUID()), 'Kwilu', HUID('dbe330b6-5cde-4830-8c30-dc00eccd1a5f')),
  (HUID(UUID()), 'Lomami', HUID('dbe330b6-5cde-4830-8c30-dc00eccd1a5f')),
  (HUID(UUID()), 'Lualaba', HUID('dbe330b6-5cde-4830-8c30-dc00eccd1a5f')),
  (HUID(UUID()), 'Mai-Ndombe', HUID('dbe330b6-5cde-4830-8c30-dc00eccd1a5f')),
  (HUID(UUID()), 'Maniema', HUID('dbe330b6-5cde-4830-8c30-dc00eccd1a5f')),
  (HUID(UUID()), 'Mongala', HUID('dbe330b6-5cde-4830-8c30-dc00eccd1a5f')),
  (HUID(UUID()), 'Nord-Kivu', HUID('dbe330b6-5cde-4830-8c30-dc00eccd1a5f')),
  (HUID(UUID()), 'Nord-Ubangi', HUID('dbe330b6-5cde-4830-8c30-dc00eccd1a5f')),
  (HUID(UUID()), 'Sankuru', HUID('dbe330b6-5cde-4830-8c30-dc00eccd1a5f')),
  (HUID(UUID()), 'Sud-Kivu', HUID('dbe330b6-5cde-4830-8c30-dc00eccd1a5f')),
  (HUID(UUID()), 'Sud-Ubangi', HUID('dbe330b6-5cde-4830-8c30-dc00eccd1a5f')),
  (HUID(UUID()), 'Tanganyika', HUID('dbe330b6-5cde-4830-8c30-dc00eccd1a5f')),
  (HUID(UUID()), 'Tshopo', HUID('dbe330b6-5cde-4830-8c30-dc00eccd1a5f')),
  (HUID(UUID()), 'Tshuapa', HUID('dbe330b6-5cde-4830-8c30-dc00eccd1a5f'));

INSERT INTO `sector` VALUES (HUID('0404e9ea-ebd6-4f20-b1f8-6dc9f9313450'),'Lukunga', HUID('f6fc7469-7e58-45cb-b87c-f08af93edade'));
INSERT INTO `village` VALUES (HUID('1f162a10-9f67-4788-9eff-c1fea42fcc9b'),'Gombe', HUID('0404e9ea-ebd6-4f20-b1f8-6dc9f9313450'), NULL, NULL);

-- default entity types
INSERT INTO `entity_type` (`label`, `translation_key`) VALUES
  ('person', 'ENTITY.TYPE.PERSON'),
  ('service', 'ENTITY.TYPE.SERVICE'),
  ('office', 'ENTITY.TYPE.OFFICE'),
  ('enterprise', 'ENTITY.TYPE.ENTERPRISE');
