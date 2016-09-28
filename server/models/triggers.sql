
DELIMITER $$

-- Patient Triggers

CREATE TRIGGER patient_reference BEFORE INSERT ON patient
FOR EACH ROW SET NEW.reference = (SELECT IFNULL(MAX(reference) + 1, 1) FROM patient WHERE patient.project_id = new.project_id)$$

CREATE TRIGGER patient_entity_map AFTER INSERT ON patient
FOR EACH ROW BEGIN

  -- this writes a patient entity into the entity_map table
  INSERT INTO entity_map
    SELECT new.uuid, CONCAT_WS('.', 'P', project.abbr, new.reference) FROM project where project.id = new.project_id;

  -- this writes a debtor entity into the entity_map table
  -- NOTE: the debtor actually points to the patient entity for convienence
  INSERT INTO entity_map
    SELECT new.debtor_uuid, CONCAT_WS('.', 'P', project.abbr, new.reference) FROM project where project.id = new.project_id;
END$$



-- Purchase Triggers

CREATE TRIGGER purchase_reference BEFORE INSERT ON purchase
FOR EACH ROW SET NEW.reference = (SELECT IFNULL(MAX(reference) + 1, 1) FROM purchase WHERE purchase.project_id = new.project_id)$$


-- Invoice Triggers

CREATE TRIGGER invoice_reference BEFORE INSERT ON invoice
FOR EACH ROW SET NEW.reference = (SELECT IFNULL(MAX(reference) + 1, 1) FROM invoice WHERE invoice.project_id = new.project_id)$$

-- Cash Payment Triggers

CREATE TRIGGER cash_before_insert BEFORE INSERT ON cash
FOR EACH ROW SET NEW.reference = (SELECT IFNULL(MAX(reference) + 1, 1) FROM cash WHERE cash.project_id = new.project_id)$$

-- Credit Note Triggers
-- @FIXME - why are we still using a credit note table?

CREATE TRIGGER credit_note_before_insert BEFORE INSERT ON credit_note
FOR EACH ROW SET NEW.reference = (SELECT IFNULL(MAX(reference) + 1, 1) FROM credit_note WHERE credit_note.project_id = new.project_id)$$

-- Voucher Triggers

CREATE TRIGGER voucher_before_insert BEFORE INSERT ON voucher
FOR EACH ROW SET NEW.reference = (SELECT IFNULL(MAX(reference) + 1, 1) FROM voucher WHERE voucher.project_id = NEW.project_id)$$

-- Employee Triggers

CREATE TRIGGER employee_entity_map AFTER INSERT ON employee
FOR EACH ROW BEGIN

  -- Since employees do not have UUIDs or project associations, we create their mapping by simply concatenating
  -- the id with a prefix like this: E.{{employee.id}}.
  INSERT INTO entity_map SELECT new.debtor_uuid, CONCAT_WS('.', 'E', new.id);
END$$

-- Supplier Triggers

CREATE TRIGGER supplier_before_insert BEFORE INSERT ON supplier
FOR EACH ROW SET NEW.reference = (SELECT IFNULL(MAX(supplier.reference) + 1, 1) FROM supplier)$$

CREATE TRIGGER supplier_entity_map AFTER INSERT ON supplier
FOR EACH ROW BEGIN

  -- this writes the supplier's creditor into the entity_map, pointing to the supplier
  INSERT INTO entity_map
    SELECT new.creditor_uuid, CONCAT_WS('.', 'C', new.reference);
END$$

DELIMITER ;
