-- core tables that drive system configuration - these configurations could
-- be overriden by individual enterprises however these are the defaults

-- set variables
SET names 'utf8';
SET character_set_database = 'utf8';
SET collation_database = 'utf8_unicode_ci';

-- units
INSERT INTO unit VALUES
  (0,   'Root','TREE.ROOT','The unseen root node',NULL,'/modules/index.html','/root'),
  (1,   'Admin','TREE.ADMIN','The Administration Super-Category',0,'/modules/admin/index.html','/admin'),
  (2,   'Enterprise', 'TREE.ENTERPRISE', 'Manage the registered enterprises from here', 1, '/modules/enterprise/', '/enterprises'),
  (3,   'Invoice Registry','TREE.INVOICE_REGISTRY','Invoice Registry',5,'/modules/invoices/registry/','/invoices'),
  (4,   'Users & Permissions','TREE.USERS','Manage user privileges and permissions',1,'/modules/users/','/users'),
  (5,   'Finance','TREE.FINANCE','The Finance Super-Category',0,'/modules/finance/','/finance'),
  (6,   'Account','TREE.ACCOUNT','Chart of Accounts management',5,'/modules/accounts/','/accounts'),
  (9,   'Posting Journal','TREE.POSTING_JOURNAL','Daily Log',5,'/modules/journal/','/journal'),
  (10,  'General Ledger','TREE.GENERAL_LEDGER','Posted Journal Data', 5,'/modules/general_ledger/','/general_ledger'),
  (12,  'Hospital','TREE.HOSPITAL','The Hospital Super-Category',0,'/modules/hospital/index.html','/hospital'),
  (13,  'Fiscal Year','TREE.FISCAL_YEAR','Fiscal year configuration page',5,'/modules/fiscal/','/fiscal'),
  (14,  'Patient Registration','TREE.PATIENT_REGISTRATION','Register patients',12,'/modules/patient/register/','/patients/register'),
  (15,  'Patient Registry','TREE.PATIENT_REGISTRY','Patient Registry',12,'/modules/patients/registry/','/patients'),
  (16,  'Patient Invoice','TREE.PATIENT_INVOICE','Create an invoice for a patient',5,'/modules/patient_invoice/','/invoices/patient'),
  (18,  'Cash Window','TREE.CASH_WINDOW','Cash payments against past or future invoices',5,'/modules/cash/','/cash'),
  (19,  'Register Supplier','TREE.REGISTER_SUPPLIER','',1,'/modules/suppliers/','/suppliers'),
  (21,  'Price List','TREE.PRICE_LIST','Configure price lists!',1,'/modules/prices/','/prices'),
  (26,  'Location Manager','TREE.LOCATION','',1,'/modules/locations/locations.html','/locations'),
  (29,  'Patient Group','TREE.PATIENT_GRP','',1,'/modules/patients/groups/','/patients/groups'),
  (48,  'Service Management','TREE.SERVICE','',1,'modules/services/','/services'),
  (57,  'Payroll','TREE.PAYROLL','',0,'modules/payroll/','/payroll/'),
  (61,  'Employee','TREE.EMPLOYEE','Employees management',57,'modules/employees/','/employees'),
  (82,  'Subsidies','TREE.SUBSIDY','Handles the subsidy situation',1,'/modules/subsidies/','/subsidies'),
  (105, 'Cashbox Management','TREE.CASHBOX_MANAGEMENT','',1,'/modules/cash/cashbox/','/cashboxes'),
  (107, 'Debtor Groups Management', 'TREE.DEBTOR_GROUP', 'Debtor Groups Management module', 1, '/modules/debtors/groups/', '/debtors/groups'),
  (134, 'Simple Journal Vouchers', 'TREE.SIMPLE_VOUCHER', 'Creates a simple transfer slip between two accounts', 5, '/modules/vouchers/simple', '/vouchers/simple'),
  (135, 'Billing Services', 'TREE.BILLING_SERVICES', 'Configures billing services for bhima', 1, '/modules/billing_services', '/billing_services'),
  (137, 'Complex Journal Vouchers', 'TREE.COMPLEX_JOURNAL_VOUCHER', 'Complex Journal vouchers module', 5, '/modules/vouchers/complex', '/vouchers/complex'),
  (138, 'Inventory Module', 'TREE.INVENTORY', 'Inventory management module', 0, '/modules/inventory/index', '/inventory'),
  (139, 'Inventory List', 'TREE.INVENTORY_LIST', 'Inventory list module', 138, '/modules/inventory/list', '/inventory/list'),
  (140, 'Inventory Configurations', 'TREE.INVENTORY_CONFIGURATION', 'Inventory configuration module', 138, '/modules/inventory/configuration', '/inventory/configuration'),
  (141, 'Vouchers Records', 'TREE.VOUCHER_REGISTRY', 'Vouchers registry module', 5, '/modules/vouchers/index', '/vouchers'),
  (142, 'Purchase Orders', 'TREE.PURCHASING', 'This module is responsible for creating purchase orders', 138, '/modules/purchases/create', '/purchases/create'),
  (143, 'Transaction Type Module', 'TREE.TRANSACTION_TYPE', 'This module is responsible for managing transaction type', 1, '/modules/transaction-type', '/transaction_type'),
  (144, 'Reports (Finance)', 'TREE.REPORTS', 'A folder holding all finance reports', 0, '/modules/finance/reports', '/finance/reports'),
  (145, 'Cashflow', 'REPORT.CASHFLOW', 'The Cashflow Report', 144, '/modules/finance/cashflow', '/reports/cashflow'),
  (148, 'Chart of Accounts', 'REPORT.CHART_OF_ACCOUNTS', 'The COA Report', 144, '/modules/finance/chart_of_accounts', '/reports/accounts_chart'),
  (146, 'Creditor Groups Management', 'TREE.CREDITOR_GROUP', 'Creditor Groups Management module', 1, '/modules/creditor-groups/', '/creditors/groups'),
  (147, 'Cash Payment Registry', 'TREE.CASH_PAYMENT_REGISTRY', 'Cash Payment Registry', 5, '/modules/cash/payments/registry', '/payments'),
  (149, 'Income Expenses', 'TREE.INCOME_EXPENSE', 'The Report of income and expenses', 144, '/modules/finance/income_expense', '/reports/income_expense'),
  (150, 'Balance Report', 'TREE.BALANCE', 'Balance report module', 144, 'null', '/reports/balance'),
  (151, 'Customer Debts', 'TREE.CUSTOMER_DEBTS', 'Customer Debts', 144, '/partials/finance/reports/agedDebtors', '/reports/agedDebtors'),
  (152, 'Report accounts', 'TREE.REPORT_ACCOUNTS', 'The Report accounts', 144, '/partials/finance/report_accounts', '/reports/report_accounts'),
  (153, 'Report Cashflow by Service', 'REPORT.CASHFLOW_BY_SERVICE', 'CashflowByService', 144, '/partials/finance/cashflow/services', '/reports/cashflowByService'),
  (154, 'Purchase Order', 'TREE.PURCHASE_ORDER', 'Purchase order folder', 0, '/partials/purchase_order', '/purchases/'),
  (155, 'Purchase', 'TREE.PURCHASE', 'The purchase module', 154, '/partials/purchase_order/purchase', '/purchases/create'),
  (156, 'Purchase Registry', 'TREE.PURCHASE_REGISTRY', 'The purchase registry', 154, '/partials/purchase_order/registry', '/purchases/list'),
  (157, 'Open Debtors', 'REPORT.OPEN_DEBTORS.TREE', 'Open Debtors', 144, '/partials/finance/debtors/open', '/reports/openDebtors'),
  (158, 'Posted Journal', 'TREE.POSTED_JOURNAL', 'Posted Journal', 5, '/partials/finance/general_ledger/', '/journal/posted'),
  (159, 'Clients report', 'REPORT.CLIENTS_REPORT.TITLE', 'The Client report', 144, '/partials/finance/clients_report', '/reports/clients_report'),
  (160, 'Stock', 'TREE.STOCK', 'The stock management module', 0, '/partials/stock', '/stock'),
  (161, 'Stock Lots', 'TREE.STOCK_LOTS', 'The stock lots registry', 160, '/partials/stock/lots', '/stock/lots'),
  (162, 'Stock Movements', 'TREE.STOCK_MOVEMENTS', 'The stock lots movements registry', 160, '/partials/stock/movements', '/stock/movements'),
  (163, 'Stock Inventory', 'TREE.STOCK_INVENTORY', 'The stock inventory registry', 160, '/partials/stock/inventories', '/stock/inventories'),
  (164, 'Stock Exit', 'STOCK.EXIT', 'The stock exit module', 160, '/partials/stock/exit', '/stock/exit'),
  (165, 'Stock Entry', 'STOCK.ENTRY', 'The stock entry module', 160, '/partials/stock/entry', '/stock/entry'),
  (166, 'Stock Origins', 'STOCK.ORIGINS', 'The stock origins module', 160, '/partials/stock/origins', '/stock/origins'),
  (167, 'Stock Adjustment', 'STOCK.ADJUSTMENT', 'The stock adjustment module', 160, '/partials/stock/adjustment', '/stock/adjustment'),
  (168, 'Aged Creditors', 'TREE.AGED_CREDITORS', 'Aged Creditors', 144, '/partials/finance/reports/agedCreditors', '/reports/agedCreditors'),
  (170, 'Account Statement', 'TREE.ACCOUNT_STATEMENT', 'Account Statement Module', 5, '/partials/account_statement/', '/account_statement');

-- Reserved system account type
INSERT INTO `account_type` VALUES
  (1, 'income', 'ACCOUNT.TYPES.INCOME'),
  (2, 'expense', 'ACCOUNT.TYPES.EXPENSE'),
  (3, 'balance', 'ACCOUNT.TYPES.BALANCE'),
  (4, 'title', 'ACCOUNT.TYPES.TITLE');

-- core BHIMA reports
INSERT INTO `report` (`id`, `report_key`, `title_key`) VALUES
  (1, 'cashflow', 'REPORT.CASHFLOW'),
  (2, 'accounts_chart', 'REPORT.CHART_OF_ACCOUNTS'),
  (3, 'income_expense', 'REPORT.INCOME_EXPENSE'),
  (4, 'balance', 'REPORT.BALANCE'),
  (5, 'agedDebtors', 'TREE.CUSTOMER_DEBTS'),
  (6, 'report_accounts', 'REPORT.REPORT_ACCOUNTS'),
  (7, 'cashflowByService', 'REPORT.CASHFLOW_BY_SERVICE'),
  (8, 'openDebtors', 'REPORT.OPEN_DEBTORS.TITLE'),
  (9, 'clients_report','REPORT.CLIENTS_REPORT'),
  (10, 'agedCreditors','REPORT.AGED_CREDITORS');

-- Supported Languages
INSERT INTO `language` VALUES
  (1,'Francais','fr', 'fr-be'),
  (2,'English','en', 'en-us'),
  (3,'Lingala','lg', 'fr-cd');

-- Currencies
INSERT INTO `currency` (`id`, `name`, `format_key`, `symbol`, `note`, `min_monentary_unit`) VALUES
  (1,'Congolese Francs','fc','Fc',NULL,50.00),
  (2,'United States Dollars','usd','$',NULL,0.01);

INSERT INTO `inventory_type` VALUES (1,'Article'),(2,'Assembly'),(3,'Service');
INSERT INTO `inventory_unit` VALUES (1,'Act'),(2,'Pallet'),(3,'Pill'),(4,'Box'),(5,'Lot'),(6,'amp'),(7,'bags'),(8,'btl'),(9,'cap'),(10,'flc'),(11,'jar'),(12,'ltr'),(13,'pce'),(14,'sch'),(15,'tab'),(16,'tub'),(17,'vial');

-- fonctions
INSERT INTO `fonction` VALUES
  (1,'Infirmier'),
  (2,'Medecin Directeur');

-- transaction type
INSERT INTO `transaction_type` (`id`, `text`, `type`, `prefix`, `fixed`) VALUES
  (1, 'VOUCHERS.SIMPLE.GENERIC_INCOME', 'income', 'REC. GEN', 1),
  (2, 'VOUCHERS.SIMPLE.CASH_PAYMENT', 'income', 'CASH', 1),
  (3, 'VOUCHERS.SIMPLE.CONVENTION_PAYMENT', 'income', 'CONV', 1),
  (4, 'VOUCHERS.SIMPLE.SUPPORT_INCOME', 'income', 'PEC', 1),
  (5, 'VOUCHERS.SIMPLE.TRANSFER', 'income', 'TRANSF', 1),
  (6, 'VOUCHERS.SIMPLE.GENERIC_EXPENSE', 'expense', 'DEP. GEN', 1),
  (7, 'VOUCHERS.SIMPLE.SALARY_PAYMENT', 'expense', 'SALAIRE', 1),
  (8, 'VOUCHERS.SIMPLE.CASH_RETURN', 'expense', 'PAYBACK', 1),
  (9, 'VOUCHERS.SIMPLE.PURCHASES', 'expense', 'ACHAT', 1),
  (10,'VOUCHERS.SIMPLE.CREDIT_NOTE', 'other', 'CREDIT NOTE', 1),
  (11,'VOUCHERS.SIMPLE.INVOICING', 'income', 'INV', 1);

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

