-- @jniles: remove tables that aren't supposed to be created or have been removed;
DROP TABLE IF EXISTS tmp_invoice_balances;
DROP TABLE IF EXISTS tmp_invoices_1;
DROP TABLE IF EXISTS tmp_invoices_2;
DROP TABLE IF EXISTS tmp_records;
DROP TABLE IF EXISTS tmp_references;

-- @jniles: remove 1.x tables (finally!)
DROP TABLE IF EXISTS mod_snis_zs;
DROP TABLE IF EXISTS consumption;
DROP TABLE IF EXISTS consumption_loss;
DROP TABLE IF EXISTS consumption_patient;
DROP TABLE IF EXISTS consumption_service;
DROP TABLE IF EXISTS journal_log;
