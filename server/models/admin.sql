DELIMITER $$

/*
 zRecomputeEntityMap

 Abolishes and recomputes the entity_map from the base tables in the system.  This is
 useful in case of database corruption in which references get out of sync.
*/
CREATE PROCEDURE zRecomputeEntityMap()
BEGIN
  DELETE FROM entity_map;

  -- patient
  INSERT INTO entity_map
    SELECT patient.uuid, CONCAT_WS('.', 'PA', project.abbr, patient.reference)
    FROM patient JOIN project ON patient.project_id = project.id;

  -- patient debtor
  INSERT INTO entity_map
    SELECT patient.debtor_uuid, CONCAT_WS('.', 'PA', project.abbr, patient.reference)
    FROM patient JOIN project ON patient.project_id = project.id;

  -- employee
  INSERT INTO entity_map
    SELECT employee.creditor_uuid, CONCAT_WS('.', 'EM', enterprise.abbr, employee.reference)
    FROM employee
    JOIN patient ON patient.uuid = employee.patient_uuid
    JOIN project ON project.id = patient.project_id
    JOIN enterprise ON enterprise.id = project.enterprise_id;

  -- supplier
  INSERT INTO entity_map
    SELECT supplier.creditor_uuid, CONCAT_WS('.', 'FO', supplier.reference) FROM supplier;
END $$

/*
 zRecomputeDocumentMap

 Abolishes and recomputes the document_map entries from the base tables in the
 database.  This is useful in case of data corruption.
*/
CREATE PROCEDURE zRecomputeDocumentMap()
BEGIN
  DELETE FROM document_map;

  -- cash payments
  INSERT INTO document_map
    SELECT cash.uuid, CONCAT_WS('.', 'CP', project.abbr, cash.reference)
    FROM cash JOIN project where project.id = cash.project_id;

  -- invoices
  INSERT INTO document_map
    SELECT invoice.uuid, CONCAT_WS('.', 'IV', project.abbr, invoice.reference)
    FROM invoice JOIN project where project.id = invoice.project_id;

  -- purchases
  INSERT INTO document_map
    SELECT purchase.uuid, CONCAT_WS('.', 'PO', project.abbr, purchase.reference)
    FROM purchase JOIN project where project.id = purchase.project_id;

  -- vouchers
  INSERT INTO document_map
    SELECT voucher.uuid, CONCAT_WS('.', 'VO', project.abbr, voucher.reference)
    FROM voucher JOIN project where project.id = voucher.project_id;

  -- stock_requisition
  INSERT INTO document_map
    SELECT stock_requisition.uuid, CONCAT_WS('.', 'SREQ', project.abbr, stock_requisition.reference)
    FROM stock_requisition JOIN project where project.id = stock_requisition.project_id;

  -- stock movements
  INSERT INTO `document_map`
    SELECT sm.document_uuid, CONCAT_WS('.', 'SM', sm.flux_id, sm.reference)
    FROM stock_movement sm
    ON DUPLICATE KEY UPDATE uuid = sm.document_uuid;
END $$

/*
 zRepostVoucher

 Removes the voucher record from the posting_journal and calls the PostVoucher() method on
 the record in the voucher table to re-post it to the journal.
*/
CREATE PROCEDURE zRepostVoucher(
  IN vUuid BINARY(16)
)
BEGIN
  DELETE FROM posting_journal WHERE posting_journal.record_uuid = vUuid;
  CALL PostVoucher(vUuid);
END $$

/*
 zRepostInvoice

 Removes the invoice record from the posting_journal and calls the PostInvoice() method on
 the record in the invoice table to re-post it to the journal.
*/
CREATE PROCEDURE zRepostInvoice(
  IN iUuid BINARY(16)
)
BEGIN
  DELETE FROM posting_journal WHERE posting_journal.record_uuid = iUuid;
  CALL PostInvoice(iUuid);
END $$

/*
 zRepostCash

 Removes the cash record from the posting_journal and calls the PostCash() method on
 the record in the cash table to re-post it to the journal.
*/
CREATE PROCEDURE zRepostCash(
  IN cUuid BINARY(16)
)
BEGIN
  DELETE FROM posting_journal WHERE posting_journal.record_uuid = cUuid;
  CALL VerifyCashTemporaryTables();
  CALL PostCash(cUuid);
END $$

/*
 zRecalculatePeriodTotals

 Removes all data from the period_total table and rebuilds it.
*/
CREATE PROCEDURE zRecalculatePeriodTotals()
BEGIN

  -- wipe the period total table
  DELETE FROM  period_total
  WHERE period_id IN (
    SELECT id
    FROM period
    WHERE number <> 0
  );

  INSERT INTO period_total (enterprise_id, fiscal_year_id, period_id, account_id, credit, debit)
    SELECT project.enterprise_id, period.fiscal_year_id, period_id, account_id, SUM(credit_equiv) AS credit, SUM(debit_equiv) AS debit
    FROM general_ledger
      JOIN period ON general_ledger.period_id = period.id
      JOIN project ON general_ledger.project_id = project.id
    GROUP BY account_id, period_id, fiscal_year_id, enterprise_id;

END $$


CREATE PROCEDURE zUpdatePatientText()
BEGIN
  UPDATE `debtor` JOIN `patient` ON debtor.uuid = patient.debtor_uuid
    SET debtor.text = CONCAT('Patient/', patient.display_name);
END $$

/*
CALL zMergeServices(fromId, toId);

DESCRIPTION
Merges two services by changing the service_uuid pointers to the new service and
then removing the previous service.
*/
DROP PROCEDURE IF EXISTS zMergeServices$$
CREATE PROCEDURE zMergeServices(
  IN from_service_uuid BINARY(16),
  IN to_service_uuid BINARY(16)
) BEGIN

  UPDATE invoice SET service_uuid = to_service_uuid WHERE service_uuid = from_service_uuid;
  UPDATE employee SET service_uuid = to_service_uuid WHERE service_uuid = from_service_uuid;
  UPDATE patient_visit_service SET service_uuid = to_service_uuid WHERE service_uuid = from_service_uuid;
  UPDATE ward SET service_uuid = to_service_uuid WHERE service_uuid = from_service_uuid;
  UPDATE service_fee_center SET service_uuid = to_service_uuid WHERE service_uuid = from_service_uuid;
  UPDATE indicator SET service_uuid = to_service_uuid WHERE service_uuid = from_service_uuid;
  DELETE FROM service WHERE id = from_service_uuid;
END $$

/*
CALL zMergeAccounts(fromId, toId);

DESCRIPTION
Merges two accounts by changing the account_id pointers to the new account and removing
the old one.  NOTE - you must call zRecalculatePeriodTotals() when all done with these
operations.  It isn't called here to allow operations to be batched for performance, then
committed.
*/
DROP PROCEDURE IF EXISTS zMergeAccounts $$
CREATE PROCEDURE zMergeAccounts(
  IN from_account_number TEXT,
  IN to_account_number TEXT
) BEGIN
  DECLARE from_account_id MEDIUMINT;
  DECLARE to_account_id MEDIUMINT;

  SET from_account_id = (SELECT id FROM account WHERE number = from_account_number);
  SET to_account_id = (SELECT id FROM account WHERE number = to_account_number);

  UPDATE general_ledger SET account_id = to_account_id WHERE account_id = from_account_id;
  UPDATE posting_journal SET account_id = to_account_id WHERE account_id = from_account_id;
  UPDATE voucher_item SET account_id = to_account_id WHERE account_id = from_account_id;
  DELETE FROM period_total where account_id = from_account_id;
  DELETE FROM account WHERE id = from_account_id;
END $$

/*
CALL zRecomputeStockMovementStatus()

DESCRIPTION
Recomputes the entire stock movement status table from the beginning
of time.
*/
DROP PROCEDURE IF EXISTS zRecomputeStockMovementStatus $$
CREATE PROCEDURE zRecomputeStockMovementStatus()
BEGIN

  DECLARE start_date DATE;
  DECLARE _depot_uuid BINARY(16);
  DECLARE done BOOLEAN DEFAULT FALSE;

  DECLARE depot_cursor CURSOR FOR
    SELECT depot.uuid FROM depot;

  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

  SET start_date = (SELECT MIN(DATE(date)) FROM stock_movement);

  OPEN depot_cursor;
  read_loop: LOOP
    FETCH depot_cursor INTO _depot_uuid;
    IF done THEN
      LEAVE read_loop;
    END IF;
    CREATE TEMPORARY TABLE `stage_inventory_for_amc` AS SELECT DISTINCT inventory_uuid FROM lot;
    CALL ComputeStockStatusForStagedInventory(start_date, _depot_uuid);
  END LOOP;

  CLOSE depot_cursor;
END $$


DROP PROCEDURE IF EXISTS  zUnpostRecord $$
CREATE PROCEDURE zUnpostRecord(
  IN _record_uuid BINARY(16)
)
BEGIN
  INSERT INTO posting_journal
    SELECT * FROM general_ledger WHERE record_uuid = _record_uuid;

  DELETE FROM general_ledger WHERE record_uuid = _record_uuid;
END$$

DROP PROCEDURE IF EXISTS  zMergeDepots$$
CREATE PROCEDURE zMergeDepots(
  IN _old_uuid BINARY(16),
  IN _new_uuid BINARY(16)
) BEGIN
  UPDATE stock_movement SET depot_uuid = _new_uuid WHERE depot_uuid = _old_uuid;
  DELETE FROM depot_distribution_permission WHERE depot_uuid = _old_uuid;
  UPDATE stock_assign SET depot_uuid = _new_uuid WHERE depot_uuid = _old_uuid;
  UPDATE stock_requisition SET depot_uuid = _new_uuid WHERE depot_uuid = _old_uuid;
  DELETE FROM stock_movement_status WHERE depot_uuid =  _old_uuid;
  DELETE FROM depot_permission WHERE depot_uuid =  _old_uuid;
  DELETE FROM depot WHERE uuid =  _old_uuid;
END$$


DELIMITER ;
