-- core tables that drive system configuration - these configurations could
-- be overriden by individual enterprises however these are the defaults 

-- set variables
SET names 'utf8';
SET character_set_database = 'utf8';
SET collation_database = 'utf8_unicode_ci';

-- units
INSERT INTO unit VALUES
  (0,   'Root','TREE.ROOT','The unseen root node',NULL,'/partials/index.html','/root'),
  (1,   'Admin','TREE.ADMIN','The Administration Super-Category',0,'/partials/admin/index.html','/admin'),
  (2,   'Enterprise', 'TREE.ENTERPRISE', 'Manage the registered enterprises from here', 1, '/partials/enterprise/', '/enterprises'),
  (3,   'Invoice Registry','TREE.INVOICE_REGISTRY','Invoice Registry',5,'/partials/invoices/registry/','/invoices'),
  (4,   'Users & Permissions','TREE.USERS','Manage user privileges and permissions',1,'/partials/users/','/users'),
  (5,   'Finance','TREE.FINANCE','The Finance Super-Category',0,'/partials/finance/','/finance'),
  (6,   'Account','TREE.ACCOUNT','Chart of Accounts management',5,'/partials/accounts/','/accounts'),
  (9,   'Posting Journal','TREE.POSTING_JOURNAL','Daily Log',5,'/partials/journal/','/journal'),
  (10,  'General Ledger','TREE.GENERAL_LEDGER','Posted Journal Data', 5,'/partials/general_ledger/','/general_ledger'),
  (12,  'Hospital','TREE.HOSPITAL','The Hospital Super-Category',0,'/partials/hospital/index.html','/hospital'),
  (13,  'Fiscal Year','TREE.FISCAL_YEAR','Fiscal year configuration page',5,'/partials/fiscal/','/fiscal'),
  (14,  'Patient Registration','TREE.PATIENT_REGISTRATION','Register patients',12,'/partials/patient/register/','/patients/register'),
  (15,  'Patient Registry','TREE.PATIENT_REGISTRY','Patient Registry',12,'/partials/patients/registry/','/patients'),
  (16,  'Patient Invoice','TREE.PATIENT_INVOICE','Create an invoice for a patient',5,'/partials/patient_invoice/','/invoices/patient'),
  (18,  'Cash Window','TREE.CASH_WINDOW','Cash payments against past or future invoices',5,'/partials/cash/','/cash'),
  (19,  'Register Supplier','TREE.REGISTER_SUPPLIER','',1,'/partials/suppliers/','/suppliers'),
  (21,  'Price List','TREE.PRICE_LIST','Configure price lists!',1,'/partials/price_list/','/prices'),
  (26,  'Location Manager','TREE.LOCATION','',1,'/partials/locations/locations.html','/locations'),
  (29,  'Patient Group','TREE.PATIENT_GRP','',1,'/partials/patients/groups/','/patients/groups'),
  (48,  'Service Management','TREE.SERVICE','',1,'partials/services/','/services'),
  (57,  'Payroll','TREE.PAYROLL','',0,'partials/payroll/','/payroll/'),
  (61,  'Employee','TREE.EMPLOYEE','Employees management',57,'partials/employees/','/employees'),
  (82,  'Subsidies','TREE.SUBSIDY','Handles the subsidy situation',1,'/partials/subsidies/','/subsidies'),
  (105, 'Cashbox Management','TREE.CASHBOX_MANAGEMENT','',1,'/partials/cash/cashbox/','/cashboxes'),
  (107, 'Debtor Groups Management', 'TREE.DEBTOR_GROUP', 'Debtor Groups Management module', 1, '/partials/debtors/groups/', '/debtors/groups'),
  (134, 'Simple Journal Vouchers', 'TREE.SIMPLE_VOUCHER', 'Creates a simple transfer slip between two accounts', 5, '/partials/vouchers/simple', '/vouchers/simple'),
  (135, 'Billing Services', 'TREE.BILLING_SERVICES', 'Configures billing services for bhima', 1, '/partials/billing_services', '/billing_services'),
  (137, 'Complex Journal Vouchers', 'TREE.COMPLEX_JOURNAL_VOUCHER', 'Complex Journal vouchers module', 5, '/partials/vouchers/complex', '/vouchers/complex'),
  (138, 'Inventory Module', 'TREE.INVENTORY', 'Inventory management module', 0, '/partials/inventory/index', '/inventory'),
  (139, 'Inventory List', 'TREE.INVENTORY_LIST', 'Inventory list module', 138, '/partials/inventory/list', '/inventory/list'),
  (140, 'Inventory Configurations', 'TREE.INVENTORY_CONFIGURATION', 'Inventory configuration module', 138, '/partials/inventory/configuration', '/inventory/configuration'),
  (141, 'Vouchers Records', 'TREE.VOUCHER_REGISTRY', 'Vouchers registry module', 5, '/partials/vouchers/index', '/vouchers'),
  (142, 'Purchase Orders', 'TREE.PURCHASING', 'This module is responsible for creating purchase orders', 138, '/partials/purchases/create', '/purchases/create'),
  (143, 'Transaction Type Module', 'TREE.TRANSACTION_TYPE', 'This module is responsible for managing transaction type', 1, '/partials/admin/transaction_type', '/admin/transaction_type'),
  (144, 'Reports (Finance)', 'TREE.REPORTS', 'A folder holding all finance reports', 0, '/partials/finance/reports', '/finance/reports'),
  (145, 'Cashflow', 'TREE.CASHFLOW', 'The Cashflow Report', 144, '/partials/finance/cashflow', '/reports/cashflow'),
  (148, 'Chart of Accounts', 'REPORT.CHART_OF_ACCOUNTS', 'The COA Report', 144, '/partials/finance/chart_of_accounts', '/reports/accounts_chart'),
  (146, 'Creditor Groups Management', 'TREE.CREDITOR_GROUP', 'Creditor Groups Management module', 1, '/partials/admin/creditor_groups/', '/admin/creditor_groups'),
  (147, 'Cash Payment Registry', 'TREE.CASH_PAYMENT_REGISTRY', 'Cash Payment Registry', 5, '/partials/finance/reports/cash_payment', '/finance/reports/cash_payment'),
  (149, 'Income Expenses', 'TREE.INCOME_EXPENSE', 'The Report of income and expenses', 144, '/partials/finance/income_expense', '/reports/income_expense'),
  (150, 'Balance Report', 'TREE.BALANCE', 'Balance report module', 144, 'null', '/reports/balance'),
  (151, 'Customer Debts', 'TREE.CUSTOMER_DEBTS', 'Customer Debts', 144, '/partials/finance/reports/agedDebtors', '/reports/agedDebtors'),
  (152, 'Report accounts', 'TREE.REPORT_ACCOUNTS', 'The Report accounts', 144, '/partials/finance/report_accounts', '/reports/report_accounts');

-- Reserved system account type
INSERT INTO `account_type` VALUES
  (1, 'income', 'ACCOUNT.TYPES.INCOME'),
  (2, 'expense', 'ACCOUNT.TYPES.EXPENSE'),
  (3, 'balance', 'ACCOUNT.TYPES.BALANCE'),
  (4, 'title', 'ACCOUNT.TYPES.TITLE');

-- core BHIMA reports
INSERT INTO `report` (`id`, `report_key`, `title_key`) VALUES
  (1, 'cashflow', 'TREE.CASHFLOW'),
  (2, 'accounts_chart', 'REPORT.CHART_OF_ACCOUNTS'),
  (3, 'income_expense', 'REPORT.INCOME_EXPENSE'),
  (4, 'balance', 'REPORT.BALANCE'),
  (5, 'agedDebtors', 'TREE.CUSTOMER_DEBTS'),
  (6, 'report_accounts', 'REPORT.REPORT_ACCOUNTS');


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
