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

      /* create the lot */
      SET lotUuid = HUID(UUID());
      INSERT INTO lot (`uuid`, `label`, `quantity`, `unit_cost`, `expiration_date`, `inventory_uuid`)
      VALUES (lotUuid, stockLotLabel, stockLotQuantity, inventoryUnitCost, DATE(stockLotExpiration), inventoryUuid);

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
  DECLARE TO_AGGREGATE_CONSUMPTION INTEGER DEFAULT 16;

  /*
    Creates a temporary table of stock movements for the depot, inventory items, and time frame under consideration.
    The purpose of this table is to classify movements by "is_consumption", using the following logic:
      - if the movement is an exit from a warehouse, it is a consumption if and only if it is to a depot, patient, or serivce
      - else if the movement is an exit from a depot, it is a consumption if and only if it is to a patient or service
      - else it is not a consumption

    This allows us to easily SUM/GROUP on this logic in future tables.  This is essentially a raw copy of the stock_movement table

    TODO(@jniles): I think we can actually completely do away with tis table by combining it into the following query.  But it would
    be rather hard to read.  This is a TODO for a future optimisation.
  */
  CREATE TEMPORARY TABLE stock_movement_grp AS
    SELECT DATE(sm.date) as date, l.inventory_uuid, sm.depot_uuid, sm.quantity, is_exit, flux_id,
      CASE
        WHEN d.is_warehouse AND flux_id IN (TO_DEPOT, TO_PATIENT, TO_SERVICE, TO_AGGREGATE_CONSUMPTION) THEN TRUE
        WHEN flux_id IN (TO_PATIENT, TO_SERVICE, TO_AGGREGATE_CONSUMPTION) THEN TRUE
        ELSE FALSE
      END AS is_consumption
    FROM stage_inventory_for_amc AS tmp
      JOIN lot AS l ON tmp.inventory_uuid = l.inventory_uuid
      JOIN stock_movement AS sm ON l.uuid = sm.lot_uuid
      JOIN depot d ON sm.depot_uuid = d.uuid
    WHERE sm.depot_uuid = _depot_uuid AND DATE(sm.date) >= DATE(_start_date);

    /*
      Creates a temporary table of the stock_movements grouped by day.  This allows us to get daily
      SUMs for movements.  Using the previous table (stock_movement_grp), we are able to aggregate:
        - quantity - the daily increase/decrease of stock for that inventory/depot combo.
        - in_quantity - the daily amount of stock entering the depot
        - out_quantity_consumption - the daily amount of stock exiting the depot as consumptions
        - out_quantity_exit - the daily amount of stock exiting by all other non-consumption means

      At this point, we should have unique dates.  At this point, we have everything for the stock_movement_status
      table except the running balances.  Everything beyond this point is to set up the running balances.
    */
    CREATE TEMPORARY TABLE tmp_sms AS
      SELECT date, depot_uuid, inventory_uuid,
        SUM(IF(is_exit, -1 * quantity, quantity)) as quantity,
        SUM(IF(NOT is_exit, quantity, 0)) as in_quantity,
        SUM(IF(is_exit AND is_consumption, quantity, 0)) as out_quantity_consumption,
        SUM(IF(is_exit AND NOT is_consumption, quantity, 0)) as out_quantity_exit
      FROM stock_movement_grp
      GROUP BY date, depot_uuid, inventory_uuid
      ORDER BY date;

    -- we no longer need this table
    DROP TEMPORARY TABLE stock_movement_grp;

    -- clone the temporary table to prevent self-referencing issues in temporary tables
    -- https://dev.mysql.com/doc/refman/5.7/en/temporary-table-problems.html
    CREATE TEMPORARY TABLE tmp_sms_cp AS SELECT * FROM tmp_sms;

    /*
      Creates a temporary table of running totals for the date range in question.  We still
      don't have opening balances though, so this is only half way there.
    */
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

    -- remove all rows from stock_movement_status that will need to be recomputed.
    DELETE sms FROM stock_movement_status AS sms
      JOIN stage_inventory_for_amc AS staged ON sms.inventory_uuid = staged.inventory_uuid
    WHERE sms.date >= DATE(_start_date) AND sms.depot_uuid = _depot_uuid;

    -- get the max date from the stock_movement_status table (remember, we deleted the invalidated rows above)
    -- to look up the opening balances with.
    CREATE TEMPORARY TABLE tmp_max_dates AS
      SELECT sms.inventory_uuid, MAX(date) AS max_date FROM stage_inventory_for_amc AS staged LEFT JOIN stock_movement_status AS sms
        ON staged.inventory_uuid = sms.inventory_uuid
        WHERE sms.depot_uuid = _depot_uuid
        GROUP BY staged.inventory_uuid;

    -- now get the "opening balances" based on the date.  I think this needs to be two queries because one cannot
    -- reuse an SQL query with a temporary tabel. But we may be able to optimize it down the road.
    CREATE TEMPORARY TABLE tmp_max_values AS
      SELECT sms.inventory_uuid, tmd.max_date, sms.sum_quantity, sms.sum_in_quantity, sms.sum_out_quantity_exit, sum_out_quantity_consumption
      FROM stock_movement_status AS sms JOIN tmp_max_dates AS tmd ON
        sms.inventory_uuid = tmd.inventory_uuid AND tmd.max_date = sms.date
      WHERE sms.depot_uuid = _depot_uuid
      GROUP BY sms.inventory_uuid, sms.date;

    -- we don't need to know those max dates anymore
    DROP TEMPORARY TABLE tmp_max_dates;

    -- copy all staged records into stock_movement_status, including the opening balances!
    -- NOTE(@jniles) - we are going to need a second pass to caluclate the duration.  Maybe there is a better way?
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
        tg.sum_out_quantity_consumption + IFNULL(tmv.sum_out_quantity_consumption, 0),
        0 AS duration
      FROM tmp_grouped AS tg LEFT JOIN tmp_max_values AS tmv
        ON tg.inventory_uuid = tmv.inventory_uuid;

    DROP TEMPORARY TABLE tmp_max_values;
    DROP TEMPORARY TABLE tmp_grouped;

    -- create a temporary table pointing to the next record
    CREATE TEMPORARY TABLE tmp_next_sms AS
      SELECT
        sms.inventory_uuid,
        sms.date,
        (SELECT next.date FROM stock_movement_status AS next
          WHERE next.inventory_uuid = sms.inventory_uuid
            AND next.depot_uuid = sms.depot_uuid
            AND next.date > sms.date
          ORDER BY next.date ASC
          LIMIT 1
        ) AS next_date
      FROM stock_movement_status AS sms
      JOIN stage_inventory_for_amc AS staged
        ON staged.inventory_uuid = sms.inventory_uuid
      WHERE sms.depot_uuid = _depot_uuid
        AND sms.date >= _start_date;

    DROP TEMPORARY TABLE stage_inventory_for_amc;

    -- finally, update the durations for this inventory_uuid/depot_uuid combo
    -- TODO(@jniles): can we do this at the same time as another query above?
    -- TODO(@jniles): investigate the performance of this query
    -- NOTE(@jniles): the final record will always have a duration of "0".  It should be the only record with a duration of "0".
    UPDATE stock_movement_status AS sms
      JOIN tmp_next_sms AS next
        ON sms.inventory_uuid = next.inventory_uuid
          AND sms.date = next.date
    SET sms.duration = IFNULL(DATEDIFF(next.next_date, next.date), 0)
    WHERE sms.depot_uuid = _depot_uuid;

    DROP TEMPORARY TABLE tmp_next_sms;

    /*
      We are done. We've removed, then recreated, all data in the stock_movement_status table
      corresponding to the depot_uuid and inventory_uuids from the start date on (including the
      start date).  We've also computed the duration between each row and the subsequent row.
    */
END $$


DROP PROCEDURE IF EXISTS GetAMC$$
CREATE PROCEDURE GetAMC(
  IN _date DATE, /* what date the user wants to know the AMC for */
  IN _depot_uuid BINARY(16), /* the depot for the AMC */
  IN _inventory_uuid BINARY(16) /* the inventory for the AMC */
) BEGIN

  DECLARE _start_date,
          _min_date,
          _max_date DATE;

  DECLARE _sum_consumed_quantity,
          _sum_exit_quantity,
          _last_quantity,
          _initial_quantity DECIMAL(19,4);

  DECLARE _sum_stock_day,
          _sum_consumption_day,
          _sum_stock_out_day,
          _sum_day,
          _number_of_month,
          _head_days,
          _tail_days INTEGER;

  DECLARE _algo_def,
          _algo_msh DECIMAL(19,4);

  -- NOTE(@jniles): I am ignoring the enterprise_id for ease of use.  For full correctness,
  -- we will need to pass in the enteprise_id.  However, we always only have a single enterprise
  -- in production, so this works for now.
  SELECT
    ss.month_average_consumption,
    DATE_SUB(_date, INTERVAL ss.month_average_consumption MONTH)
  INTO
    _number_of_month,
    _start_date
  FROM stock_setting AS ss LIMIT 1;

  SELECT
    SUM(IF(sms.sum_quantity <= 0, sms.duration, 0)),
    SUM(IF(sms.sum_quantity > 0, sms.duration, 0)),
    SUM(IF(sms.out_quantity_consumption != 0, 1, 0)),
    MIN(sms.date),
    MAX(sms.date),

    -- NOTE(@jniles): sum_* fields are monotonically increasing, so the MAX is the last,
    -- MIN is the first
    MAX(sms.sum_out_quantity_consumption) - MIN(sms.sum_out_quantity_consumption),
    MAX(sms.sum_out_quantity_exit) - MIN(sms.sum_out_quantity_exit)

  INTO
    _sum_stock_out_day,
    _sum_stock_day,
    _sum_consumption_day,
    _min_date,
    _max_date,
    _sum_consumed_quantity,
    _sum_exit_quantity
  FROM stock_movement_status AS sms WHERE
    sms.date >=_start_date AND
    sms.date <= _date AND
    sms.depot_uuid = _depot_uuid AND
    sms.inventory_uuid = _inventory_uuid;

  -- account for the "tail"
  -- the "tail" (number of days since final record until today) will not be included in either
  -- _sum_stock_out_day or _sum_stock_day, since duration is always 0 for the last record.  Here
  -- we check what condition we are in to figure out if the tail
  SELECT sms.sum_quantity INTO _last_quantity FROM stock_movement_status AS sms WHERE
      sms.date = _max_date AND
      sms.inventory_uuid = _inventory_uuid AND
      sms.depot_uuid = _depot_uuid;

  SELECT DATEDIFF(_date, _max_date) INTO _tail_days;

  IF (_last_quantity = 0) THEN
    -- ended in a stock out.  Add the "tail" to the days of stock outs
    SELECT _sum_stock_out_day + _tail_days INTO _sum_stock_out_day;
  ELSE
    -- ended with stock.  Add the "tail" to the days of stock
    SELECT _sum_stock_day + _tail_days INTO _sum_stock_day;
  END IF;

  -- account for the "head"
  -- the "head" (number of days before the first record captured in this range) needs to be considered
  -- separately, since it won't be picked up by the above query.  We just need to know if we were in stock
  -- out or had stock at the beginning of our window of time.
  -- NOTE: we only need to be concerned about days here, not quantities.  If there were a change of quantities, it would
  -- have corresponded to a record.
  SELECT
    sms.sum_quantity INTO _initial_quantity
  FROM stock_movement_status AS sms WHERE
    -- get the record right before the start
    sms.date < _start_date AND
    sms.depot_uuid = _depot_uuid AND
    sms.inventory_uuid = _inventory_uuid
    ORDER BY sms.date DESC
    LIMIT 1;

  SELECT DATEDIFF(_min_date, _start_date)  INTO _head_days;

  IF (_initial_quantity = 0 OR _initial_quantity IS NULL) THEN
    -- started without stock. Add the "head" to  days to stock out days.
    SELECT _sum_stock_out_day + _head_days INTO _sum_stock_out_day;
  ELSE
    -- started with stock.  Add the "head" to the days of stock.
    SELECT _sum_stock_day + _head_days INTO _sum_stock_day;
  END IF;

  -- the number of days in the period
  SELECT DATEDIFF(_date, _start_date) INTO _sum_day;

  -- Default algorithm
  -- The average monthly consumption is obtained by dividing the quantity consumed during the period by
  -- the number of days with stock during the period, and by multiplying the result by 30.5.
  SET _algo_def = (_sum_consumed_quantity / IF(_sum_stock_day IS NULL OR _sum_stock_day = 0, 1, _sum_stock_day)) * 30.5;

  -- MSH algorithm
  -- The average consumption is obtained by dividing the quantity consumed during the period by the difference of the
  -- number of months in the period minus the total number of days of stock out in the period. The MSH algorithm
  -- is recommended by the Management Sciences for Health organization (https://www.msh.org).
  SET _algo_msh = (_sum_consumed_quantity / (_number_of_month - (_sum_stock_out_day / 30.5)));

  SELECT
    BUID(_depot_uuid) AS depot_uuid,
    BUID(_inventory_uuid) AS inventory_uuid,
    _start_date AS start_date,
    _date AS end_date,
    ROUND(IFNULL(_algo_def, 0), 2) AS algo_def,
    ROUND(IFNULL(_algo_msh, 0), 2) AS algo_msh,
    _last_quantity AS quantity_in_stock,
    _sum_day AS sum_days,
    _sum_stock_day AS sum_stock_day,
    _sum_stock_out_day AS sum_stock_out_days,
    _sum_consumption_day AS sum_consumption_day,
    _sum_consumed_quantity AS sum_consumed_quantity,
    _max_date AS max_date,
    _min_date AS min_date,
    _number_of_month AS number_of_month,
    _head_days AS head_days,
    _tail_days AS tail_days,
    _initial_quantity AS quantity_at_beginning;
END $$

DELIMITER ;
