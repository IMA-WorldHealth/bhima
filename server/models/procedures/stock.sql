DELIMITER $$

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
	DECLARE v_cogs_account INT(10);
	DECLARE v_unit_cost DECIMAL(19, 4);
	DECLARE v_quantity INT(11);
	DECLARE v_document_uuid BINARY(16);
	DECLARE v_is_exit TINYINT(1);
  DECLARE v_item_description TEXT;
  DECLARE v_voucher_description TEXT;
  DECLARE v_depot_description TEXT;
  DECLARE v_patient_description TEXT;
  DECLARE v_service_description TEXT;
  DECLARE v_invoice_description TEXT;

  -- transaction type
  DECLARE STOCK_EXIT_TYPE SMALLINT(5) DEFAULT 13;
  DECLARE STOCK_ENTRY_TYPE SMALLINT(5) DEFAULT 14;

  -- variables for checking invalid accounts
  DECLARE ERR_INVALID_INVENTORY_ACCOUNTS CONDITION FOR SQLSTATE '45006';
  DECLARE v_has_invalid_accounts SMALLINT(5);

  -- cursor declaration
  DECLARE v_finished INTEGER DEFAULT 0;

  DECLARE stage_stock_movement_cursor CURSOR FOR
  	SELECT temp.stock_account, temp.cogs_account, temp.unit_cost, temp.quantity, temp.document_uuid, temp.is_exit, temp.item_description
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
        projectId as project_id, currencyId as currency_id,
        CONCAT(ig.name, ' - ', m.quantity, ' ', iu.text, ' of ', i.text , ' (', l.label, ')') AS item_description,
        m.uuid, m.description, m.date, m.flux_id, m.is_exit, m.document_uuid, m.quantity, m.unit_cost, m.user_id,
        ig.cogs_account, ig.stock_account, d.text AS depot_description,
        CONCAT(p.display_name, '(', em.text, ')') AS patient_description,
        s.name AS service_description, dm.text AS invoice_description
      FROM stock_movement m
      JOIN depot d ON d.uuid = m.depot_uuid
      JOIN lot l ON l.uuid = m.lot_uuid
      JOIN inventory i ON i.uuid = l.inventory_uuid
      JOIN inventory_unit iu ON iu.id = i.unit_id
      JOIN inventory_group ig
        ON ig.uuid = i.group_uuid AND (ig.stock_account IS NOT NULL AND ig.cogs_account IS NOT NULL)
      LEFT JOIN patient p ON p.uuid = m.entity_uuid
      LEFT JOIN entity_map em ON em.uuid = p.uuid
      LEFT JOIN service s ON s.uuid = m.entity_uuid 
      LEFT JOIN document_map dm ON dm.uuid = m.invoice_uuid
      WHERE m.document_uuid = documentUuid AND m.is_exit = isExit
    );

  -- define voucher variables
  SELECT HUID(UUID()), date, project_id, currency_id, user_id, description, SUM(unit_cost * quantity),
    depot_description, patient_description, service_description, invoice_description
    INTO voucher_uuid, voucher_date, voucher_project_id, voucher_currency_id, voucher_user_id, voucher_description, voucher_amount,
      v_depot_description, v_patient_description, v_service_description, v_invoice_description
  FROM stage_stock_movement;

  IF (isExit = 1) THEN
    SET voucher_type_id = STOCK_EXIT_TYPE;
    SET v_voucher_description = voucher_description;

    IF (v_depot_description IS NOT NULL AND v_service_description IS NOT NULL) THEN 
      SET voucher_description = CONCAT('Distribution to ', v_service_description, ' from ', v_depot_description, ' : ', v_voucher_description);
    END IF;

    IF (v_depot_description IS NOT NULL AND v_patient_description IS NOT NULL) THEN 
      SET voucher_description = CONCAT('Distribution to ', v_patient_description, ' from ', v_depot_description, ' : ', v_voucher_description);
    END IF;
    
    IF (v_depot_description IS NOT NULL AND v_patient_description IS NOT NULL AND v_invoice_description IS NOT NULL) THEN 
      SET voucher_description = CONCAT('Distribution to ', v_patient_description, ' invoiced by (', v_invoice_description, ') from ', v_depot_description, ' : ', v_voucher_description);
    END IF;
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

    FETCH stage_stock_movement_cursor INTO v_stock_account, v_cogs_account, v_unit_cost, v_quantity, v_document_uuid, v_is_exit, v_item_description;

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
    INSERT INTO voucher_item (uuid, account_id, debit, credit, voucher_uuid, document_uuid, description)
      VALUES (HUID(UUID()), voucher_item_account_debit, (v_unit_cost * v_quantity), 0, voucher_uuid, v_document_uuid, v_item_description);

    -- insert credit
    INSERT INTO voucher_item (uuid, account_id, debit, credit, voucher_uuid, document_uuid, description)
      VALUES (HUID(UUID()), voucher_item_account_credit, 0, (v_unit_cost * v_quantity), voucher_uuid, v_document_uuid, v_item_description);

  END LOOP insert_voucher_item;

  -- close the cursor
  CLOSE stage_stock_movement_cursor;

  -- drop the stage tabel
  DROP TEMPORARY TABLE stage_stock_movement;

  -- post voucher into journal
  CALL PostVoucher(voucher_uuid);

END $$

/*
  ---------------------------------------------------
  Add Missing Movement Reference
  ---------------------------------------------------
  Add the stock movement reference for movements which doesn't have
  document uuid in document_map table
*/
DROP PROCEDURE IF EXISTS AddMissingMovementReference$$
CREATE PROCEDURE AddMissingMovementReference()
BEGIN
  -- declaration
  DECLARE v_document_uuid BINARY(16);
  DECLARE v_reference INT(11);

  -- cursor variable declaration
  DECLARE v_finished INTEGER DEFAULT 0;

  -- cursor declaration
  DECLARE stage_missing_movement_document_cursor CURSOR FOR
  	SELECT temp.document_uuid
	FROM missing_movement_document as temp;

  -- variables for the cursor
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_finished = 1;

  -- temporary table for movement which doesn't have movement reference identifier
  DROP TABLE IF EXISTS missing_movement_document;

  CREATE TEMPORARY TABLE missing_movement_document (
    SELECT m.document_uuid FROM stock_movement m
    LEFT JOIN document_map dm ON dm.uuid IS NULL
    GROUP BY m.document_uuid
  );

  -- open the cursor
  OPEN stage_missing_movement_document_cursor;

  -- loop inside the cursor
  missing_document : LOOP

    /* fetch data into variables */
    FETCH stage_missing_movement_document_cursor INTO v_document_uuid;

    IF v_finished = 1 THEN
      LEAVE missing_document;
    END IF;

    CALL ComputeMovementReference(v_document_uuid);

  END LOOP missing_document;

  -- close the cursor
  CLOSE stage_missing_movement_document_cursor;

  DROP TEMPORARY TABLE missing_movement_document;
END $$


/*
  ---------------------------------------------------
  Import Stock Procedure
  ---------------------------------------------------
*/
DROP PROCEDURE IF EXISTS ImportStock;
CREATE PROCEDURE ImportStock (
  IN enterpriseId SMALLINT(5),
  IN projectId SMALLINT(5),
  IN userId SMALLINT(5),
  IN depotUuid BINARY(16),
  IN documentUuid BINARY(16),
  IN inventoryGroupName VARCHAR(100),
  IN inventoryCode VARCHAR(30),
  IN inventoryText VARCHAR(100),
  IN inventoryType VARCHAR(30),
  IN inventoryUnit VARCHAR(30),
  IN inventoryUnitCost DECIMAL(10, 4),
  IN inventoryCmm DECIMAL(10, 4),
  IN stockLotLabel VARCHAR(191),
  IN stockLotQuantity INT(11),
  IN stockLotExpiration DATE
)
BEGIN
  DECLARE existInventory TINYINT(1);
  DECLARE existLot TINYINT(1);

  DECLARE inventoryUuid BINARY(16);
  DECLARE integrationUuid BINARY(16);
  DECLARE lotUuid BINARY(16);
  DECLARE fluxId INT(11);

  /*
    =======================================================================
    check if the inventory exist
    =======================================================================

    if the inventory exists we will use it, if not we will create a new one
  */
  SET existInventory = (SELECT IF((SELECT COUNT(`text`) AS total FROM `inventory` WHERE `text` = inventoryText) > 0, 1, 0));

  IF (existInventory = 1) THEN

    /* the inventory exists so we have to get its uuid (inventoryUuid) for using it */
    SELECT inventory.uuid, inventory.code INTO inventoryUuid, inventoryCode FROM inventory WHERE `text` = inventoryText LIMIT 1;

  ELSE

    /* the inventory doesn't exists so we have to create a new one */
    IF (inventoryCode = NULL OR inventoryCode = '' OR inventoryCode = 'NULL') THEN

      /* if the inventory code is missing, create a new one randomly */
      SET inventoryCode = (SELECT ROUND(RAND() * 10000000));

    END IF;

    /* call the procedure ImportInventory for creating a new inventory and its dependencies */
    CALL ImportInventory(enterpriseId, inventoryGroupName, inventoryCode, inventoryText, inventoryType, inventoryUnit, inventoryUnitCost);

    /* set the inventory uuid */
    SET inventoryUuid = (SELECT `uuid` FROM inventory WHERE `text` = inventoryText AND `code` = inventoryCode);

  END IF;

  /* update the consumption (avg_consumption) */
  UPDATE inventory SET avg_consumption = inventoryCmm WHERE `uuid` = inventoryUuid;

  /*
    =======================================================================
    check if the lot exists in the depot
    =======================================================================

    if the lot exists we will use it, if not we will create a new one
  */
  SET existLot = (SELECT IF((SELECT COUNT(*) AS total FROM `stock_movement` JOIN `lot` ON `lot`.`uuid` = `stock_movement`.`lot_uuid` WHERE `stock_movement`.`depot_uuid` = depotUuid AND `lot`.`inventory_uuid` = inventoryUuid AND `lot`.`label` = stockLotLabel) > 0, 1, 0));

  IF (existLot = 1) THEN

    /* if the lot exist use its uuid */
    SET lotUuid = (SELECT `stock_movement`.`lot_uuid` FROM `stock_movement` JOIN `lot` ON `lot`.`uuid` = `stock_movement`.`lot_uuid` WHERE `stock_movement`.`depot_uuid` = depotUuid AND `lot`.`inventory_uuid` = inventoryUuid AND `lot`.`label` = stockLotLabel LIMIT 1);

  ELSE

    /* create integration info for the lot */
    SET integrationUuid = HUID(UUID());
    INSERT INTO integration (`uuid`, `project_id`, `date`)
    VALUES (integrationUuid, projectId, CURRENT_DATE());

    /* create the lot */
    SET lotUuid = HUID(UUID());
    INSERT INTO lot (`uuid`, `label`, `initial_quantity`, `quantity`, `unit_cost`, `expiration_date`, `inventory_uuid`, `origin_uuid`)
    VALUES (lotUuid, stockLotLabel, stockLotQuantity, stockLotQuantity, inventoryUnitCost, DATE(stockLotExpiration), inventoryUuid, integrationUuid);

  END IF;


  /* create the stock movement */
  /* 13 is the id of integration flux */
  SET fluxId = 13;
  INSERT INTO stock_movement (`uuid`, `document_uuid`, `depot_uuid`, `lot_uuid`, `flux_id`, `date`, `quantity`, `unit_cost`, `is_exit`, `user_id`)
  VALUES (HUID(UUID()), documentUuid, depotUuid, lotUuid, fluxId, CURRENT_DATE(), stockLotQuantity, inventoryUnitCost, 0, userId);

END $$

DROP PROCEDURE IF EXISTS `stockValue`$$
CREATE PROCEDURE `stockValue`(
  IN depotUuid BINARY(16), 
  IN dateTo DATE,
  IN currencyId INT
  )
BEGIN
  DECLARE done BOOLEAN;
  DECLARE mvtIsExit tinyint(1);
  DECLARE mvtQtt, stockQtt, newQuantity INT(11);
  DECLARE mvtUnitCost, mvtValue, newValue, newCost, exchangeRate, stockUnitCost, stockValue DECIMAL(19, 4);

  DECLARE _documentReference VARCHAR(100);
  DECLARE _date DATETIME;
  DECLARE _inventoryUuid BINARY(16);
  DECLARE _iteration, _newStock, _enterpriseId INT;


  DECLARE curs1 CURSOR FOR
    SELECT i.uuid, m.is_exit, l.unit_cost, m.quantity, m.date, dm.text AS documentReference
    FROM stock_movement m
    JOIN lot l ON l.uuid = m.lot_uuid
    JOIN inventory i ON i.uuid = l.inventory_uuid
    JOIN inventory_unit iu ON iu.id = i.unit_id
    JOIN depot d ON d.uuid = m.depot_uuid
    LEFT JOIN document_map dm ON dm.uuid = m.document_uuid
    WHERE m.depot_uuid = depotUuid AND DATE(m.date) <= dateTo
    ORDER BY i.text, m.created_at ASC;

  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

  DROP TEMPORARY TABLE IF EXISTS stage_movement;
  CREATE TEMPORARY TABLE stage_movement(
    inventory_uuid BINARY(16),
    isExit TINYINT(1),
    qtt INT(11),
    unit_cost DECIMAL(19, 4),
    VALUE DECIMAL(19, 4),
    DATE DATETIME,
    reference VARCHAR(100),
    stockQtt INT(11),
    stockUnitCost DECIMAL(19, 4),
    stockValue DECIMAL(19, 4),
    iteration INT
  );
 
  SET _enterpriseId = (SELECT enterprise_id FROM depot WHERE uuid= depotUuid);
  SET exchangeRate = IFNULL(GetExchangeRate(_enterpriseId,currencyId ,dateTo), 1);

  OPEN curs1;
    read_loop: LOOP

    FETCH curs1 INTO _inventoryUuid, mvtIsExit, mvtUnitCost, mvtQtt, _date, _documentReference;
      IF done THEN
        LEAVE read_loop;
      END IF;

      SELECT COUNT(inventory_uuid) INTO _newStock FROM stage_movement WHERE inventory_uuid = _inventoryUuid;
     
      -- initialize stock qtt, value and unit cost for a new inventory
      IF _newStock = 0 THEN
        SET _iteration = 0;
       
        SET stockQtt= 0;
        SET stockUnitCost = 0;
        SET stockValue = 0;
       
        SET mvtValue = 0;
        SET newQuantity = 0;
        SET newValue = 0;
        SET newCost = 0;
      END IF;
		
	    SET mvtUnitCost = mvtUnitCost * (exchangeRate);

      -- stock exit movement, the stock quantity decreases
      IF mvtIsExit = 1 THEN
        SET stockQtt = stockQtt - mvtQtt;
        SET stockValue = stockQtt * stockUnitCost;
        -- ignore negative stock value
        IF stockValue < 0 THEN
          SET stockValue = 0;
        END IF;
      ELSE
        -- stock entry movement, the stock quantity increases
	      SET newQuantity = mvtQtt + stockQtt;

        -- ignore negative stock value
        IF stockValue < 0 THEN
          SET newValue = mvtUnitCost * mvtQtt;
        ELSE 
          SET newValue = (mvtUnitCost * mvtQtt) + stockValue;
        END IF;

        -- don't use cumulated quantity when stock quantity < 0
        -- in this case use movement quantity only
        IF stockQtt < 0 THEN
          SET newCost = newValue / IF(mvtQtt = 0, 1, mvtQtt);
        ELSE 
          SET newCost = newValue / IF(newQuantity = 0, 1, newQuantity);
        END IF;

        SET stockQtt = newQuantity;
        SET stockUnitCost = newCost;
        SET stockValue = newValue;
      END IF;

      INSERT INTO stage_movement VALUES (
        _inventoryUuid, mvtIsExit, mvtQtt, stockQtt, mvtQtt * mvtUnitCost, _date, _documentReference,  stockQtt, stockUnitCost, stockValue, _iteration
      );
      SET _iteration = _iteration + 1;
    END LOOP;
  CLOSE curs1;

  DROP TEMPORARY TABLE IF EXISTS stage_movement_copy;
  CREATE TEMPORARY TABLE stage_movement_copy AS SELECT * FROM stage_movement;

  -- inventory stock
  SELECT  BUID(sm.inventory_uuid) AS inventory_uuid, i.text as inventory_name,  sm.stockQtt, sm.stockUnitCost, sm.stockValue
  FROM stage_movement sm
  JOIN inventory i ON i.uuid = sm.inventory_uuid
  INNER JOIN (
    SELECT inventory_uuid, MAX(iteration) as max_iteration
    FROM stage_movement_copy
    GROUP BY inventory_uuid
  )x ON x.inventory_uuid = sm.inventory_uuid AND x.max_iteration = sm.iteration 
  ORDER BY i.text ASC;

  -- total in stock
  SELECT SUM(sm.stockValue) as total
  FROM stage_movement as sm
  INNER JOIN (
    SELECT inventory_uuid, MAX(iteration) as max_iteration
    FROM stage_movement_copy
    GROUP BY inventory_uuid
  )x ON x.inventory_uuid = sm.inventory_uuid AND x.max_iteration = sm.iteration;

END $$

DELIMITER ;
