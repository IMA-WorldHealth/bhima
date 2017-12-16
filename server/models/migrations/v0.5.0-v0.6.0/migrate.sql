RENAME TABLE `assignation_patient` TO `patient_assignment`;

ALTER TABLE `cash` ADD COLUMN `edited` TINYINT NOT NULL DEFAULT 0;
ALTER TABLE `invoice` ADD COLUMN `edited` TINYINT NOT NULL DEFAULT 0;
ALTER TABLE `voucher` ADD COLUMN `edited` TINYINT NOT NULL DEFAULT 0;

ALTER TABLE `cash_box_account_currency` CHANGE `transfer_account_id` `transfer_account_id` INT UNSIGNED DEFAULT NULL;

ALTER TABLE `config_paiement_period` CHANGE `id` `id` int(10) unsigned NOT NULL;

ALTER TABLE `depot` ADD COLUMN `allow_entry_purchase` tinyint(1) unsigned NOT NULL DEFAULT 0;
ALTER TABLE `depot` ADD COLUMN `allow_entry_donation` tinyint(1) unsigned NOT NULL DEFAULT 0;
ALTER TABLE `depot` ADD COLUMN `allow_entry_integration` tinyint(1) unsigned NOT NULL DEFAULT 0;
ALTER TABLE `depot` ADD COLUMN `allow_entry_transfer` tinyint(1) unsigned NOT NULL DEFAULT 0;
ALTER TABLE `depot` ADD COLUMN `allow_exit_debtor` tinyint(1) unsigned NOT NULL DEFAULT 0;
ALTER TABLE `depot` ADD COLUMN `allow_exit_service` tinyint(1) unsigned NOT NULL DEFAULT 0;
ALTER TABLE `depot` ADD COLUMN `allow_exit_loss` tinyint(1) unsigned NOT NULL DEFAULT 0;
ALTER TABLE `depot` ADD COLUMN `allow_exit_transfer` tinyint(1) unsigned NOT NULL DEFAULT 0;

ALTER TABLE `employee` DROP COLUMN `display_name`;
ALTER TABLE `employee` DROP COLUMN `sex`;
ALTER TABLE `employee` DROP COLUMN `dob`;

-- this can't be a ALTER TABLE because of a MySQL bug.
ALTER TABLE `employee` DROP FOREIGN KEY `employee_ibfk_4`;
ALTER TABLE `employee` DROP COLUMN `grade_id`;
ALTER TABLE `employee` ADD COLUMN `grade_uuid` BINARY(16) NOT NULL;
ALTER TABLE `employee` ADD FOREIGN KEY (`grade_uuid`) REFERENCES `grade` (`uuid`);

ALTER TABLE `employee` DROP COLUMN `adresse`;
ALTER TABLE `employee` DROP COLUMN `phone`;
ALTER TABLE `employee` DROP COLUMN `email`;
ALTER TABLE `employee` ADD COLUMN `is_medical`    TINYINT(1) DEFAULT 0;

ALTER TABLE `inventory` ADD COLUMN `locked` TINYINT(1) NOT NULL DEFAULT 0;

ALTER TABLE `inventory_unit` ADD COLUMN `abbr` VARCHAR(10) NOT NULL;

ALTER TABLE `price_list_item` CHANGE COLUMN `value` `value` DOUBLE NOT NULL;

ALTER TABLE `purchase` DROP COLUMN `is_confirmed`;
ALTER TABLE `purchase` DROP COLUMN `is_received`;
ALTER TABLE `purchase` DROP COLUMN `is_partially_received`;
ALTER TABLE `purchase` DROP COLUMN `is_cancelled`;
ALTER TABLE `purchase` ADD COLUMN `status_id` TINYINT(3) UNSIGNED NOT NULL DEFAULT 1;

CREATE TABLE IF NOT EXISTS `purchase_status` (
  `id` TINYINT(3) UNSIGNED NOT NULL AUTO_INCREMENT,
  `text` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `purchase_status` (`id`, `text`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

ALTER TABLE `purchase` ADD FOREIGN KEY (`status_id`) REFERENCES `purchase_status` (`id`);

ALTER TABLE `stock_movement` CHANGE `date` `date` DATETIME NOT NULL;

-- stock consumption total
CREATE TABLE `stock_consumption` (
  `inventory_uuid`  BINARY(16) NOT NULL,
  `depot_uuid`      BINARY(16) NOT NULL,
  `period_id`       MEDIUMINT(8) NOT NULL,
  `quantity`        INT(11) DEFAULT 0,
  PRIMARY KEY (`inventory_uuid`, `depot_uuid`, `period_id`),
  KEY `inventory_uuid` (`inventory_uuid`),
  KEY `depot_uuid` (`depot_uuid`),
  KEY `period_id` (`period_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


/*
  The transaction_history table stores the editing history of transactions that
  have gone through the posting process.  The record_uuid should be the same
  record_uuid as that found in the posting_journal/general_ledger.
*/
CREATE TABLE `transaction_history` (
  `uuid`  BINARY(16) NOT NULL,
  `record_uuid`      BINARY(16) NOT NULL,
  `timestamp`        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `user_id`         SMALLINT(5) UNSIGNED NOT NULL,
  PRIMARY KEY (`uuid`),
  KEY `record_uuid` (`record_uuid`),
  KEY `user_id` (`user_id`),
  FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `depot_permission`;

CREATE TABLE `depot_permission` (
  `id` smallint(5) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` smallint(5) unsigned NOT NULL,
  `depot_uuid`  BINARY(16) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `depot_permission_1` (`user_id`,`depot_uuid`),
  KEY `user_id` (`user_id`),
  KEY `depot_uuid` (`depot_uuid`),
  FOREIGN KEY (`depot_uuid`) REFERENCES `depot` (`uuid`),
  FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `cashbox_permission`;

CREATE TABLE `cashbox_permission` (
  `id` smallint(5) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` smallint(5) unsigned NOT NULL,
  `cashbox_id`  MEDIUMINT(8) UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cashbox_permission_1` (`user_id`,`cashbox_id`),
  KEY `user_id` (`user_id`),
  KEY `cashbox_id` (`cashbox_id`),
  FOREIGN KEY (`cashbox_id`) REFERENCES `cash_box` (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

RENAME TABLE `billing_service` TO `invoicing_fee`;
RENAME TABLE `debtor_group_billing_service` TO `debtor_group_invoicing_fee`;
RENAME TABLE `patient_group_billing_service` TO `patient_group_invoicing_fee`;
RENAME TABLE `invoice_billing_service` TO `invoice_invoicing_fee`;

ALTER TABLE `debtor_group` CHANGE COLUMN `apply_billing_services` `apply_invoicing_fees` BOOLEAN NOT NULL DEFAULT TRUE;

-- ALTER TABLE `debtor_group_invoicing_fee` DROP FOREIGN KEY `billing_service_id`;
ALTER TABLE `debtor_group_invoicing_fee` CHANGE COLUMN `billing_service_id` `invoicing_fee_id`  SMALLINT UNSIGNED NOT NULL;
ALTER TABLE `debtor_group_invoicing_fee` ADD FOREIGN KEY (`invoicing_fee_id`) REFERENCES `invoicing_fee` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- ALTER TABLE `patient_group_invoicing_fee` DROP FOREIGN KEY `billing_service_id`;
ALTER TABLE `patient_group_invoicing_fee` CHANGE COLUMN `billing_service_id` `invoicing_fee_id`  SMALLINT UNSIGNED NOT NULL;
ALTER TABLE `patient_group_invoicing_fee` ADD FOREIGN KEY (`invoicing_fee_id`) REFERENCES `invoicing_fee` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- ALTER TABLE `invoice_invoicing_fee` DROP FOREIGN KEY `billing_service_id`;
ALTER TABLE `invoice_invoicing_fee` CHANGE COLUMN `billing_service_id` `invoicing_fee_id`  SMALLINT UNSIGNED NOT NULL;
ALTER TABLE `invoice_invoicing_fee` ADD FOREIGN KEY (`invoicing_fee_id`) REFERENCES `invoicing_fee` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;


-- insert missing modules
INSERT IGNORE INTO unit VALUES
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
  (20,  'Depot Management','TREE.DEPOTS','',1,'/modules/depots/','/depots'),
  (21,  'Price List','TREE.PRICE_LIST','Configure price lists!',1,'/modules/prices/','/prices'),
  (26,  'Location Manager','TREE.LOCATION','',1,'/modules/locations/locations.html','/locations'),
  (29,  'Patient Group','TREE.PATIENT_GRP','',1,'/modules/patients/groups/','/patients/groups'),
  (48,  'Service Management','TREE.SERVICE','',1,'modules/services/','/services'),
  (57,  'Payroll','TREE.PAYROLL','',0,'modules/payroll/','/payroll/'),
  (61,  'Employee','TREE.EMPLOYEE','Employees Registration',57,'modules/employees/register/','/employees/register'),
  (62,  'Employee Registry','TREE.EMPLOYEE_REGISTRY','Employee Registry',57,'/modules/payroll/registry/','/employees'),
  (82,  'Subsidies','TREE.SUBSIDY','Handles the subsidy situation',1,'/modules/subsidies/','/subsidies'),
  (105, 'Cashbox Management','TREE.CASHBOX_MANAGEMENT','',1,'/modules/cash/cashbox/','/cashboxes'),
  (107, 'Debtor Groups Management', 'TREE.DEBTOR_GROUP', 'Debtor Groups Management module', 1, '/modules/debtors/groups/', '/debtors/groups'),
  (134, 'Simple Journal Vouchers', 'TREE.SIMPLE_VOUCHER', 'Creates a simple transfer slip between two accounts', 5, '/modules/vouchers/simple', '/vouchers/simple'),
  (135, 'Invoicing Fee', 'TREE.INVOICING_FEES', 'Configures invoicing Fee for bhima', 1, '/modules/invoicing_fees', '/invoicing_fees'),
  (137, 'Complex Journal Vouchers', 'TREE.COMPLEX_JOURNAL_VOUCHER', 'Complex Journal vouchers module', 5, '/modules/vouchers/complex', '/vouchers/complex'),
  (138, 'Inventory Module', 'TREE.INVENTORY', 'Inventory management module', 0, '/modules/inventory/index', '/inventory'),
  (139, 'Inventory List', 'TREE.INVENTORY_LIST', 'Inventory list module', 138, '/modules/inventory/list', '/inventory/list'),
  (140, 'Inventory Configurations', 'TREE.INVENTORY_CONFIGURATION', 'Inventory configuration module', 138, '/modules/inventory/configuration', '/inventory/configuration'),
  (141, 'Vouchers Records', 'TREE.VOUCHER_REGISTRY', 'Vouchers registry module', 5, '/modules/vouchers/index', '/vouchers'),
  (142, 'Purchase Orders', 'TREE.PURCHASING', 'This module is responsible for creating purchase orders', 138, '/modules/purchases/create', '/purchases/create'),
  (143, 'Transaction Type Module', 'TREE.TRANSACTION_TYPE', 'This module is responsible for managing transaction type', 1, '/modules/transaction-type', '/transaction_type'),
  (144, 'Reports (Finance)', 'TREE.REPORTS', 'A folder holding all finance reports', 0, '/modules/finance/reports', '/finance/reports'),
  (145, 'Cashflow', 'TREE.CASHFLOW', 'The Cashflow Report', 144, '/modules/reports/cashflow', '/reports/cashflow'),
  (146, 'Creditor Groups Management', 'TREE.CREDITOR_GROUP', 'Creditor Groups Management module', 1, '/modules/creditor-groups/', '/creditors/groups'),
  (147, 'Cash Payment Registry', 'TREE.CASH_PAYMENT_REGISTRY', 'Cash Payment Registry', 5, '/modules/cash/payments/registry', '/payments'),
  (149, 'Cash report', 'TREE.CASH_REPORT', 'The Report of cash entry and exit', 144, '/modules/reports/cash_report', '/reports/cash_report'),
  (150, 'Balance Report', 'TREE.BALANCE_REPORT', 'Balance report module', 144, '/modules/reports/balance_report', '/reports/balance_report'),
  (151, 'Customer Debts', 'TREE.AGED_DEBTORS', 'Aged Debtors', 144, '/modules/reports/aged_debtors', '/reports/aged_debtors'),
  (152, 'Account report', 'TREE.REPORT_ACCOUNTS', 'The Report accounts', 144, '/modules/reports/account_report', '/reports/account_report'),
  (153, 'Report Cashflow by Service', 'TREE.CASHFLOW_BY_SERVICE', 'CashflowByService', 144, '/partials/reports/cashflowByService', '/reports/cashflowByService'),
  (154, 'Purchase Order', 'TREE.PURCHASE_ORDER', 'Purchase order folder', 0, '/partials/purchase_order', '/purchases/'),
  (155, 'Purchase', 'TREE.PURCHASE', 'The purchase module', 154, '/partials/purchase_order/purchase', '/purchases/create'),
  (156, 'Purchase Registry', 'TREE.PURCHASE_REGISTRY', 'The purchase registry', 154, '/partials/purchase_order/registry', '/purchases'),
  (157, 'Open Debtors', 'REPORT.OPEN_DEBTORS.TREE', 'Open Debtors', 144, '/modules/finance/open_debtors', '/reports/open_debtors'),
  (159, 'Clients report', 'REPORT.CLIENTS_REPORT.TITLE', 'The Client report', 144, '/modules/reports/clients_report', '/reports/clients_report'),
  (160, 'Stock', 'TREE.STOCK', 'The stock management module', 0, '/partials/stock', '/stock'),
  (161, 'Stock Lots', 'TREE.STOCK_LOTS', 'The stock lots registry', 160, '/partials/stock/lots', '/stock/lots'),
  (162, 'Stock Movements', 'TREE.STOCK_MOVEMENTS', 'The stock lots movements registry', 160, '/partials/stock/movements', '/stock/movements'),
  (163, 'Stock Inventory', 'TREE.STOCK_INVENTORY', 'The stock inventory registry', 160, '/partials/stock/inventories', '/stock/inventories'),
  (164, 'Stock Exit', 'STOCK.EXIT', 'The stock exit module', 160, '/partials/stock/exit', '/stock/exit'),
  (165, 'Stock Entry', 'STOCK.ENTRY', 'The stock entry module', 160, '/partials/stock/entry', '/stock/entry'),
  (167, 'Stock Adjustment', 'STOCK.ADJUSTMENT', 'The stock adjustment module', 160, '/partials/stock/adjustment', '/stock/adjustment'),
  (168, 'Aged Creditors', 'TREE.AGED_CREDITORS', 'Aged Creditors', 144, '/modules/reports/aged_creditors', '/reports/aged_creditors'),
  (170, 'Account Statement', 'TREE.ACCOUNT_STATEMENT', 'Account Statement Module', 5, '/partials/account_statement/', '/account_statement'),
  (171, 'Balance Sheet Statement', 'TREE.BALANCE_SHEET', 'Balance Sheet Module', 144, '/modules/reports/balance_sheet_report/', '/reports/balance_sheet_report'),
  (180, 'Income Expenses', 'TREE.INCOME_EXPENSE', 'The Report of income and expenses', 144, '/modules/finance/income_expense', '/reports/income_expense'),
  (181, 'Stock Report', 'TREE.STOCK_REPORT', 'The Report of inventories in stock', 144, '/modules/reports/inventory_report', '/reports/inventory_report'),
  (182, 'Stock File Report', 'TREE.STOCK_INVENTORY_REPORT', 'The Report of an inventory in stock', 144, '/modules/reports/inventory_file', '/reports/inventory_file'),
  (183, 'Grade Management','TREE.GRADES','', 1,'/modules/grades/','/grades'),
  (184, 'Job Title Management','TREE.PROFESSION','', 1,'/modules/functions/','/functions');


INSERT IGNORE INTO `report` (`id`, `report_key`, `title_key`) VALUES
  (1, 'cashflow', 'TREE.CASHFLOW'),
  (2, 'accounts_chart', 'REPORT.CHART_OF_ACCOUNTS'),
  (3, 'income_expense', 'REPORT.INCOME_EXPENSE'),
  (4, 'balance_report', 'REPORT.BALANCE'),
  (5, 'aged_debtors', 'TREE.AGED_DEBTORS'),
  (6, 'account_report', 'REPORT.REPORT_ACCOUNTS.TITLE'),
  (7, 'cashflowByService', 'REPORT.CASHFLOW_BY_SERVICE.TITLE'),
  (8, 'open_debtors', 'REPORT.OPEN_DEBTORS.TITLE'),
  (9, 'clients_report','REPORT.CLIENTS'),
  (10, 'aged_creditors','TREE.AGED_CREDITORS'),
  (11, 'balance_sheet_report', 'REPORT.BALANCE_SHEET.TITLE'),
  (12, 'cash_report', 'REPORT.CASH_REPORT'),
  (13, 'inventory_report', 'REPORT.STOCK.TITLE'),
  (14, 'inventory_file', 'REPORT.STOCK.INVENTORY_REPORT');

-- various unit updates

DELETE FROM unit WHERE id IN (135, 158);
INSERT INTO unit values (135, 'Invoicing Fee', 'TREE.INVOICING_FEES', 'Configures invoicing Fee for bhima', 1, '/modules/invoicing_fees', '/invoicing_fees')
