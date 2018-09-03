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
  (0,   'Root','TREE.ROOT','The unseen root node',NULL,'/modules/index.html','/root'),
  (1,   'Admin','TREE.ADMIN','The Administration Super-Category',0,'/modules/admin/index.html','/ADMIN_FOLDER'),
  (2,   'Enterprise', 'TREE.ENTERPRISE', 'Manage the registered enterprises from here', 1, '/modules/enterprise/', '/enterprises'),
  (3,   'Invoice Registry','TREE.INVOICE_REGISTRY','Invoice Registry',5,'/modules/invoices/registry/','/invoices'),
  (4,   'Users & Permissions','TREE.USERS','Manage user privileges and permissions',1,'/modules/users/','/users'),
  (5,   'Finance','TREE.FINANCE','The Finance Super-Category',0,'/modules/finance/','/FINANCE_FOLDER'),
  (6,   'Account','TREE.ACCOUNT','Chart of Accounts management',5,'/modules/accounts/','/accounts'),
  (9,   'Posting Journal','TREE.POSTING_JOURNAL','Daily Log',5,'/modules/journal/','/journal'),
  (10,  'General Ledger','TREE.GENERAL_LEDGER','Posted Journal Data', 5,'/modules/general_ledger/','/general_ledger'),
  (12,  'Hospital','TREE.HOSPITAL','The Hospital Super-Category',0,'/modules/hospital/index.html','/HOSPITAL_FOLDER'),
  (13,  'Fiscal Year','TREE.FISCAL_YEAR','Fiscal year configuration page',5,'/modules/fiscal/','/fiscal'),
  (14,  'Patient Registration','TREE.PATIENT_REGISTRATION','Register patients',12,'/modules/patient/register/','/patients/register'),
  (15,  'Patient Registry','TREE.PATIENT_REGISTRY','Patient Registry',12,'/modules/patients/registry/','/patients'),
  (16,  'Patient Invoice','TREE.PATIENT_INVOICE','Create an invoice for a patient',5,'/modules/patient_invoice/','/invoices/patient'),
  (18,  'Cash Window','TREE.CASH_WINDOW','Cash payments against past or future invoices',5,'/modules/cash/','/cash'),
  (19,  'Register Supplier','TREE.REGISTER_SUPPLIER','',1,'/modules/suppliers/','/suppliers'),
  (20,  'Depot Management','TREE.DEPOTS','',0,'/modules/depots/','/DEPOT_FOLDER'),
  (21,  'Price List','TREE.PRICE_LIST','Configure price lists!',1,'/modules/prices/','/prices'),
  (26,  'Location Manager','TREE.LOCATION','',1,'/modules/locations/locations.html','/locations'),
  (29,  'Patient Group','TREE.PATIENT_GRP','',1,'/modules/patients/groups/','/patients/groups'),
  (48,  'Service Management','TREE.SERVICE','',1,'modules/services/','/services'),
  (57,  'Humans Ressources','TREE.HUMANS_RESSOURCES','',0,'modules/payroll/','/PAYROLL_FOLDER'),
  (61,  'Employee','TREE.EMPLOYEE','Employees Registration',57,'modules/employees/register/','/employees/register'),
  (62,  'Employee Registry','TREE.EMPLOYEE_REGISTRY','Employee Registry',57,'/modules/payroll/registry/','/employees'),
  (82,  'Subsidies','TREE.SUBSIDY','Handles the subsidy situation',1,'/modules/subsidies/','/subsidies'),
  (105, 'Cashbox Management','TREE.CASHBOX_MANAGEMENT','',1,'/modules/cash/cashbox/','/cashboxes'),
  (107, 'Debtor Groups Management', 'TREE.DEBTOR_GROUP', 'Debtor Groups Management module', 1, '/modules/debtors/groups/', '/debtors/groups'),
  (134, 'Simple Journal Vouchers', 'TREE.SIMPLE_VOUCHER', 'Creates a simple transfer slip between two accounts', 5, '/modules/vouchers/simple', '/vouchers/simple'),
  (135, 'Invoicing Fee', 'TREE.INVOICING_FEES', 'Configures invoicing Fee for bhima', 1, '/modules/invoicing_fees', '/invoicing_fees'),
  (137, 'Complex Journal Vouchers', 'TREE.COMPLEX_JOURNAL_VOUCHER', 'Complex Journal vouchers module', 5, '/modules/vouchers/complex', '/vouchers/complex'),
  (138, 'Inventory Module', 'TREE.INVENTORY', 'Inventory management module', 0, '/modules/inventory/index', '/INVENTORY_FOLDER'),
  (139, 'Inventory Registry', 'TREE.INVENTORY_REGISTRY', 'Inventory Registry module', 138, '/modules/inventory/list', '/inventory'),
  (140, 'Inventory Configurations', 'TREE.INVENTORY_CONFIGURATION', 'Inventory configuration module', 138, '/modules/inventory/configuration', '/inventory/configuration'),
  (141, 'Vouchers Records', 'TREE.VOUCHER_REGISTRY', 'Vouchers registry module', 5, '/modules/vouchers/index', '/vouchers'),
  -- (142, 'Purchase Orders', 'TREE.PURCHASING', 'This module is responsible for creating purchase orders', 138, '/modules/purchases/create', '/purchases/create'),
  (143, 'Transaction Type Module', 'TREE.TRANSACTION_TYPE', 'This module is responsible for managing transaction type', 1, '/modules/transaction-type', '/transaction_type'),
  (144, 'Reports (Finance)', 'TREE.REPORTS', 'A folder holding all finance reports', 0, '/modules/finance/reports', '/finance/REPORT_FOLDER'),
  (145, 'Cashflow', 'TREE.CASHFLOW', 'The Cashflow Report', 144, '/modules/reports/cashflow', '/reports/cashflow'),
  -- (148, 'Chart of Accounts', 'REPORT.CHART_OF_ACCOUNTS', 'The COA Report', 144, '/modules/finance/chart_of_accounts', '/reports/accounts_chart'),
  (146, 'Creditor Groups Management', 'TREE.CREDITOR_GROUP', 'Creditor Groups Management module', 1, '/modules/creditor-groups/', '/creditors/groups'),
  (147, 'Cash Payment Registry', 'TREE.CASH_PAYMENT_REGISTRY', 'Cash Payment Registry', 5, '/modules/cash/payments/registry', '/payments'),
  (149, 'Cash Report', 'TREE.CASH_REPORT', 'The Report of cash entry and exit', 144, '/modules/reports/cash_report', '/reports/cash_report'),
  (150, 'Balance Report', 'TREE.BALANCE_REPORT', 'Balance report module', 144, '/modules/reports/balance_report', '/reports/balance_report'),
  (151, 'Customer Debts', 'TREE.AGED_DEBTORS', 'Aged Debtors', 144, '/modules/reports/aged_debtors', '/reports/aged_debtors'),
  (152, 'Account report', 'TREE.REPORT_ACCOUNTS', 'The Report accounts', 144, '/modules/reports/account_report', '/reports/account_report'),
  (153, 'Report Cashflow by Service', 'TREE.CASHFLOW_BY_SERVICE', 'CashflowByService', 144, '/modules/reports/cashflowByService', '/reports/cashflowByService'),
  (154, 'Purchase Order', 'TREE.PURCHASE_ORDER', 'Purchase order folder', 0, '/modules/purchase_order', '/PURCHASE_FOLDER'),
  (155, 'Purchase', 'TREE.PURCHASE', 'The purchase module', 154, '/modules/purchase_order/purchase', '/purchases/create'),
  (156, 'Purchase Registry', 'TREE.PURCHASE_REGISTRY', 'The purchase registry', 154, '/modules/purchase_order/registry', '/purchases'),
  (157, 'Open Debtors', 'REPORT.OPEN_DEBTORS.TREE', 'Open Debtors', 144, '/modules/finance/open_debtors', '/reports/open_debtors'),
  (159, 'Clients report', 'REPORT.CLIENTS_REPORT.TITLE', 'The Client report', 144, '/modules/reports/clients_report', '/reports/clients_report'),
  (160, 'Stock', 'TREE.STOCK', 'The stock management module', 0, '/modules/stock', '/STOCK_FOLDER'),
  (161, 'Stock Lots', 'TREE.STOCK_LOTS', 'The stock lots registry', 160, '/modules/stock/lots', '/stock/lots'),
  (162, 'Stock Movements', 'TREE.STOCK_MOVEMENTS', 'The stock lots movements registry', 160, '/modules/stock/movements', '/stock/movements'),
  (163, 'Stock Inventory', 'TREE.STOCK_INVENTORY', 'The stock inventory registry', 160, '/modules/stock/inventories', '/stock/inventories'),
  (164, 'Stock Exit', 'STOCK.EXIT', 'The stock exit module', 160, '/modules/stock/exit', '/stock/exit'),
  (165, 'Stock Entry', 'STOCK.ENTRY', 'The stock entry module', 160, '/modules/stock/entry', '/stock/entry'),
  (167, 'Stock Adjustment', 'STOCK.ADJUSTMENT', 'The stock adjustment module', 160, '/modules/stock/adjustment', '/stock/adjustment'),
  (168, 'Aged Creditors', 'TREE.AGED_CREDITORS', 'Aged Creditors', 144, '/modules/reports/aged_creditors', '/reports/aged_creditors'),
  (170, 'Account Statement', 'TREE.ACCOUNT_STATEMENT', 'Account Statement Module', 5, '/modules/account_statement/', '/account_statement'),
  (171, 'Balance Sheet Statement', 'TREE.BALANCE_SHEET', 'Balance Sheet Module', 144, '/modules/reports/balance_sheet_report/', '/reports/balance_sheet_report'),
  (180, 'Income Expenses', 'TREE.INCOME_EXPENSE', 'The Report of income and expenses', 144, '/modules/finance/income_expense', '/reports/income_expense'),
  (181, 'Stock Report', 'TREE.STOCK_REPORT', 'The Report of inventories in stock', 144, '/modules/reports/inventory_report', '/reports/inventory_report'),
  (182, 'Stock File Report', 'TREE.STOCK_INVENTORY_REPORT', 'The Report of an inventory in stock', 144, '/modules/reports/inventory_file', '/reports/inventory_file'),
  (183, 'Grade Management','TREE.GRADES','', 57,'/modules/grades/','/grades'),
  (184, 'Job Title Management','TREE.PROFESSION','', 57,'/modules/functions/','/functions'),
  (185, 'Payroll Rubric Management','TREE.PAYROLL_RUB_MANAGEMENT','', 57,'/modules/payroll/rubrics','/payroll/rubrics'),
  (186, 'Holidays Management','TREE.HOLIDAYS_MANAGEMENT','Holidays Management',57,'/modules/holidays/','/holidays'),
  (187, 'Offdays Management','TREE.OFFDAYS_MANAGEMENT','Offdays Management', 57,'/modules/offdays/','/offdays'),
  (188, 'Tax IPR Management','TREE.IPR_MANAGEMENT','IPR Management',57,'/modules/ipr_tax/','/ipr_tax'),
  (189, 'IPR Tax Configuration','TREE.IPR_TAX_CONFIGURATION','IPR Tax Configuration', 57,'/modules/ipr_tax/configuration','/ipr_tax/configuration'),
  (190, 'Payroll Rubric Configuration','TREE.PAYROLL_RUB_CONFIGURATION','',57,'/modules/payroll/rubric_configuration','/payroll/rubric_configuration'),
  (191, 'Account Configuration','TREE.PAYROLL_ACCOUNT_CONFIGURATION','Account Configuration', 57,'/modules/payroll/account_configuration','/payroll/account_configuration'),
  (192, 'Operating report', 'TREE.OPERATING_ACCOUNT', 'The Report of operating', 144, '/modules/reports/operating', '/reports/operating'),
  (193, 'Weekend Configuration','TREE.WEEKEND_CONFIGURATION','Weekend Configuration', 57,'/modules/payroll/weekend_configuration','/payroll/weekend_configuration'),
  (194, 'Payroll Configuration','TREE.PAYROLL_CONFIGURATION','Payroll Configuration', 57,'/modules/payroll','/payroll'),
  (195, 'Role management','TREE.ROLE_MANAGEMENT','Roles Management', 1,'/modules/role/','/roles'),
  (196, 'Depot Registry','TREE.DEPOTS_REGISTRY','',20,'/modules/depots/','/depots'),
  (197, 'Stock Exit Report','TREE.STOCK_EXIT_REPORT','Stock Exit Report', 144,'/modules/reports/generated/stock_exit','/reports/stock_exit'),
  (199, 'Client Debtor Account Balance', 'REPORT.CLIENT_DEBTOR_ACCOUNT_BALANCE_REPORT', 'Client Debtor Account Balance', 144, '/modules/reports/debtor_accounts_balance', '/reports/debtorBalanceReport'),
  (200, 'Multiple Payroll','TREE.MULTI_PAYROLL','Multiple Payroll', 57,'/modules/multiple_payroll','/multiple_payroll'),
  (201, 'Employee Standing Report', 'TREE.EMPLOYEE_STANDING_REPORT', 'Employee Standing Report', 144, '/modules/reports/employeeStanding', '/reports/employeeStanding'),
  (202, 'Patient Standing Report', 'TREE.PATIENT_STANDING_REPORT', 'Patient Standing Report', 144, '/modules/reports/patientStanding', '/reports/patientStanding'),
  (203, 'Employees Configuration','TREE.PAYROLL_EMP_CONFIGURATION','',57,'/modules/payroll/employee_configuration','/payroll/employee_configuration'),
  (204, 'Exchange Rate','TREE.EXCHANGE','',1,'/modules/exchange/exchange','/exchange'),
  (205, 'Account Reference Management','TREE.ACCOUNT_REFERENCE_MANAGEMENT','',1,'/modules/account_reference','/account_reference'),
  (206, '[OHADA] Bilan','TREE.OHADA_BALANCE_SHEET','',144,'/modules/reports/ohada_balance_sheet_report','/reports/ohada_balance_sheet_report'),
  (207, 'Account Reference Report','TREE.ACCOUNT_REFERENCE_REPORT','',144,'/modules/reports/account_reference','/reports/account_reference'),
  (209, 'Fee Center Management','TREE.FEE_CENTER','',1,'/modules/fee_center','/fee_center');

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
  (21, 'account_reference', 'REPORT.ACCOUNT_REFERENCE.TITLE');

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

