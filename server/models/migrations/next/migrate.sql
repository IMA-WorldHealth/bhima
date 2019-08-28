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

-- rewrite PostToGeneralLedger
DELIMITER $$

DROP PROCEDURE PostToGeneralLedger$$
CREATE PROCEDURE PostToGeneralLedger()
BEGIN

  DECLARE isInvoice, isCash, isVoucher INT;

  -- write into the posting journal
  INSERT INTO general_ledger (
    project_id, uuid, fiscal_year_id, period_id, trans_id, trans_id_reference_number, trans_date,
    record_uuid, description, account_id, debit, credit, debit_equiv,
    credit_equiv, currency_id, entity_uuid, reference_uuid, comment, transaction_type_id, user_id
  ) SELECT project_id, uuid, fiscal_year_id, period_id, trans_id, trans_id_reference_number, trans_date, posting_journal.record_uuid,
    description, account_id, debit, credit, debit_equiv, credit_equiv, currency_id,
    entity_uuid, reference_uuid, comment, transaction_type_id, user_id
  FROM posting_journal JOIN stage_trial_balance_transaction AS staged
    ON posting_journal.record_uuid = staged.record_uuid;

  -- write into period_total
  INSERT INTO period_total (
    account_id, credit, debit, fiscal_year_id, enterprise_id, period_id
  )
  SELECT account_id, SUM(credit_equiv) AS credit, SUM(debit_equiv) as debit,
    fiscal_year_id, project.enterprise_id, period_id
  FROM posting_journal JOIN stage_trial_balance_transaction JOIN project
    ON posting_journal.record_uuid = stage_trial_balance_transaction.record_uuid
    AND project_id = project.id
  GROUP BY fiscal_year_id, period_id, account_id
  ON DUPLICATE KEY UPDATE credit = credit + VALUES(credit), debit = debit + VALUES(debit);

  -- remove from posting journal
  DELETE FROM posting_journal WHERE record_uuid IN (SELECT record_uuid FROM stage_trial_balance_transaction);

  -- Let specify that this invoice or the cash payment is posted
  SELECT COUNT(uuid) INTO isInvoice  FROM invoice  WHERE invoice.uuid IN (SELECT record_uuid FROM stage_trial_balance_transaction);
  SELECT COUNT(uuid) INTO isCash  FROM cash  WHERE cash.uuid IN (SELECT record_uuid FROM stage_trial_balance_transaction);
  SELECT COUNT(uuid) INTO isVoucher  FROM voucher  WHERE voucher.uuid IN (SELECT record_uuid FROM stage_trial_balance_transaction);

  IF isInvoice > 0 THEN
    UPDATE invoice SET posted = 1 WHERE uuid IN (SELECT record_uuid FROM stage_trial_balance_transaction);
  END IF;

  IF isCash > 0 THEN
    UPDATE cash SET posted = 1 WHERE uuid IN (SELECT record_uuid FROM stage_trial_balance_transaction);
  END IF;

  IF isVoucher > 0 THEN
    UPDATE voucher SET posted = 1 WHERE uuid IN (SELECT record_uuid FROM stage_trial_balance_transaction);
  END IF;

END $$

DELIMITER ;

/*
 @author: mbayopanda
 @date: 2019-08-22
 @description: issue #3856
*/
INSERT INTO `unit` VALUES 
  (246, 'Client debts report', 'TREE.CLIENT_DEBTS_REPORT', 'Client debts report', 144, '/modules/reports/clientDebts', '/reports/clientDebts');

INSERT INTO `report` (`id`, `report_key`, `title_key`) VALUES 
  (36, 'clientDebts', 'REPORT.CLIENT_SUMMARY.TITLE');