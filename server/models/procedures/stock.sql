-- stock consumption
CREATE PROCEDURE ComputeStockConsumptionByPeriod (
  IN inventory_uuid BINARY(16),
  IN depot_uuid BINARY(16),
  IN period_id MEDIUMINT(8),
  IN movementQuantity INT(11)
)
BEGIN
  INSERT INTO `stock_consumption` (`inventory_uuid`, `depot_uuid`, `period_id`, `quantity`) VALUES
    (inventory_uuid, depot_uuid, period_id, movementQuantity)
  ON DUPLICATE KEY UPDATE `quantity` = `quantity` + movementQuantity;
END $$

-- compute stock consumption
CREATE PROCEDURE ComputeStockConsumptionByDate (
  IN inventory_uuid BINARY(16),
  IN depot_uuid BINARY(16),
  IN movementDate DATE,
  IN movementQuantity INT(11)
)
BEGIN
  INSERT INTO `stock_consumption` (`inventory_uuid`, `depot_uuid`, `period_id`, `quantity`)
    SELECT inventory_uuid, depot_uuid, p.id, movementQuantity
    FROM period p
    WHERE DATE(movementDate) BETWEEN DATE(p.start_date) AND DATE(p.end_date)
  ON DUPLICATE KEY UPDATE `quantity` = `quantity` + movementQuantity;
END $$

-- stock movement document reference
-- This procedure calculate the reference of a movement based on the document_uuid
-- Insert this reference calculated into the document_map table as the movement reference
CREATE PROCEDURE ComputeMovementReference (
  IN documentUuid BINARY(16)
)
BEGIN
  DECLARE reference INT(11);
  DECLARE flux INT(11);

  SET reference = (SELECT COUNT(DISTINCT document_uuid) AS total FROM stock_movement LIMIT 1);
  SET flux = (SELECT flux_id FROM stock_movement WHERE document_uuid = documentUuid LIMIT 1);

  INSERT INTO `document_map` (uuid, text)
  VALUES (documentUuid, CONCAT_WS('.', 'SM', flux, reference))
  ON DUPLICATE KEY UPDATE uuid = uuid;
END $$

-- post stock movement into vouchers
DROP PROCEDURE IF EXISTS PostStockMovement;
CREATE PROCEDURE PostStockMovement (
  IN documentUuid BINARY(16),
  IN isExit TINYINT(1),
  IN projectId SMALLINT(5),
  IN currencyId SMALLINT(5)
)
BEGIN
  -- voucher
  DECLARE voucher_uuid BINARY(16);
  DECLARE voucher_date DATETIME;
  DECLARE voucher_project_id SMALLINT(5);
  DECLARE voucher_currency_id SMALLINT(5);
  DECLARE voucher_user_id SMALLINT(5);
  DECLARE voucher_type_id SMALLINT(3);
  DECLARE voucher_description TEXT;
  DECLARE voucher_amount DECIMAL(19, 4);

  -- voucher item
  DECLARE voucher_item_uuid BINARY(16);
  DECLARE voucher_item_account INT(10);
  DECLARE voucher_item_account_debit DECIMAL(19, 4);
  DECLARE voucher_item_account_credit DECIMAL(19, 4);
  DECLARE voucher_item_voucher_uuid BINARY(16);
  DECLARE voucher_item_document_uuid BINARY(16);
  
  -- variables
	DECLARE v_stock_account INT(10);
  DECLARE v_stock_movement_reference INT(10);
	DECLARE v_cogs_account INT(10);
	DECLARE v_unit_cost DECIMAL(19, 4);
	DECLARE v_quantity INT(11);
	DECLARE v_document_uuid BINARY(16);
	DECLARE v_is_exit TINYINT(1);

  -- transaction type 
  DECLARE STOCK_EXIT_TYPE SMALLINT(5) DEFAULT 13;
  DECLARE STOCK_ENTRY_TYPE SMALLINT(5) DEFAULT 14;

  -- variables for checking invalid accounts
  DECLARE ERR_INVALID_INVENTORY_ACCOUNTS CONDITION FOR SQLSTATE '45006';
  DECLARE v_has_invalid_accounts SMALLINT(5);
  
  -- cursor declaration
  DECLARE v_finished INTEGER DEFAULT 0;
  
  DECLARE stage_stock_movement_cursor CURSOR FOR 
  	SELECT temp.stock_account, temp.cogs_account, temp.unit_cost, temp.quantity, temp.document_uuid, temp.is_exit, temp.reference
	FROM stage_stock_movement as temp;
  
  -- variables for the cursor
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_finished = 1;

  -- Check that every inventory has a stock account and a variation account 
  -- if they do not, the transaction will be Unbalanced, so the operation will not continue
  SELECT COUNT(l.uuid) 
    INTO v_has_invalid_accounts
  FROM stock_movement AS sm
  JOIN lot l ON l.uuid = sm.lot_uuid
  JOIN inventory i ON i.uuid = l.inventory_uuid
  JOIN inventory_group ig ON ig.uuid = i.group_uuid
  WHERE ig.stock_account IS NULL AND ig.cogs_account IS NULL AND sm.document_uuid = documentUuid AND sm.is_exit = isExit;

  IF (v_has_invalid_accounts > 0) THEN 
    SIGNAL ERR_INVALID_INVENTORY_ACCOUNTS SET MESSAGE_TEXT = 'Every inventory should belong to a group with a cogs account and stock account.';
  END IF;

  -- temporarise the stock movement
  CREATE TEMPORARY TABLE stage_stock_movement (
      SELECT 
        m.reference, 
        projectId as project_id, currencyId as currency_id,
        m.uuid, m.description, m.date, m.flux_id, m.is_exit, m.document_uuid, m.quantity, m.unit_cost, m.user_id,
        ig.cogs_account, ig.stock_account 
      FROM stock_movement m  
      JOIN lot l ON l.uuid = m.lot_uuid 
      JOIN inventory i ON i.uuid = l.inventory_uuid 
      JOIN inventory_group ig 
        ON ig.uuid = i.group_uuid AND (ig.stock_account IS NOT NULL AND ig.cogs_account IS NOT NULL) 
      WHERE m.document_uuid = documentUuid AND m.is_exit = isExit
    );

  -- define voucher variables
  SELECT HUID(UUID()), date, project_id, currency_id, user_id, description, SUM(unit_cost * quantity) 
    INTO voucher_uuid, voucher_date, voucher_project_id, voucher_currency_id, voucher_user_id, voucher_description, voucher_amount 
  FROM stage_stock_movement;

  IF (isExit = 1) THEN 
    SET voucher_type_id = STOCK_EXIT_TYPE;
  ELSE
    SET voucher_type_id = STOCK_ENTRY_TYPE;
  END IF;

  -- insert into voucher
  INSERT INTO voucher (uuid, date, project_id, currency_id, user_id, type_id, description, amount) VALUES (
    voucher_uuid, voucher_date, voucher_project_id, voucher_currency_id, voucher_user_id,
    voucher_type_id, voucher_description, voucher_amount
  );

  -- handle voucher items via cursor
  OPEN stage_stock_movement_cursor;

  -- loop in the cursor
  insert_voucher_item : LOOP

    FETCH stage_stock_movement_cursor INTO v_stock_account, v_cogs_account, v_unit_cost, v_quantity, v_document_uuid, v_is_exit, v_stock_movement_reference;

    IF v_finished = 1 THEN 
      LEAVE insert_voucher_item;
    END IF;

    if (v_is_exit = 1) THEN
      SET voucher_item_account_debit = v_cogs_account;
      SET voucher_item_account_credit = v_stock_account;
    ELSE
      SET voucher_item_account_debit = v_stock_account;
      SET voucher_item_account_credit = v_cogs_account;
    END IF;

    -- insert debit
    INSERT INTO voucher_item (uuid, account_id, debit, credit, voucher_uuid, document_uuid, stock_movement_reference)
      VALUES (HUID(UUID()), voucher_item_account_debit, (v_unit_cost * v_quantity), 0, voucher_uuid, v_document_uuid, v_stock_movement_reference);

    -- insert credit
    INSERT INTO voucher_item (uuid, account_id, debit, credit, voucher_uuid, document_uuid, stock_movement_reference)
      VALUES (HUID(UUID()), voucher_item_account_credit, 0, (v_unit_cost * v_quantity), voucher_uuid, v_document_uuid, v_stock_movement_reference);

  END LOOP insert_voucher_item;

  -- close the cursor
  CLOSE stage_stock_movement_cursor;

  -- drop the stage tabel
  DROP TEMPORARY TABLE stage_stock_movement;

  -- post voucher into journal
  CALL PostVoucher(voucher_uuid);

END $$
