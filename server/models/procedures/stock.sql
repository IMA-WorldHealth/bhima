DELIMITER $$

-- post stock movement into vouchers
DROP PROCEDURE IF EXISTS PostStockMovement;
CREATE PROCEDURE PostStockMovement (
  IN documentUuid BINARY(16),
  IN isExit TINYINT(1),
  IN projectId SMALLINT(5)
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

  DECLARE currencyId TINYINT(3) UNSIGNED;

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

  -- set the currencyId from the enterprise's currencyId
  SELECT e.currency_id INTO currencyId
    FROM enterprise AS e JOIN project AS p ON e.id = p.enterprise_id
    WHERE p.id = projectId;

  -- Check that every inventory has a stock account and a variation account
  -- if they do not, the transaction will be unbalanced, so the operation will not continue
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
  IN operationDate DATE,
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
  IN inventoryUnitCost DECIMAL(18, 4),
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
    SET inventoryUuid = (SELECT `uuid` FROM inventory WHERE `text` = inventoryText OR `code` = inventoryCode LIMIT 1);

  END IF;

  /* continue only if inventoryUuid is defined */
  IF (inventoryUuid IS NOT NULL) THEN

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
      VALUES (integrationUuid, projectId, DATE(operationDate));

      /* create the lot */
      SET lotUuid = HUID(UUID());
      INSERT INTO lot (`uuid`, `label`, `initial_quantity`, `quantity`, `unit_cost`, `expiration_date`, `inventory_uuid`, `origin_uuid`)
      VALUES (lotUuid, stockLotLabel, stockLotQuantity, stockLotQuantity, inventoryUnitCost, DATE(stockLotExpiration), inventoryUuid, integrationUuid);

    END IF;


    /* create the stock movement */
    /* 13 is the id of integration flux */
    SET fluxId = 13;
    INSERT INTO stock_movement (`uuid`, `document_uuid`, `depot_uuid`, `lot_uuid`, `flux_id`, `date`, `quantity`, `unit_cost`, `is_exit`, `user_id`, `period_id`)
    VALUES (HUID(UUID()), documentUuid, depotUuid, lotUuid, fluxId, DATE(operationDate), stockLotQuantity, inventoryUnitCost, 0, userId, periodId);

  END IF;

END $$

/*
CALL StageInventoryForAMC(inventoryUuid)

DESCRIPTION
This procedure adds an inventory uuid to a temporary table for latter use in the
ComputeStockStatus() stored procedure.  The idea is to allow the database to use a
JOIN to group the calculation upon the stock_movement table.

*/
CREATE PROCEDURE StageInventoryForAMC(
  IN _inventory_uuid BINARY(16)
) BEGIN
  CREATE TEMPORARY TABLE IF NOT EXISTS stage_inventory_for_amc (inventory_uuid BINARY(16) NOT NULL);
  INSERT INTO stage_inventory_for_amc SET stage_inventory_for_amc.inventory_uuid = _inventory_uuid;
END $$


CREATE PROCEDURE ComputeStockStatusForStagedInventory(
  IN _start_date DATE,
  IN _depot_uuid BINARY(16)
) BEGIN
  DECLARE TO_DEPOT INTEGER DEFAULT 8;
  DECLARE TO_PATIENT INTEGER DEFAULT 9;
  DECLARE TO_SERVICE INTEGER DEFAULT 10;

  /*
    Creates a temporary table of stock movements classified by is_consumption or not for the staged inventory uuids.
    NOTE: this embeds the system logic that a "consumption" event is different if the depot is a warehouse or not
    If it is a warehouse, transfers to other depots are considered consumption.  Otherwise, only transfers to patients
    or services are considered consumption events.
  */
  CREATE TEMPORARY TABLE stock_movement_grp AS
    SELECT DATE(sm.date) as date, l.inventory_uuid, sm.depot_uuid, sm.quantity, is_exit, flux_id,
      CASE
        WHEN d.is_warehouse AND flux_id IN (TO_DEPOT, TO_PATIENT, TO_SERVICE) THEN TRUE
        WHEN flux_id IN (TO_PATIENT, TO_SERVICE) THEN TRUE
        ELSE FALSE
      END AS is_consumption
    FROM stage_inventory_for_amc AS tmp
      JOIN lot AS l ON tmp.inventory_uuid = l.inventory_uuid
      JOIN stock_movement AS sm ON l.uuid = sm.lot_uuid
      JOIN depot d ON sm.depot_uuid = d.uuid
    WHERE sm.depot_uuid = _depot_uuid AND DATE(sm.date) >= DATE(_start_date);

    -- create a temporary table similar to stock_movement_status
    CREATE TEMPORARY TABLE tmp_sms AS
      SELECT date, depot_uuid, inventory_uuid,
        SUM(IF(is_exit, -1 * quantity, quantity)) as quantity,
        SUM(IF(NOT is_exit, quantity, 0)) as in_quantity,
        SUM(IF(is_exit AND is_consumption, quantity, 0)) as out_quantity_consumption,
        SUM(IF(is_exit AND NOT is_consumption, quantity, 0)) as out_quantity_exit
      FROM stock_movement_grp
      GROUP BY date, depot_uuid, inventory_uuid
      ORDER BY date;

    -- clone the temporary table to prevent self-referencing issues in temporary tables
    -- https://dev.mysql.com/doc/refman/5.7/en/temporary-table-problems.html
    CREATE TEMPORARY TABLE tmp_sms_cp AS SELECT * FROM tmp_sms;

    -- create a table of grouped running totals for each category (date, depot_uuid, inventory_uuid)
    CREATE TEMPORARY TABLE tmp_grouped AS
    SELECT date, depot_uuid, inventory_uuid,
      quantity AS quantity,
      in_quantity AS in_quantity,
      out_quantity_consumption AS out_quantity_consumption,
      out_quantity_exit as out_quantity_exit,
      SUM(sum_quantity) AS sum_quantity,
      SUM(sum_in_quantity) AS sum_in_quantity,
      SUM(sum_out_quantity_consumption) AS sum_out_quantity_consumption,
      SUM(sum_out_quantity_exit) as sum_out_quantity_exit
    FROM (
      SELECT t1.date, t1.depot_uuid, t1.inventory_uuid,
      t1.quantity, -- current balances
      t1.in_quantity,
      t1.out_quantity_consumption,
      t1.out_quantity_exit,
      IFNULL(t2.quantity, 0) AS sum_quantity, -- running balances
      IFNULL(t2.in_quantity, 0) AS sum_in_quantity,
      IFNULL(t2.out_quantity_consumption, 0) AS sum_out_quantity_consumption,
      IFNULL(t2.out_quantity_exit, 0) AS sum_out_quantity_exit
      FROM tmp_sms t1 JOIN tmp_sms_cp t2 WHERE
        t2.date <= t1.date AND
        t1.inventory_uuid = t2.inventory_uuid AND
        t1.depot_uuid = t2.depot_uuid
      ORDER BY t1.date
    )z
    GROUP BY date, depot_uuid, inventory_uuid
    ORDER BY date;

    -- clean up temporary tables
    DROP TEMPORARY TABLE tmp_sms;
    DROP TEMPORARY TABLE tmp_sms_cp;
    DROP TEMPORARY TABLE stock_movement_grp;

    -- remove all rows from stock_movement_status that are invalidated by this date.
    DELETE sms FROM stock_movement_status AS sms
      JOIN stage_inventory_for_amc AS staged ON sms.inventory_uuid = staged.inventory_uuid
    WHERE sms.date >= DATE(_start_date) AND sms.depot_uuid = _depot_uuid;

    -- get the max date for each inventory_uuid so we can look up the totals in a second
    CREATE TEMPORARY TABLE tmp_max_dates AS
      SELECT sms.inventory_uuid, MAX(date) AS max_date FROM stage_inventory_for_amc AS staged LEFT JOIN stock_movement_status AS sms
        ON staged.inventory_uuid = sms.inventory_uuid
        WHERE sms.depot_uuid = _depot_uuid
        GROUP BY staged.inventory_uuid;

    -- now get the "beginning balances" based on the date.  I think this needs to be two queries because one cannot
    -- reuse an SQL query with a temporary tabel. But we may be able to optimize it down the road.
    CREATE TEMPORARY TABLE tmp_max_values AS
      SELECT sms.inventory_uuid, tmd.max_date, sms.sum_quantity, sms.sum_in_quantity, sms.sum_out_quantity_exit, sum_out_quantity_consumption
      FROM stock_movement_status AS sms JOIN tmp_max_dates AS tmd ON
        sms.inventory_uuid = tmd.inventory_uuid AND tmd.max_date = sms.date
      GROUP BY sms.inventory_uuid, sms.date;

    DROP TEMPORARY TABLE tmp_max_dates;

    -- copy into stock_movement_status, including the opening balances
    INSERT INTO stock_movement_status
      SELECT tg.depot_uuid, tg.inventory_uuid, tg.date,
        tg.quantity AS quantity_delta,
        tg.in_quantity,
        tg.out_quantity_exit,
        tg.out_quantity_consumption,

        -- these gnarly SQL queries just get the current sum, the current values of this movement, and the beginning balances
        tg.sum_quantity + IFNULL(tmv.sum_quantity, 0),
        tg.sum_in_quantity + IFNULL(tmv.sum_in_quantity, 0),
        tg.sum_out_quantity_exit + IFNULL(tmv.sum_out_quantity_exit, 0),
        tg.sum_out_quantity_consumption + IFNULL(tmv.sum_out_quantity_consumption, 0)
      FROM tmp_grouped AS tg LEFT JOIN tmp_max_values AS tmv
        ON tg.inventory_uuid = tmv.inventory_uuid;

    DROP TEMPORARY TABLE tmp_max_values;

    -- clean up final temporary tables
    DROP TEMPORARY TABLE tmp_grouped;
    DROP TEMPORARY TABLE stage_inventory_for_amc;
END $$


/*
 This procedure is designed for calculating the CMM for an inventory in a depot during a period
 It actually retrieve the CMM value for each aglorithm we have so we get just choose which one to use
 : Updated by lomamech, to recalculate the number of days of consumption, and modify the parameter definition for the calculation
*/
DROP PROCEDURE IF EXISTS `getCMM`$$
CREATE PROCEDURE `getCMM` (
  IN _start_date DATE,
  IN _end_date DATE,
  IN _inventory_uuid BINARY(16),
  IN _depot_uuid BINARY(16)
) BEGIN

  DECLARE _last_inventory_mvt_date, _first_inventory_mvt_date DATE;
  DECLARE _sum_consumed_quantity, _sum_stock_day,
    _sum_consumption_day, _sum_stock_out_days, _sum_days, _number_of_month,
    _days_before_consumption
    DECIMAL(19,4);

  SET _last_inventory_mvt_date = NULL;
  SET _first_inventory_mvt_date = NULL;

  SELECT MAX(m.end_date) INTO  _last_inventory_mvt_date
  FROM stock_movement_status m
    JOIN inventory i ON m.inventory_uuid = i.uuid
  WHERE i.uuid = _inventory_uuid AND m.depot_uuid = _depot_uuid;

  SELECT MIN(m.start_date) INTO _first_inventory_mvt_date
  FROM stock_movement_status m
    JOIN inventory i ON m.inventory_uuid = i.uuid
  WHERE i.uuid = _inventory_uuid AND m.depot_uuid = _depot_uuid AND DATE(m.start_date) >= DATE(_start_date);

  SET _sum_consumed_quantity = 0;
  SET _sum_stock_day = 0;
  SET _sum_consumption_day =0;
  SET _sum_stock_out_days = 0;

  SELECT COUNT(DISTINCT(aggr.date)) AS consumption_days INTO  _sum_consumption_day
  FROM (
    SELECT DATE(sm.date) AS date, sm.quantity
    FROM stock_movement AS sm
      JOIN lot AS l ON l.uuid = sm.lot_uuid
    WHERE l.inventory_uuid = _inventory_uuid AND sm.depot_uuid = _depot_uuid
    AND (DATE(sm.date) >= DATE(_start_date) AND DATE(sm.date) <= DATE(_end_date))
    AND sm.is_exit = 1 AND sm.flux_id <> 11
    ORDER BY sm.date ASC
  ) AS aggr;

  SET _sum_days = DATEDIFF(_end_date,  _start_date) + 1;
  SET _number_of_month = ROUND(DATEDIFF(_end_date,  _start_date)/30.5);
  SET _days_before_consumption = DATEDIFF(_first_inventory_mvt_date,  _start_date);

  SELECT
    SUM(cmm_data.out_quantity) AS sum_consumed_quantity,
    SUM(IF(cmm_data.in_stock_quantity = 0, cmm_data.frequency, 0)) AS sum_stock_out_days,
    SUM(IF(cmm_data.in_stock_quantity <> 0, cmm_data.frequency, 0)) AS sum_stock_day
  INTO _sum_consumed_quantity, _sum_stock_out_days, _sum_stock_day
  FROM (
      SELECT x.start_date, x.end_date, x.in_quantity, x.out_quantity, x.in_stock_quantity,
          x.inventory, x.depot, (DATEDIFF(x.end_date, x.start_date) + 1) AS frequency
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
              DATE(m.start_date) >= DATE(_start_date) AND DATE(m.end_date) <= DATE(_end_date)
              -- ((m.start_date >= _start_date) AND  (m.end_date >= _end_date)) OR
              -- ((m.start_date <= _start_date) AND  (m.end_date <= _end_date))
            )
          ORDER BY d.text
      ) AS `x` HAVING frequency > -1
  ) AS `cmm_data`;


  -- get the current amount in stock
  SET @quantityInStock = (
    SELECT quantity FROM stock_movement_status AS sms
      WHERE sms.inventory_uuid = _inventory_uuid
        AND sms.depot_uuid = _depot_uuid ORDER BY start_date LIMIT 1
  );

  SET @algo1 = ( _sum_consumed_quantity/(IF((_sum_stock_day = NULL) OR (_sum_stock_day = 0),1, _sum_stock_day)))*30.5;
  SET @algo2 = ((_sum_consumed_quantity)/(IF( (_sum_consumption_day = NULL) OR _sum_consumption_day = 0,1, _sum_consumption_day))) * 30.5;
  SET @algo3 =((_sum_consumed_quantity)/(IF( (_sum_days = NULL) OR _sum_days = 0,1, _sum_days))) * 30.5;
  SET @algo_msh = (_sum_consumed_quantity/(_number_of_month - (_sum_stock_out_days/30.5) ));

  SELECT ROUND(IFNULL(@algo1, 0), 2) as algo1,
    ROUND(IFNULL(@algo2, 0), 2) as algo2,
    ROUND(IFNULL(@algo3, 0),2) as algo3,
    ROUND(IFNULL(@algo_msh, 0), 2) as algo_msh,
    IFNULL(@quantityInStock, 0) AS quantity_in_stock, -- FIXME(@jniles): this returns incorrect results.  DO NOT USE
    BUID(_inventory_uuid) as inventory_uuid,
    BUID(_depot_uuid) as depot_uuid,
    _start_date as start_date,
    _end_date as end_date,
    _first_inventory_mvt_date as first_inventory_movement_date,
    _last_inventory_mvt_date as last_inventory_movement_date,
    _sum_days as sum_days,
    _sum_stock_day as sum_stock_day,
    _sum_consumption_day as sum_consumption_day,
    _sum_consumed_quantity as sum_consumed_quantity,
    _number_of_month as number_of_month,
    _sum_stock_out_days as sum_stock_out_days,
    _days_before_consumption as days_before_consumption;
END$$

DELIMITER ;
