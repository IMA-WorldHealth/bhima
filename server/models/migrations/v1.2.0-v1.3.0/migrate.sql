-- @jniles: remove tables that aren't supposed to be created or have been removed;
DROP TABLE IF EXISTS tmp_invoice_balances;
DROP TABLE IF EXISTS tmp_invoices_1;
DROP TABLE IF EXISTS tmp_invoices_2;
DROP TABLE IF EXISTS tmp_records;
DROP TABLE IF EXISTS tmp_references;

-- @jniles: remove 1.x tables (finally!)
DROP TABLE IF EXISTS mod_snis_zs;
DROP TABLE IF EXISTS consumption_loss;
DROP TABLE IF EXISTS consumption_patient;
DROP TABLE IF EXISTS consumption_service;
DROP TABLE IF EXISTS consumption;
DROP TABLE IF EXISTS journal_log;

DROP TABLE IF EXISTS cost_center_assignation_item;
DROP TABLE IF EXISTS cost_center_assignation;

-- foriegn key on account_ibfk_3
ALTER TABLE account DROP FOREIGN KEY `account_ibfk_3`;
ALTER TABLE account DROP COLUMN cc_id;

ALTER TABLE posting_journal DROP FOREIGN KEY `posting_journal_ibfk_7` ;
ALTER TABLE posting_journal DROP COLUMN cc_id;
ALTER TABLE posting_journal DROP FOREIGN KEY `posting_journal_ibfk_8` ;
ALTER TABLE posting_journal DROP COLUMN pc_id;

ALTER TABLE general_ledger DROP FOREIGN KEY `general_ledger_ibfk_7` ;
ALTER TABLE general_ledger DROP COLUMN cc_id;
ALTER TABLE general_ledger DROP FOREIGN KEY `general_ledger_ibfk_8` ;
ALTER TABLE general_ledger DROP COLUMN pc_id;

-- UNIQUE KEY on service's cost_center and profit_center
ALTER TABLE service DROP KEY `service_2`;
ALTER TABLE service DROP FOREIGN KEY `service_ibfk_2`;
ALTER TABLE service DROP COLUMN cost_center_id;
ALTER TABLE service DROP FOREIGN KEY `service_ibfk_3`;
ALTER TABLE service DROP COLUMN profit_center_id;

DROP TABLE IF EXISTS profit_center;
DROP TABLE IF EXISTS cost_center;

/*
 @author: mbayopanda
 @date: 2019-08-22
 @description: issue #3856
*/
INSERT INTO `unit` VALUES 
  (246, 'Client debts report', 'TREE.CLIENT_DEBTS_REPORT', 'Client debts report', 144, '/modules/reports/clientDebts', '/reports/clientDebts'),
  (247, 'Client support report', 'TREE.CLIENT_SUPPORT_REPORT', 'Client support report', 144, '/modules/reports/clientSupport', '/reports/clientSupport');

INSERT INTO `report` (`id`, `report_key`, `title_key`) VALUES 
  (36, 'clientDebts', 'REPORT.CLIENT_SUMMARY.TITLE'),
  (37, 'clientSupport', 'REPORT.CLIENT_SUPPORT.TITLE');

-- author: lomamech
-- date: 2019-08-30
-- Analysis of auxiliary cashboxes.
INSERT INTO unit VALUES
  (248, 'Analysis of cashboxes', 'REPORT.ANALYSIS_AUX_CASHBOXES.TITLE', 'Analysis of auxiliary cashboxes', 144, '/modules/reports/analysisAuxiliaryCash', '/reports/analysisAuxiliaryCash');

INSERT INTO report (id, report_key, title_key) VALUES
  (38, 'analysisAuxiliaryCash', 'REPORT.ANALYSIS_AUX_CASHBOXES.TITLE');
