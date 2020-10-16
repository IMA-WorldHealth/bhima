DELIMITER $$

-- Patient Triggers

CREATE TRIGGER patient_reference BEFORE INSERT ON patient
FOR EACH ROW
  SET NEW.reference = (SELECT IF(NEW.reference, NEW.reference, IFNULL(MAX(patient.reference) + 1, 1)) FROM patient WHERE patient.project_id = new.project_id);$$

CREATE TRIGGER patient_entity_map AFTER INSERT ON patient
FOR EACH ROW BEGIN

  -- this writes a patient entity into the entity_map table
  INSERT INTO entity_map
    SELECT new.uuid, CONCAT_WS('.', 'PA', project.abbr, new.reference) FROM project WHERE project.id = new.project_id ON DUPLICATE KEY UPDATE text=text;

  -- debtor entity reference removed to allow for reverse lookups - if debit
  -- entity is refined this can point directly to the debtor

  -- this writes a debtor entity into the entity_map table
  -- NOTE: the debtor actually points to the patient entity for convenience
  INSERT INTO entity_map
    SELECT new.debtor_uuid, CONCAT_WS('.', 'PA', project.abbr, new.reference) FROM project WHERE project.id = new.project_id ON DUPLICATE KEY UPDATE text=text;
END$$

-- Purchase Triggers

CREATE TRIGGER purchase_reference BEFORE INSERT ON purchase
FOR EACH ROW
  SET NEW.reference = (SELECT IF(NEW.reference, NEW.reference, IFNULL(MAX(purchase.reference) + 1, 1)) FROM purchase WHERE purchase.project_id = new.project_id);$$

CREATE TRIGGER purchase_document_map AFTER INSERT ON purchase
FOR EACH ROW BEGIN
  INSERT INTO document_map
    SELECT new.uuid, CONCAT_WS('.', 'PO', project.abbr, new.reference) FROM project WHERE project.id = new.project_id ON DUPLICATE KEY UPDATE text=text;
END$$


-- Invoice Triggers

CREATE TRIGGER invoice_reference BEFORE INSERT ON invoice
FOR EACH ROW
  SET NEW.reference = (SELECT IF(NEW.reference, NEW.reference, IFNULL(MAX(invoice.reference) + 1, 1)) FROM invoice WHERE invoice.project_id = new.project_id);$$

CREATE TRIGGER invoice_document_map AFTER INSERT ON invoice
FOR EACH ROW BEGIN
  INSERT INTO document_map
    SELECT new.uuid, CONCAT_WS('.', 'IV', project.abbr, new.reference) FROM project WHERE project.id = new.project_id ON DUPLICATE KEY UPDATE text=text;
END$$


-- Cash Payment Triggers

CREATE TRIGGER cash_before_insert BEFORE INSERT ON cash
FOR EACH ROW
  SET NEW.reference = (SELECT IF(NEW.reference, NEW.reference, IFNULL(MAX(cash.reference) + 1, 1)) FROM cash WHERE cash.project_id = new.project_id);$$

CREATE TRIGGER cash_document_map AFTER INSERT ON cash
FOR EACH ROW BEGIN
  INSERT INTO document_map
    SELECT new.uuid, CONCAT_WS('.', 'CP', project.abbr, new.reference) FROM project WHERE project.id = new.project_id ON DUPLICATE KEY UPDATE text=text;
END$$

-- Voucher Triggers

CREATE TRIGGER voucher_before_insert BEFORE INSERT ON voucher
FOR EACH ROW
  SET NEW.reference = (SELECT IF(NEW.reference, NEW.reference, IFNULL(MAX(voucher.reference) + 1, 1)) FROM voucher WHERE voucher.project_id = new.project_id);$$

CREATE TRIGGER voucher_document_map AFTER INSERT ON voucher
FOR EACH ROW BEGIN
  INSERT INTO document_map
    SELECT new.uuid, CONCAT_WS('.', 'VO', project.abbr, new.reference) FROM project WHERE project.id = new.project_id ON DUPLICATE KEY UPDATE text=text;
END$$


-- Employee Triggers

CREATE TRIGGER employee_before_insert BEFORE INSERT ON employee
FOR EACH ROW
  SET NEW.reference = (SELECT IF(NEW.reference, NEW.reference, IFNULL(MAX(employee.reference) + 1, 1)) FROM employee);$$

-- Must be fixed if the system is to manage multiple Enterprises at the same time, which would add the Enterprise identifier to each employee : @lomamech
CREATE TRIGGER employee_entity_map AFTER INSERT ON employee
FOR EACH ROW BEGIN
  INSERT INTO entity_map
    SELECT new.creditor_uuid, CONCAT_WS('.', 'EM', enterprise.abbr, new.reference) FROM enterprise ON DUPLICATE KEY UPDATE text=text;
END$$

-- Supplier Triggers

CREATE TRIGGER supplier_before_insert BEFORE INSERT ON supplier
FOR EACH ROW
  SET NEW.reference = (SELECT IF(NEW.reference, NEW.reference, IFNULL(MAX(supplier.reference) + 1, 1)) FROM supplier);$$

CREATE TRIGGER supplier_entity_map AFTER INSERT ON supplier
FOR EACH ROW BEGIN

  -- this writes the supplier's creditor into the entity_map, pointing to the supplier
  INSERT INTO entity_map
    SELECT new.creditor_uuid, CONCAT_WS('.', 'FO', new.reference) ON DUPLICATE KEY UPDATE text=text;
END$$

-- Stock Movement Triggers

-- the stock_movement reference is incremented based on the document_uuid.
CREATE TRIGGER stock_movement_reference BEFORE INSERT ON stock_movement
FOR EACH ROW
  SET NEW.reference = (SELECT IF(NEW.reference, NEW.reference, IFNULL(MAX(sm.reference) + 1, 1)) FROM stock_movement sm WHERE sm.document_uuid <> NEW.document_uuid);$$

-- compute the document map by simply concatenating the flux_id and the reference
CREATE TRIGGER stock_movement_document_map AFTER INSERT ON stock_movement
FOR EACH ROW BEGIN
  INSERT INTO `document_map` (uuid, text) VALUES (NEW.document_uuid, CONCAT_WS('.', 'SM', NEW.flux_id, NEW.reference))
  ON DUPLICATE KEY UPDATE uuid = NEW.document_uuid;
END$$

-- Stock Requisition Triggers
CALL add_column_if_missing("stock_requisition", "project_id", "SMALLINT(5) UNSIGNED NOT NULL AFTER `user_id`");

CREATE TRIGGER stock_requisition_reference BEFORE INSERT ON stock_requisition
FOR EACH ROW
  SET NEW.reference = (SELECT IF(NEW.reference, NEW.reference, IFNULL(MAX(stock_requisition.reference) + 1, 1)) FROM stock_requisition  WHERE stock_requisition.project_id = new.project_id);$$

CREATE TRIGGER stock_requisition_document_map AFTER INSERT ON stock_requisition
FOR EACH ROW BEGIN
  INSERT INTO document_map
    SELECT new.uuid, CONCAT_WS('.', 'SREQ', project.abbr, new.reference) FROM project WHERE project.id = new.project_id ON DUPLICATE KEY UPDATE text=text;
END$$

DELIMITER ;
