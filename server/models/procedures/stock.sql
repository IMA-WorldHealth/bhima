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

  DECLARE sm_flux_id INT(11);
  DECLARE ss_enable_supplier_credit TINYINT(1) DEFAULT 0;
  DECLARE FROM_PURCHASE_FLUX_ID INT(11) DEFAULT 1;

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
    SIGNAL ERR_INVALID_INVENTORY_ACCOUNTS SET MESSAGE_TEXT = 'Every inventory should belong to a group with a COGS account and stock account.';
  END IF;

  -- temporary table for the stock movement
  CREATE TEMPORARY TABLE stage_stock_movement (
      SELECT
        projectId as project_id, currencyId as currency_id,
        CONCAT(ig.name, ' - ', m.quantity, ' ', iu.text, ' of ', i.text , ' (', l.label, ')') AS item_description,
        m.uuid, m.description, m.date, m.flux_id, m.is_exit, m.document_uuid, m.quantity, m.unit_cost, m.user_id,
        ig.cogs_account, ig.stock_account
      FROM stock_movement m
      JOIN depot d ON d.uuid = m.depot_uuid
      JOIN lot l ON l.uuid = m.lot_uuid
      JOIN inventory i ON i.uuid = l.inventory_uuid
      JOIN inventory_unit iu ON iu.id = i.unit_id
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

  -- get the flux id
  SET sm_flux_id = (SELECT flux_id FROM stock_movement WHERE document_uuid = documentUuid AND is_exit = isExit LIMIT 1);

  -- check if enable_supplier_credit is set for this enterprise
  SET ss_enable_supplier_credit = (
    SELECT enable_supplier_credit FROM stock_setting AS es
      JOIN enterprise AS e ON e.id = es.enterprise_id
      JOIN project AS p ON e.id = p.enterprise_id
    WHERE p.id = projectId
  );

  -- if this is from a purchase, grap the supplier's account as the account to credit in the voucher, not
  -- the COGS account
  IF (sm_flux_id = FROM_PURCHASE_FLUX_ID AND ss_enable_supplier_credit = 1) THEN
    SET voucher_item_account_credit = (
      SELECT creditor_group.account_id FROM purchase
        JOIN supplier ON purchase.supplier_uuid = supplier.uuid
        JOIN creditor ON supplier.creditor_uuid = creditor.uuid
        JOIN creditor_group ON creditor_group.uuid = creditor.group_uuid
      WHERE purchase.uuid IN (
        SELECT entity_uuid FROM stock_movement WHERE document_uuid = documentUuid AND is_exit = isExit
      )
    );
  END IF;

  -- insert into voucher
  INSERT INTO voucher (uuid, date, project_id, currency_id, user_id, type_id, description, amount) VALUES (
    voucher_uuid, voucher_date, voucher_project_id, voucher_currency_id, voucher_user_id,
    voucher_type_id, voucher_description, voucher_amount
  );

  -- handle voucher items via cursor
  OPEN stage_stock_movement_cursor;

  -- create a temporary table for voucher credit items
  CREATE TEMPORARY TABLE tmp_voucher_credit_item (
    `account_id`      INT UNSIGNED NOT NULL,
    `debit`           DECIMAL(19,4) UNSIGNED NOT NULL DEFAULT 0.0000,
    `credit`          DECIMAL(19,4) UNSIGNED NOT NULL DEFAULT 0.0000
  );

  -- loop in the cursor
  insert_voucher_item : LOOP
    FETCH stage_stock_movement_cursor INTO v_stock_account, v_cogs_account, v_unit_cost, v_quantity, v_document_uuid, v_is_exit, v_item_description;

    IF v_finished = 1 THEN
      LEAVE insert_voucher_item;
    END IF;

    if (v_is_exit = 1) THEN
      SET voucher_item_account_debit = v_cogs_account;
      SET voucher_item_account_credit = v_stock_account;
    ELSEIF (sm_flux_id = FROM_PURCHASE_FLUX_ID AND ss_enable_supplier_credit = 1) THEN
      -- we already set the credit account above for the purchase case
      SET voucher_item_account_debit = v_stock_account;
    ELSE
      SET voucher_item_account_debit = v_stock_account;
      SET voucher_item_account_credit = v_cogs_account;
    END IF;

    -- insert debit
    INSERT INTO voucher_item (uuid, account_id, debit, credit, voucher_uuid, document_uuid, description)
      VALUES (HUID(UUID()), voucher_item_account_debit, (v_unit_cost * v_quantity), 0, voucher_uuid, v_document_uuid, v_item_description);

    -- insert credit into temporary table for later aggregation.
    INSERT INTO tmp_voucher_credit_item (account_id, debit, credit)
      VALUES (voucher_item_account_credit, 0, (v_unit_cost * v_quantity));

  END LOOP insert_voucher_item;

  -- write the credit lines
  INSERT INTO voucher_item (uuid, account_id, debit, credit, voucher_uuid, document_uuid, description)
    SELECT HUID(UUID()), tmp_v.account_id, SUM(tmp_v.debit), SUM(tmp_v.credit), voucher_uuid, documentUuid, voucher_description
    FROM tmp_voucher_credit_item AS tmp_v
    GROUP BY tmp_v.account_id;

  -- close the cursor
  CLOSE stage_stock_movement_cursor;

  -- drop the stage tabel
  DROP TEMPORARY TABLE stage_stock_movement;
  DROP TEMPORARY TABLE tmp_voucher_credit_item;

  -- post voucher into journal
  CALL PostVoucher(voucher_uuid);
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
  IN stockLotExpiration DATE,
  IN periodId MEDIUMINT(8)
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
  INSERT INTO stock_movement (`uuid`, `document_uuid`, `depot_uuid`, `lot_uuid`, `flux_id`, `date`, `quantity`, `unit_cost`, `is_exit`, `user_id`, `period_id`)
  VALUES (HUID(UUID()), documentUuid, depotUuid, lotUuid, fluxId, CURRENT_DATE(), stockLotQuantity, inventoryUnitCost, 0, userId, periodId);
END $$

-- the main procedure that loops through stock_movement , retrieve and caculate cmm data
/*
CALL computeStockQuantity(startDate, inventoryUuid, depotUuid);

DESCRIPTION
Computes the quantity in stock from the startDate until now for a given inventoryUuid.

Originally written by @jeremielodi
*/

DELIMITER $$

DROP PROCEDURE IF EXISTS `computeStockQuantity`$$
CREATE PROCEDURE `computeStockQuantity` (
  IN _start_date DATE,
  IN _inventory_uuid BINARY(16),
  IN _depot_filter_uuid BINARY(16)
) BEGIN
  DECLARE done BOOLEAN;
  DECLARE _depot_uuid, _row_uuid BINARY(16);
  DECLARE _end_date DATE;
  DECLARE _qtt, _in_qtt, _out_qtt DECIMAL(19, 4);




  DROP TEMPORARY TABLE IF EXISTS `temp_stock_movement`;

    -- every stock movement for a inventory will be stored here in order to facilitate search
  CREATE TEMPORARY TABLE `temp_stock_movement` (
    `reference` INT,
    `date` DATE,
    `depot_uuid` BINARY(16),
    `inventory_uuid` BINARY(16),
    `quantity` DECIMAL(19,4),
    `in_quantity` DECIMAL(19,4),
    `out_quantity` DECIMAL(19,4),
    `is_exit` TINYINT(2),
    KEY `depot_uuid` (`depot_uuid`),
    KEY `inventory_uuid` (`inventory_uuid`),
    KEY `reference` (`reference`)
  ) ENGINE=InnoDB DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;

  -- every stock movement for a inventory will be stored here in order to facilitate search
  CREATE TEMPORARY TABLE IF NOT EXISTS `temp_depot` (
    `reference` INT,
    `uuid` BINARY(16),
    `text` varchar(100),
    KEY `uuid` (`uuid`),
    KEY `reference` (`reference`)
  ) ENGINE=InnoDB DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;

  SET _end_date = NOW();
  SET _start_date = DATE(_start_date);
  SET @depot_number = 0;

  DELETE FROM `temp_depot` WHERE 1;

  SET @filter_by_depot = (_depot_filter_uuid IS NOT NULL);

  IF @filter_by_depot = 0  THEN -- will compute inventory's quantity in each depot
    INSERT INTO `temp_depot`
    SELECT (@depot_number:=@depot_number + 1)as ref, `uuid`, `text`
    FROM depot;
  ELSE
    INSERT INTO `temp_depot`  -- will compute inventory's quantity just in a specific depot
    SELECT (@depot_number := @depot_number + 1) as ref, `uuid`, `text`
    FROM depot
    WHERE `uuid` = _depot_filter_uuid;
  END IF;

  SET @depot_counter = 1;
  -- let's loop through all inventories

  WHILE (@depot_counter <= @depot_number) DO
    SET @depot_uuid = (SELECT `uuid` FROM `temp_depot` WHERE `reference` = @depot_counter);

    -- delete all inventory's data for this period

    DELETE FROM `stock_movement_status`
    WHERE  `start_date` >= _start_date AND  `end_date` <= _end_date AND  `inventory_uuid` = _inventory_uuid AND `depot_uuid` =  @depot_uuid;

    DELETE FROM `temp_stock_movement` WHERE 1;
    INSERT INTO `temp_stock_movement`

    SELECT (@row_number:=@row_number + 1) AS `reference`, x.* FROM (
      SELECT DATE(m.date) AS `date`,  m.depot_uuid, i.uuid,
        SUM( IFNULL(m.quantity * IF(m.is_exit = 1, -1, 1), 0)) AS quantity,
        SUM(IF(m.is_exit = 0, m.quantity, 0)),
        SUM(IF(m.is_exit = 1, m.quantity, 0)), m.is_exit
      FROM `stock_movement` m
        JOIN lot l ON l.uuid = m.lot_uuid
        JOIN inventory i ON i.uuid = l.inventory_uuid
      WHERE i.uuid = _inventory_uuid AND DATE(m.date) <= DATE(_end_date) AND m.depot_uuid =  @depot_uuid
      GROUP BY  DATE(m.date), m.depot_uuid
      ORDER BY  `date`
    ) AS x
    ORDER BY x.date;

    SET @row_i = 0;
    SET _row_uuid = NULL;

    SELECT SUM(quantity) AS quantity INTO _qtt
    FROM temp_stock_movement m
      JOIN inventory i ON i.uuid = m.inventory_uuid
      JOIN depot d ON d.uuid = m.depot_uuid
    WHERE DATE(m.date) <=_start_date AND m.depot_uuid = @depot_uuid;

    SET _qtt = IFNULL(_qtt, 0);

    SELECT in_quantity, out_quantity
    INTO _in_qtt, _out_qtt
    FROM temp_stock_movement m
    WHERE DATE(m.date) =DATE(_start_date) AND m.depot_uuid = @depot_uuid;

    DELETE FROM temp_stock_movement WHERE DATE(`date`) <=_start_date AND `depot_uuid` = @depot_uuid;

    -- check if this date already exist in stock_movement_status for the inventory
    SET @date_exists = 0;

    SELECT `uuid`, count(`uuid`) as nbr
      INTO _row_uuid,  @date_exists
    FROM `stock_movement_status`
    WHERE `depot_uuid` = @depot_uuid AND `inventory_uuid` = _inventory_uuid
      AND DATE(`start_date`) <= _start_date
    ORDER BY `start_date` DESC
    LIMIT 1;

    IF @date_exists = 0 THEN
      SET _row_uuid  = HUID(uuid());
      INSERT INTO  `stock_movement_status`
      VALUES (_row_uuid, _start_date, _start_date, _qtt, IFNULL(_in_qtt, 0), IFNULL(_out_qtt, 0), _inventory_uuid, @depot_uuid);
    END IF;

    SELECT `reference` INTO @row_i
    FROM temp_stock_movement
    WHERE `date` > _start_date
    LIMIT 1;

    SET @mvts_number = (SELECT COUNT(*) from temp_stock_movement  WHERE `date` > _start_date);
    SET  @row_number = @row_i + @mvts_number - 1;

    SET @row_i = IFNULL(@row_i, 0);

    IF @row_i = 0 THEN
      UPDATE `stock_movement_status` SET `end_date` = _end_date WHERE `uuid` = _row_uuid;
    ELSE
      WHILE (@row_i < @row_number + 1) DO
        SET _in_qtt = 0;
        SET _out_qtt = 0;

        SET @current_qtt = 0;
        SET @current_date = _start_date;

        SELECT  m.quantity, m.in_quantity, m.out_quantity, m.date
          INTO @current_qtt, _in_qtt, _out_qtt, @current_date
        FROM temp_stock_movement m
        JOIN inventory i ON i.uuid = m.inventory_uuid
        JOIN depot d ON d.uuid = m.depot_uuid
        WHERE m.reference = @row_i
        GROUP BY m.depot_uuid;
        UPDATE `stock_movement_status` SET `end_date` = DATE_SUB(@current_date, INTERVAL 1 DAY) WHERE `uuid` = _row_uuid;
        IF @current_qtt <> _qtt THEN
          SET _row_uuid = HUID(UUID());
          SET _qtt = @current_qtt + _qtt;
          INSERT INTO  `stock_movement_status` VALUES (_row_uuid, @current_date, @current_date, _qtt, _in_qtt, _out_qtt, _inventory_uuid,  @depot_uuid);
        END IF;
        SET @row_i= @row_i + 1;
      END WHILE;
    END IF;

    UPDATE `stock_movement_status` SET `end_date` = _end_date WHERE `uuid` = _row_uuid;
    SET _qtt = 0;
    SET @depot_counter = @depot_counter +1;
    SET _row_uuid = NULL;
  END WHILE;
END$$


DROP PROCEDURE IF EXISTS `computeStockQuantityByLotUuid`$$
CREATE PROCEDURE `computeStockQuantityByLotUuid` (
  IN _start_date DATE,
  IN _lot_uuid BINARY(16),
  IN _depot_filter_uuid BINARY(16)
)
BEGIN

  DECLARE _inventory_uuid BINARY(16);
  SELECT inventory_uuid
  INTO _inventory_uuid
  FROM lot
  WHERE uuid = _lot_uuid
  LIMIT 1;

  CALL computeStockQuantity(_start_date, _inventory_uuid, _depot_filter_uuid);
END$$


/*
 This procedure is designed for calculating the CMM for an inventory in a depot during a period
 It actually retrieve the CMM value for each aglorithm we have so we get just choose which one to use
*/
DROP PROCEDURE IF EXISTS `getCMM`$$
CREATE PROCEDURE `getCMM` (
  IN _start_date DATE,
  IN _end_date DATE,
  IN _inventory_uuid BINARY(16),
  IN _depot_uuid BINARY(16)
  )
BEGIN

  DECLARE  _last_inventory_mvt_date DATE;
  DECLARE _sum_consumed_quantity, _sum_stock_day,
    _sum_consumption_day, _sum_stock_out_days, _sum_days, _number_of_month
    DECIMAL(19,4);

  SET _last_inventory_mvt_date = NULL;
  --
  SELECT `end_date`
  INTO  _last_inventory_mvt_date
  FROM stock_movement_status m
  JOIN inventory i ON m.inventory_uuid = i.uuid
  WHERE i.uuid = _inventory_uuid AND m.depot_uuid = _depot_uuid
  ORDER BY `end_date` DESC LIMIT 1;


  SET _sum_consumed_quantity = 0;
  SET _sum_stock_day = 0;
  SET _sum_consumption_day =0;
  SET _sum_stock_out_days = 0;

  SET _sum_days = DATEDIFF(_end_date,  _start_date) + 1;
  SET _number_of_month = (DATEDIFF(_end_date,  _start_date) + 1)/30.5;


  SELECT
    SUM(cmm_data.out_quantity) AS sum_consumed_quantity,
    SUM(IF(cmm_data.out_quantity <> 0, cmm_data.frequency, 0)) AS sum_consumption_day,
    SUM(IF(cmm_data.in_stock_quantity = 0, cmm_data.frequency, 0)) AS sum_stock_out_days,
    SUM(IF(cmm_data.in_stock_quantity <> 0, cmm_data.frequency, 0)) AS sum_stock_day
  INTO _sum_consumed_quantity, _sum_consumption_day, _sum_stock_day, _sum_stock_out_days
  FROM (
      SELECT x.start_date, x.end_date, x.in_quantity, x.out_quantity, x.in_stock_quantity,
          x.inventory, x.depot, (DATEDIFF(x.end_date, x.start_date) +1) AS frequency
      FROM (
          SELECT

          IF(m.start_date < _start_date, _start_date, m.start_date) AS start_date ,
          IF(m.end_date > _end_date, _end_date,  IF(m.end_date = _last_inventory_mvt_date AND
                  _last_inventory_mvt_date < _end_date, _end_date, m.end_date )) AS end_date,
          in_quantity, out_quantity, m.quantity AS `in_stock_quantity`,
          i.text as 'inventory', d.text AS `depot`
          FROM stock_movement_status m
          JOIN depot d ON d.uuid = m.depot_uuid
          JOIN inventory i ON i.uuid = m.inventory_uuid

          WHERE i.uuid = _inventory_uuid AND m.depot_uuid = _depot_uuid
             AND  (
              ((m.start_date >= _start_date) AND  (m.end_date <= _end_date)) OR
              ((m.start_date >= _start_date) AND  (m.end_date >= _end_date)) OR
              ((m.start_date <= _start_date) AND  (m.end_date <= _end_date))
					  )
          ORDER BY d.text
      ) AS `x`
  ) AS `cmm_data`;



  SET @algo1 = ( _sum_consumed_quantity/(IF((_sum_stock_day = NULL) OR (_sum_stock_day = 0),1, _sum_stock_day)))*30.5;

  SET @algo2 = ((_sum_consumed_quantity)/(IF( (_sum_consumption_day = NULL) OR _sum_consumption_day = 0,1, _sum_consumption_day))) * 30.5;

  SET @algo3 =((_sum_consumed_quantity)/ (IF(_sum_days = NULL OR _sum_days = 0,1, _sum_days)))*30.5;

  SET @algo_msh = (_sum_consumed_quantity/(_number_of_month - (_sum_stock_out_days/30.5) ));


  -- SELECT _sum_consumed_quantity, _sum_consumption_day, _sum_stock_day, _sum_stock_out_days, _number_of_month, _sum_days;

  SELECT IFNULL(@algo1, 0) as algo1,
    ROUND(IFNULL(@algo2, 0), 2) as algo2,
    ROUND(IFNULL(@algo3, 0),2) as algo3,
    ROUND(IFNULL(@algo_msh, 0), 2) as  algo_msh;

END$$

DELIMITER ;
