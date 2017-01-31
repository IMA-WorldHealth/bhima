DELIMITER $$

-- Patient Triggers

CREATE TRIGGER patient_reference BEFORE INSERT ON patient
FOR EACH ROW
  SET NEW.reference = (SELECT IF(NEW.reference, NEW.reference, IFNULL(MAX(patient.reference) + 1, 1)) FROM patient WHERE patient.project_id = new.project_id);$$

CREATE TRIGGER patient_entity_map AFTER INSERT ON patient
FOR EACH ROW BEGIN

  -- this writes a patient entity into the entity_map table
  INSERT INTO entity_map
    SELECT new.uuid, CONCAT_WS('.', 'PA', project.abbr, new.reference) FROM project where project.id = new.project_id;

  -- this writes a debtor entity into the entity_map table
  -- NOTE: the debtor actually points to the patient entity for convienence
  INSERT INTO entity_map
    SELECT new.debtor_uuid, CONCAT_WS('.', 'PA', project.abbr, new.reference) FROM project where project.id = new.project_id;
END$$

-- Purchase Triggers

CREATE TRIGGER purchase_reference BEFORE INSERT ON purchase
FOR EACH ROW
  SET NEW.reference = (SELECT IF(NEW.reference, NEW.reference, IFNULL(MAX(purchase.reference) + 1, 1)) FROM purchase WHERE purchase.project_id = new.project_id);$$

CREATE TRIGGER purchase_document_map AFTER INSERT ON purchase
FOR EACH ROW BEGIN
  INSERT INTO document_map
    SELECT new.uuid, CONCAT_WS('.', 'PO', project.abbr, new.reference) FROM project where project.id = new.project_id;
END$$


-- Invoice Triggers

CREATE TRIGGER invoice_reference BEFORE INSERT ON invoice
FOR EACH ROW
  SET NEW.reference = (SELECT IF(NEW.reference, NEW.reference, IFNULL(MAX(invoice.reference) + 1, 1)) FROM invoice WHERE invoice.project_id = new.project_id);$$

CREATE TRIGGER invoice_document_map AFTER INSERT ON invoice
FOR EACH ROW BEGIN
  INSERT INTO document_map
    SELECT new.uuid, CONCAT_WS('.', 'IV', project.abbr, new.reference) FROM project where project.id = new.project_id;
END$$


-- Cash Payment Triggers

CREATE TRIGGER cash_before_insert BEFORE INSERT ON cash
FOR EACH ROW
  SET NEW.reference = (SELECT IF(NEW.reference, NEW.reference, IFNULL(MAX(cash.reference) + 1, 1)) FROM cash WHERE cash.project_id = new.project_id);$$

CREATE TRIGGER cash_document_map AFTER INSERT ON cash
FOR EACH ROW BEGIN
  INSERT INTO document_map
    SELECT new.uuid, CONCAT_WS('.', 'CP', project.abbr, new.reference) FROM project where project.id = new.project_id;
END$$


-- Credit Note Triggers
-- @FIXME - why are we still using a credit note table?
CREATE TRIGGER credit_note_before_insert BEFORE INSERT ON credit_note
FOR EACH ROW
  SET NEW.reference = (SELECT IF(NEW.reference, NEW.reference, IFNULL(MAX(credit_note.reference) + 1, 1)) FROM credit_note WHERE credit_note.project_id = new.project_id);$$

CREATE TRIGGER credit_note_document_map AFTER INSERT ON credit_note
FOR EACH ROW BEGIN
  INSERT INTO document_map
    SELECT new.uuid, CONCAT_WS('.', 'CN', project.abbr, new.reference) FROM project where project.id = new.project_id;
END$$


-- Voucher Triggers

CREATE TRIGGER voucher_before_insert BEFORE INSERT ON voucher
FOR EACH ROW
  SET NEW.reference = (SELECT IF(NEW.reference, NEW.reference, IFNULL(MAX(voucher.reference) + 1, 1)) FROM voucher WHERE voucher.project_id = new.project_id);$$

CREATE TRIGGER voucher_document_map AFTER INSERT ON voucher
FOR EACH ROW BEGIN
  INSERT INTO document_map
    SELECT new.uuid, CONCAT_WS('.', 'VO', project.abbr, new.reference) FROM project where project.id = new.project_id;
END$$


-- Employee Triggers

CREATE TRIGGER employee_entity_map AFTER INSERT ON employee
FOR EACH ROW BEGIN

  -- Since employees do not have UUIDs or project associations, we create their mapping by simply concatenating
  -- the id with a prefix like this: E.{{employee.id}}.
  INSERT INTO entity_map SELECT new.debtor_uuid, CONCAT_WS('.', 'EM', new.id);
END$$


-- Supplier Triggers

CREATE TRIGGER supplier_before_insert BEFORE INSERT ON supplier
FOR EACH ROW
  SET NEW.reference = (SELECT IF(NEW.reference, NEW.reference, IFNULL(MAX(supplier.reference) + 1, 1)) FROM supplier);$$

CREATE TRIGGER supplier_entity_map AFTER INSERT ON supplier
FOR EACH ROW BEGIN

  -- this writes the supplier's creditor into the entity_map, pointing to the supplier
  INSERT INTO entity_map
    SELECT new.creditor_uuid, CONCAT_WS('.', 'FO', new.reference);
END$$

DELIMITER ;
