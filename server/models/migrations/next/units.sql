/*
Migration of the unit IDs to put reports in proper folders.
*/

INSERT IGNORE INTO unit (`id`, `name`, `key`, `description`, `parent`, `path`) VALUES
  (280, 'Hospital Reports', 'TREE.REPORTS', 'reports for the hospital modules', 12, '/HOSPITAL_FOLDER/reports'),
  (281, 'Finance Reports', 'TREE.REPORTS', 'reports for the accounting/finance module', 5, '/FINANCE_FOLDER/reports'),
  (282, 'Stock Reports', 'TREE.REPORTS', 'reports for the stock modules', 160, '/STOCK_FOLDER/reports'),
  (283, 'HR Reports', 'TREE.REPORTS', 'reports for the HR/Payroll modules', 57, '/PAYROLL_FOLDER/reports'),
  (284, 'Data Kit Reports', 'TREE.REPORTS', 'reports for the data collection modules', 254, '/data_collection/reports'),
  (285, 'Purchase Reports', 'TREE.REPORTS', 'reports for the purchasing modules', 154, '/PURCHASE_FOLDER/reports'),
  (286, 'Fee Center Reports', 'TREE.REPORTS', 'reports for the fee center modules', 218, '/fee_center/reports'),
  (287, 'Inventory Reports', 'TREE.REPORTS', 'reports for the inventory modules', 138, '/inventory/reports');

-- FINANCE

-- Cash Flow
UPDATE `unit` SET `parent` = 281 WHERE id = 145;

-- Cash Report
UPDATE `unit` SET `parent` = 281 WHERE id = 149;

-- Balance Sheet Report
UPDATE `unit` SET name = "Balance Sheet", `parent` = 281 WHERE id = 150;

-- Aged Debtors Report
UPDATE `unit` SET name = "Aged Debtors", `parent` = 281 WHERE id = 151;

-- Account Report
UPDATE `unit` SET `parent` = 281 WHERE id = 152;

-- Cashflow by Service
UPDATE `unit` SET `parent` = 281 WHERE id = 153;

-- Open Debtors
UPDATE `unit` SET `parent` = 281 WHERE id = 157;

-- Aged Creditors
UPDATE `unit` SET `parent` = 281 WHERE id = 168;

-- Account Statement (Simple)
UPDATE `unit` SET `parent` = 281 WHERE id = 170;

-- Profit and Loss Statement
UPDATE `unit` SET name = "Profit & Loss Statement", `parent` = 281 WHERE id = 180;

-- Compte d'Exploitation (PCGC P&L)
UPDATE `unit` SET name = "Operating Accounts Report", `parent` = 281 WHERE id = 192;

-- Annual Clients Report
UPDATE `unit` SET `parent` = 281 WHERE id = 199;

-- Bilan (OHADA Balance Sheet
UPDATE `unit` SET `parent` = 281 WHERE id = 206;

-- Account References Report
UPDATE `unit` SET `parent` = 281 WHERE id = 207;

-- Account Statement (Multiple)
UPDATE `unit` SET `parent` = 281 WHERE id = 209;

-- Monthly Analysis of Balance
UPDATE `unit` SET name = "Monthly Analysis of Balance", `parent` = 281 WHERE id = 244;

-- Unpaid/Unbalanced Invoices Report
UPDATE `unit` SET `parent` = 281 WHERE id = 210;

-- Proft and Loss by Month
UPDATE `unit` SET name = "Profit & Loss by Month", `parent` = 281 WHERE id = 211;

-- Compte de Resultat (OHADA P&L)
UPDATE `unit` SET `parent` = 281 WHERE id = 214;

-- Profit and Loss by Year
UPDATE `unit` SET name = "Profit & Loss by Year", `parent` = 281 WHERE id = 216;

-- Monthly Analysis of the Balance Sheet
UPDATE `unit` SET name = "Monthly Analysis of Balance", `parent` = 281 WHERE id = 244;

-- Debtor Summary Report
UPDATE `unit` SET `parent` = 281 WHERE id = 245;

-- Client Debts Report
UPDATE `unit` SET `parent` = 281 WHERE id = 246;

-- Debtor Summary Report
UPDATE `unit` SET `parent` = 281 WHERE id = 245;

-- Client Debts Report
UPDATE `unit` SET `parent` = 281 WHERE id = 246;

-- Client Support Report
UPDATE `unit` SET `parent` = 281 WHERE id = 247;

-- Analysis of Auxiliary Cashboxes
UPDATE `unit` SET `parent` = 281 WHERE id = 248;

-- Realized Profit Report
UPDATE `unit` SET `parent` = 281 WHERE id = 249;

-- Recovery Capacity Report
UPDATE `unit` SET name = "Recovery Capacity Report", `parent` = 281 WHERE id = 271;

-- Configurable Analysis Tools Report
UPDATE `unit` SET `parent` = 281 WHERE id = 264;

-- HOSPITAL REPORTS

-- Patient Standing Report
UPDATE `unit` SET `parent` = 280 WHERE id = 202;

-- Visit Report
UPDATE `unit` SET `parent` = 280 WHERE id = 239;

-- System Usage Statistics
UPDATE `unit` SET `parent` = 280 WHERE id = 250;

-- STOCK REPORTS

-- stock report
UPDATE `unit` SET `parent` = 282 WHERE id = 181;

-- stock sheet report
UPDATE `unit` SET `parent` = 282 WHERE id = 182;

-- stock exit report
UPDATE `unit` SET `parent` = 282 WHERE id = 197;

-- stock value report
UPDATE `unit` SET `parent` = 282 WHERE id = 213;

-- stock entry report
UPDATE `unit` SET `parent` = 282 WHERE id = 240;

-- monthly consumption report
UPDATE `unit` SET `parent` = 282 WHERE id = 267;

-- Consumption Graph
UPDATE `unit` SET `parent` = 282 WHERE id = 268;

-- Compare Invoiced to Received Report
UPDATE `unit` SET `parent` = 282 WHERE id = 270;

-- HR REPORTS

-- Employee Standing Report
UPDATE `unit` SET `parent` = 283 WHERE id = 201;

-- Data Kit Reports

-- Data Collect Report
UPDATE `unit` SET `parent` = 284 WHERE id = 261;

-- PURCHASE REPORTS

-- Purchase Order Analysis
UPDATE `unit` SET `parent` = 285 WHERE id = 265;

-- FEE CENTER REPORTS

-- Fee Center Report
UPDATE `unit` SET `parent` = 286 WHERE id = 222;

-- Break Even Report
UPDATE `unit` SET `parent` = 286 WHERE id = 231;

-- Break Even By Fee Center Report
UPDATE `unit` SET `parent` = 286 WHERE id = 232;

-- Indicator Report
UPDATE `unit` SET `parent` = 286 WHERE id = 238;

-- INVENTORY REPORTS

-- Inventory Changes Report
UPDATE `unit` SET `parent` = 287 WHERE id = 266;


-- remove previous report folder
DELETE FROM role_unit where unit_id = 144;
DELETE FROM unit WHERE id = 144;

-- update roles to reflect new permissions
CREATE TEMPORARY TABLE ru AS
  SELECT role_uuid, unit.parent as `unit_id` FROM role_unit JOIN unit ON role_unit.unit_id = unit.id;

-- ALTER TABLE `role_unit` ADD CONSTRAINT `tmp_ru_unique_key` UNIQUE (`role_uuid`, `unit_id`);

INSERT IGNORE INTO `role_unit` SELECT HUID(uuid()), role_uuid, unit_id FROM ru;

DROP TEMPORARY TABLE `ru`;
