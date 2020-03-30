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
  (20,  'Depot Management','DEPOT.TITLE','', 160,'/modules/depots/','/depots'),
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
  (160, 'Stock', 'TREE.STOCK', 'The stock management module', 0, '/modules/stock', '/STOCK_FOLDER'),
  (161, 'Stock Lots', 'TREE.STOCK_LOTS', 'The stock lots registry', 160, '/modules/stock/lots', '/stock/lots'),
  (162, 'Stock Movements', 'TREE.STOCK_MOVEMENTS', 'The stock lots movements registry', 160, '/modules/stock/movements', '/stock/movements'),
  (163, 'Stock Inventory', 'TREE.STOCK_INVENTORY', 'The stock inventory registry', 160, '/modules/stock/inventories', '/stock/inventories'),
  (164, 'Stock Exit', 'STOCK.EXIT', 'The stock exit module', 160, '/modules/stock/exit', '/stock/exit'),
  (165, 'Stock Entry', 'STOCK.ENTRY', 'The stock entry module', 160, '/modules/stock/entry', '/stock/entry'),
  (167, 'Stock Adjustment', 'STOCK.ADJUSTMENT', 'The stock adjustment module', 160, '/modules/stock/adjustment', '/stock/adjustment'),
  (168, 'Aged Creditors', 'TREE.AGED_CREDITORS', 'Aged Creditors', 144, '/modules/reports/aged_creditors', '/reports/aged_creditors'),
  (170, 'Account Statement', 'TREE.ACCOUNT_STATEMENT', 'Account Statement Module', 5, '/modules/account_statement/', '/account_statement'),
  (180, 'Income Expenses', 'REPORT.PROFIT_AND_LOSS', 'The Report of income and expenses', 144, '/modules/finance/income_expense', '/reports/income_expense'),
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
  (197, 'Stock Exit Report','TREE.STOCK_EXIT_REPORT','Stock Exit Report', 144,'/modules/reports/generated/stock_exit','/reports/stock_exit'),
  (199, 'Annual Clients Report', 'REPORT.CLIENTS.TITLE', 'Annual Clients Report', 144, '/modules/reports/clients', '/reports/annual-clients-report'),
  (200, 'Multiple Payroll','TREE.MULTI_PAYROLL','Multiple Payroll', 57,'/modules/multiple_payroll','/multiple_payroll'),
  (201, 'Employee Standing Report', 'TREE.EMPLOYEE_STANDING_REPORT', 'Employee Standing Report', 144, '/modules/reports/employeeStanding', '/reports/employeeStanding'),
  (202, 'Patient Standing Report', 'TREE.PATIENT_STANDING_REPORT', 'Patient Standing Report', 144, '/modules/reports/patientStanding', '/reports/patientStanding'),
  (203, 'Employees Configuration','TREE.PAYROLL_EMP_CONFIGURATION','',57,'/modules/payroll/employee_configuration','/payroll/employee_configuration'),
  (204, 'Exchange Rate','TREE.EXCHANGE','', 1,'/modules/exchange/exchange','/exchange'),
  (205, 'Account Reference Management','TREE.ACCOUNT_REFERENCE_MANAGEMENT','',1,'/modules/account_reference','/account_reference'),
  (206, '[OHADA] Bilan','TREE.OHADA_BALANCE_SHEET','',144,'/modules/reports/ohada_balance_sheet_report','/reports/ohada_balance_sheet_report'),
  (207, 'Account Reference Report','TREE.ACCOUNT_REFERENCE_REPORT','',144,'/modules/reports/account_reference','/reports/account_reference'),
  (208, 'Import Stock From File','TREE.IMPORT_STOCK_FROM_FILE','',160,'/modules/stock/import','/stock/import'),
  (209, 'Accounts Report Multiple','TREE.REPORTS_MULTIPLE_ACCOUNTS','',144,'/modules/reports/account_report_multiple','/reports/account_report_multiple'),
  (210, 'Unbalanced Invoice Payments','REPORT.UNPAID_INVOICE_PAYMENTS_REPORT.TITLE','',144,'/modules/reports/unpaid-invoice-payments','/reports/unpaid-invoice-payments'),
  (211, 'Income Expenses by Month', 'REPORT.PROFIT_AND_LOSS_BY_MONTH', 'The Report of income and expenses', 144, '/modules/finance/income_expense_by_month', '/reports/income_expense_by_month'),
  (213, 'Stock value Report','TREE.STOCK_VALUE','',144,'/modules/reports/stock_value','/reports/stock_value'),
  (214, '[OHADA] Compte de resultat','TREE.OHADA_RESULT_ACCOUNT','',144,'/modules/reports/ohada_profit_loss','/reports/ohada_profit_loss'),
  (216, 'Income Expenses by Year', 'REPORT.PROFIT_AND_LOSS_BY_YEAR', 'The Report of income and expenses', 144, '/modules/finance/income_expense_by_year', '/reports/income_expense_by_year'),
  (217, 'Tags','TREE.TAGS','', 1,'/modules/tags/tags','/tags'),
  (218, 'Fee Center Management','TREE.FEE_CENTER_MANAGEMENT','', 0,'/modules/fee_center','/fee_center'),
  (219, 'Fee Center Management','TREE.FEE_CENTER','', 218,'/modules/fee_center','/fee_center'),
  (220, 'Distributions fees Centers','TREE.DITRIBUTION_AUX_FEES_CENTERS','', 218,'/modules/distribution_center','/distribution_center'),
  (221, 'Update Distributions','TREE.UPDATE_DISTRIBUTION','', 218,'/modules/distribution_center/update','/distribution_center/update'),
  (222, 'Fee Center Report', 'TREE.FEE_CENTER_REPORT', 'Fee Center Report', 144, '/modules/reports/feeCenter', '/reports/feeCenter'),
  (223, 'Distribution keys', 'TREE.DISTRIBUTION_KEYS', 'Distribution keys', 218, '/modules/distribution_center/distribution_key', '/distribution_center/distribution_key'),
  (225, 'Stock Assignment','ASSIGN.STOCK_ASSIGN','', 160,'/modules/stock/assign','/stock/assign'),
  (226, 'Account Reference Type','TREE.ACCOUNT_REFERENCE_TYPE','Account Reference Type', 1,'/modules/account_reference_type','/account_reference_type'),
  (227, 'Ward Module', 'TREE.WARD', 'Ward folder', 0, '/modules/ward/configuration', '/WARD_FOLDER'),
  (228, 'Ward Configurations', 'TREE.WARD_CONFIGURATION', 'Ward configuration module', 227, '/modules/ward/configuration', '/ward/configuration'),
  (229, 'Visits Registry', 'TREE.VISITS_REGISTRY', 'Visits registry', 12, '/modules/patient/visits', '/patients/visits'),
  (230, 'Break Even Reference','TREE.BREAK_EVEN_REFERENCE','Break Even Reference', 1,'/modules/break_even_reference','/break_even_reference'),
  (231, 'Break-even Report', 'TREE.BREAK_EVEN_REPORT', 'Break-even Report', 144, '/modules/reports/breakEven', '/reports/breakEven'),
  (232, 'Break Even By Fee Center', 'TREE.BREAK_EVEN_FEE_CENTER_REPORT', 'Break-even By Fee Center Report', 144, '/modules/reports/breakEvenFeeCenter', '/reports/breakEvenFeeCenter'),
  (233, 'Dashboards Folder', 'TREE.DASHBOARDS.TITLE', 'Tableaux de bord', 0, '/modules/patient/visits', '/DASHBOARDS_FOLDER'),
  (234, 'Indicators Files Registry', 'TREE.DASHBOARDS.INDICATORS_FILES_REGISTRY', 'Registre des fiches des indicateurs', 233, '/modules/dashboards/indicators_files_registry/', '/dashboards/indicators_files_registry'),
  (235, 'Hospitalization dashboard', 'TREE.DASHBOARDS.HOSPITALIZATION', 'Tableau de bord des hospitalisations', 233, '/modules/dashboards/hospitalization/', '/dashboards/hospitalization'),
  (236, 'Human Resources dashboard', 'TREE.DASHBOARDS.HUMAN_RESOURCES', 'Tableau de bord du Personnel', 233, '/modules/dashboards/staff/', '/dashboards/staff'),
  (237, 'Finances dashboard', 'TREE.DASHBOARDS.FINANCES', 'Tableau de bord des finances', 233, '/modules/dashboards/finances/', '/dashboards/finances'),
  (238, 'Indicators report', 'TREE.INDICATORS_REPORT', 'Rapport sur les indicateurs', 144,'/modules/reports/indicatorsReport', '/reports/indicatorsReport'),
  (239, 'Visits Report', 'TREE.VISITS_REPORT', 'Visits registry', 144, '/modules/reports/visit_report', '/reports/visit_report'),
  (240, '[Stock] Stock Entry Report','TREE.STOCK_ENTRY_REPORT','Stock Entry Report', 144,'/modules/reports/generated/stock_entry','/reports/stock_entry'),
  (241, 'Entity Folder', 'ENTITY.MANAGEMENT', 'Entity Folder', 0, '/modules/entities', '/ENTITY_FOLDER'),
  (242, 'Entity Management','ENTITY.MANAGEMENT','',241,'/modules/entities','/entities'),
  (243, 'Entity Group', 'ENTITY.GROUP.TITLE', 'Entity Group', 241, '/modules/entity_group', '/entity_group'),
  (244, 'Monthly Balance', 'TREE.MONTHLY_BALANCE', 'Monthly Balance', 144, '/modules/reports/monthlyBalance', '/reports/monthlyBalance'),
  (245, 'Debtor summary report', 'REPORT.DEBTOR_SUMMARY.TITLE', 'Debtor summary report', 144, '/modules/reports/debtorSummary', '/reports/debtorSummary'),
  (246, 'Client debts report', 'TREE.CLIENT_DEBTS_REPORT', 'Client debts report', 144, '/modules/reports/clientDebts', '/reports/clientDebts'),
  (247, 'Client support report', 'TREE.CLIENT_SUPPORT_REPORT', 'Client support report', 144, '/modules/reports/clientSupport', '/reports/clientSupport'),
  (248, 'Analysis of cashboxes', 'REPORT.ANALYSIS_AUX_CASHBOXES.TITLE', 'Analysis of auxiliary cashboxes', 144, '/modules/reports/analysisAuxiliaryCash', '/reports/analysisAuxiliaryCash'),
  (249, 'Realized Profit Report', 'TREE.REALIZED_PROFIT_REPORT', 'Realized profit report', 144, '/modules/reports/realizedProfit', '/reports/realizedProfit'),
  (250, 'Sytem usage statistic', 'REPORT.SYSTEM_USAGE_STAT.TITLE', 'Sytem usage statistic', 144, '/modules/reports/systemUsageStat', '/reports/systemUsageStat'),
  (251, 'indexes', 'TREE.INDEXES','The payrall-index', 57,'/modules/finance/','/PAYROLL_INDEX_FOLDER'),
  (252, 'Staffing indexes management','TREE.STAFFING_INDICES_MANAGEMENT','Staffing indices management',251 ,'/modules/payroll/staffing_indice','/staffing_indices'),
  (253, 'Multiple Payroll by indice','TREE.MULTI_PAYROLL_INDICE','Multiple Payroll (indice)', 251,'/modules/multiple_payroll_indice','/multiple_payroll_indice'),
  (254, 'Data Collection', 'TREE.DATA_COLLECTION', '', 0, '/modules/data_collection', '/data_collection'),
  (255, 'Fill Form', 'TREE.FILL_FORM', '', 254, '/modules/fill_form', '/fill_form'),
  (256, 'Display Metadata', 'TREE.DISPLAY_METADATA', '', 254, '/modules/display_metadata', '/display_metadata'),
  (257, 'Data Kit', 'TREE.DATA_KIT', 'Data Kit', 254, '/modules/data_kit', '/data_kit'),
  (258, 'Data Collector Management', 'TREE.FORMS_MANAGEMENT', '', 257, '/modules/data_collector_management', '/data_collector_management'),
  (259, 'Choices list management', 'TREE.CHOICES_LIST_MANAGEMENT', '', 257, '/modules/choices_list_management', '/choices_list_management'),
  (260, 'Survey Form', 'TREE.FORMS_CONFIGURATION', '', 257, '/modules/survey_form', '/survey_form'),
  (261, 'Data Kit Report', 'TREE.DATA_KIT_REPORT', 'Data Kit Report', 144, '/modules/reports/dataKit', '/reports/dataKit'),
  (262, 'Stock Requisition','TREE.STOCK_REQUISITION','Stock Requisition', 160,'/modules/stock/stock_requisition','/stock/requisition'),
  (263, 'Configuration Analysis Tools','TREE.CONFIGURATION_ANALYSIS_TOOLS','Configuration Analysis Tools', 1,'/modules/configuration_analysis_tools','/configuration_analysis_tools'),
  (264, 'Configurable Analysis Report','TREE.CONFIGURABLE_ANALYSIS_REPORT','Configurable Analysis Report', 144,'/modules/reports/configurable_analysis_report','/reports/configurable_analysis_report'),
  (265, 'Purchase order analysis', 'TREE.PURCHASE_ORDER_ANALYSIS', 'Purchase order analysis', 144, '/modules/reports/purchaseOrderAnalysis', '/reports/purchaseOrderAnalysis'),
  (266, 'Inventory Changes Report', 'REPORT.INVENTORY_CHANGE.TITLE', 'Inventory Changes Report', 144, '/modules/reports/inventoryChanges', '/reports/inventoryChanges');


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
INSERT INTO `report` (`report_key`, `title_key`) VALUES
  ('cashflow', 'TREE.CASHFLOW'),
  ('accounts_chart', 'REPORT.CHART_OF_ACCOUNTS'),
  ('income_expense', 'REPORT.PROFIT_AND_LOSS'),
  ('balance_report', 'REPORT.BALANCE'),
  ('aged_debtors', 'TREE.AGED_DEBTORS'),
  ('account_report', 'REPORT.REPORT_ACCOUNTS.TITLE'),
  ('cashflowByService', 'TREE.CASHFLOW_BY_SERVICE'),
  ('open_debtors', 'REPORT.OPEN_DEBTORS.TITLE'),
  ('aged_creditors','TREE.AGED_CREDITORS'),
  ('balance_sheet_report', 'REPORT.BALANCE_SHEET.TITLE'),
  ('cash_report', 'REPORT.CASH_REPORT.TITLE'),
  ('inventory_report', 'REPORT.STOCK.TITLE'),
  ('inventory_file', 'REPORT.STOCK.INVENTORY_REPORT'),
  ('operating', 'TREE.OPERATING_ACCOUNT'),
  ('stock_exit', 'REPORT.STOCK.EXIT_REPORT'),
  ('annual-clients-report', 'REPORT.CLIENTS.TITLE'),
  ('employeeStanding', 'REPORT.EMPLOYEE_STANDING.TITLE'),
  ('patientStanding', 'REPORT.PATIENT_STANDING.TITLE'),
  ('ohada_balance_sheet_report', 'REPORT.OHADA.BALANCE_SHEET'),
  ('account_reference', 'REPORT.ACCOUNT_REFERENCE.TITLE'),
  ('account_report_multiple', 'REPORT.REPORT_ACCOUNTS_MULTIPLE.TITLE'),
  ('unpaid-invoice-payments', 'REPORT.UNPAID_INVOICE_PAYMENTS_REPORT.TITLE'),
  ('income_expense_by_month', 'REPORT.PROFIT_AND_LOSS_BY_MONTH'),
  ('stock_value', 'TREE.STOCK_VALUE'),
  ('ohada_profit_loss', 'TREE.OHADA_RESULT_ACCOUNT'),
  ('income_expense_by_year', 'REPORT.PROFIT_AND_LOSS_BY_YEAR'),
  ('feeCenter', 'REPORT.FEE_CENTER.TITLE'),
  ('breakEven', 'TREE.BREAK_EVEN_REPORT'),
  ('breakEvenFeeCenter', 'TREE.BREAK_EVEN_FEE_CENTER_REPORT'),
  ('indicatorsReport', 'TREE.INDICATORS_REPORT'),
  ('visit_report', 'PATIENT_RECORDS.REPORT.VISITS'),
  ('stock_entry', 'REPORT.STOCK.ENTRY_REPORT'),
  ('monthlyBalance', 'REPORT.MONTHLY_BALANCE.TITLE'),
  ('debtorSummary', 'REPORT.DEBTOR_SUMMARY.TITLE'),
  ('clientDebts', 'REPORT.CLIENT_SUMMARY.TITLE'),
  ('clientSupport', 'REPORT.CLIENT_SUPPORT.TITLE'),
  ('analysisAuxiliaryCash', 'REPORT.ANALYSIS_AUX_CASHBOXES.TITLE'),
  ('realizedProfit', 'REPORT.REALIZED.TITLE'),
  ('systemUsageStat', 'REPORT.SYSTEM_USAGE_STAT.TITLE'),
  ('dataKit', 'TREE.DATA_KIT_REPORT'),
  ('configurable_analysis_report', 'REPORT.CONFIGURABLE_ANALYSIS_REPORT.TITLE'),
  ('purchaseOrderAnalysis', 'REPORT.PURCHASE_ORDER_ANALYSIS.TITLE'),
  ('inventoryChanges', 'REPORT.INVENTORY_CHANGE.TITLE');

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

INSERT INTO `staffing_function_indice` (`uuid`, `value`, `fonction_id`) VALUES
(HUID('9ee06e4a-7b59-48e6-812c-c0f8a00cf7d3'), 60.0000, 1),
(HUID(uuid()), 125.0000, 2);

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

INSERT INTO `transaction_type` (`text`, `type`, `fixed`) VALUES
  ('VOUCHERS.SIMPLE.TRANSFER_AUXILIARY', 'expense', 1),
  ('VOUCHERS.SIMPLE.RECEPTION_FUNDS_AUXILIARY', 'income', 1),
  ('VOUCHERS.SIMPLE.PROVISIONING_PRINCIPAL', 'income', 1),
  ('VOUCHERS.SIMPLE.TRANSFER_FUNDS_BANKS', 'expense', 1),
  ('VOUCHERS.SIMPLE.EXIT_FUNDS_BANK', 'expense', 1),
  ('VOUCHERS.SIMPLE.BANK_CASH_APPROVALS', 'income', 1);

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

-- Default Account Reference Type
INSERT INTO `account_reference_type` (`id`, `label`, `fixed`) VALUES
(1, 'FORM.LABELS.FEE_CENTER', 1),
(2, 'FORM.LABELS.BALANCE_SHEET', 1),
(3, 'FORM.LABELS.PROFIT_LOSS', 1),
(4, 'FORM.LABELS.BREAK_EVEN', 1),
(5, 'FORM.LABELS.ANALYSIS_TOOLS.TITLE', 1);

-- Default Discharge types
INSERT INTO `discharge_type` (`id`, `label`) VALUES
  (1, 'PATIENT_RECORDS.DISCHARGE.REGULAR'),
  (2, 'PATIENT_RECORDS.DISCHARGE.ON_PATIENT_WILL'),
  (3, 'PATIENT_RECORDS.DISCHARGE.EMERGENCY'),
  (4, 'PATIENT_RECORDS.DISCHARGE.SERVICE_CHANGE'),
  (5, 'PATIENT_RECORDS.DISCHARGE.DEATH'),
  (6, 'PATIENT_RECORDS.DISCHARGE.EVASION'),
  (7, 'PATIENT_RECORDS.DISCHARGE.DISCHARGE_BUT_ON_BED'),
  (8, 'PATIENT_RECORDS.DISCHARGE.STATUQUO_CLINIC'),
  (9, 'PATIENT_RECORDS.DISCHARGE.TRANSFER');

-- indicators status values
INSERT INTO `indicator_status`(`id`, `text`,`translate_key`)VALUES
  (1, 'incomplete', 'FORM.LABELS.INCOMPLETE'),
  (2, 'complete', 'FORM.LABELS.COMPLETE'),
  (3, 'validated', 'FORM.LABELS.VALIDATED');

-- indicators types
INSERT INTO `indicator_type`(`id`, `text`,`translate_key`)VALUES
  (1, 'hospitalization', 'DASHBOARD.HOSPITALIZATION'),
  (2, 'staff', 'DASHBOARD.STAFF'),
  (3, 'fianance', 'DASHBOARD.FINANCE');

-- cron
-- NOTE(@jniles): the cron syntax for month is 0-indexed, but the cron
-- syntax for day is 1-indexed.
INSERT INTO `cron` (`label`, `value`) VALUES
  ('CRON.DAILY', '0 1 * * *'),
  ('CRON.WEEKLY', '0 1 * * 0'),
  ('CRON.MONTHLY', '0 1 30 * *'),
  ('CRON.YEARLY', '0 1 31 11 *');

-- Survey Form Type
INSERT INTO `survey_form_type` (`id`, `label`, `type`, `is_list`) VALUES
  (1, 'FORM.LABELS.NUMBER', 'number', 0),
  (2, 'FORM.LABELS.TEXT', 'text', 0),
  (3, 'FORM.LABELS.SELECT_ONE', 'select_one', 1),
  (4, 'FORM.LABELS.SELECT_MULTIPLE', 'select_multiple', 1),
  (5, 'FORM.LABELS.NOTE', 'note', 0),
  (6, 'FORM.LABELS.DATE', 'date', 0),
  (7, 'FORM.LABELS.TIME', 'time', 0),
  (8, 'FORM.LABELS.IMAGE', 'image', 0),
  (9, 'FORM.LABELS.CALCULATION', 'calculation', 0),
  (10, 'FORM.LABELS.TEXT_AREA', 'text_area', 0);

-- application process status
INSERT INTO `status` VALUES
  (1, 'in_progress', 'FORM.LABELS.STATUS_TYPE.IN_PROGRESS'),
  (2, 'done', 'FORM.LABELS.STATUS_TYPE.DONE'),
  (3, 'partially', 'FORM.LABELS.STATUS_TYPE.PARTIALLY'),
  (4, 'draft', 'FORM.LABELS.STATUS_TYPE.DRAFT'),
  (5, 'cancelled', 'FORM.LABELS.STATUS_TYPE.CANCELLED'),
  (6, 'completed', 'FORM.LABELS.STATUS_TYPE.COMPLETED');

-- type of requestors
INSERT INTO `stock_requestor_type` (`type_key`, `title_key`) VALUES
  ('service', 'FORM.LABELS.SERVICE'),
  ('depot', 'FORM.LABELS.DEPOT');

-- analysis_tool_type
INSERT INTO `analysis_tool_type` (`label`, `is_balance_sheet`, `rank`) VALUES
  ('FORM.LABELS.ANALYSIS_TOOLS.COSTS', 0, 1),
  ('FORM.LABELS.ANALYSIS_TOOLS.RECEIVABLES', 1, 4),
  ('FORM.LABELS.ANALYSIS_TOOLS.PROFITS', 0, 2),
  ('FORM.LABELS.ANALYSIS_TOOLS.DEBTS', 1, 1);
