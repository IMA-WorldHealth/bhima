-- This processus inserts records relative to the stock movement in the posting journal
CREATE PROCEDURE PostPurchase (
  IN document_uuid BINARY(16),
  IN date DATETIME,
  IN enterprise_id SMALLINT(5) UNSIGNED,
  IN project_id SMALLINT(5) UNSIGNED,
  IN currency_id TINYINT(3) UNSIGNED,
  IN user_id SMALLINT(5) UNSIGNED
)
BEGIN
  DECLARE InvalidInventoryAccounts CONDITION FOR SQLSTATE '45006';
  DECLARE current_fiscal_year_id MEDIUMINT(8) UNSIGNED;
  DECLARE current_period_id MEDIUMINT(8) UNSIGNED;
  DECLARE current_exchange_rate DECIMAL(19, 4) UNSIGNED;
  DECLARE transaction_id VARCHAR(100);
  DECLARE verify_invalid_accounts SMALLINT(5);
  DECLARE PURCHASE_TRANSACTION_TYPE TINYINT(3) UNSIGNED;

  -- should not be reassigned during the execution, to know why 9 please see the transaction_type table
  SET PURCHASE_TRANSACTION_TYPE = 9;


  -- getting the curent fiscal year
  SET current_fiscal_year_id = (
    SELECT id FROM fiscal_year AS fy
    WHERE date BETWEEN fy.start_date AND DATE(ADDDATE(fy.start_date, INTERVAL fy.number_of_months MONTH)) AND fy.enterprise_id = enterprise_id
  );

  -- getting the period id
  SET current_period_id = (
    SELECT id FROM period AS p
    WHERE DATE(date) BETWEEN DATE(p.start_date) AND DATE(p.end_date) AND p.fiscal_year_id = current_fiscal_year_id
  );

  CALL PostingJournalErrorHandler(enterprise_id, project_id, current_fiscal_year_id, current_period_id, 1, date);

 -- Check that all every inventory has a stock account and a variation account - if they do not the transaction will be Unbalanced
  SELECT
    COUNT(l.uuid) INTO verify_invalid_accounts
  FROM
    lot AS l
  JOIN
  	stock_movement sm ON sm.lot_uuid = l.uuid
  JOIN
  	inventory i ON i.uuid = l.inventory_uuid
  JOIN
  	inventory_group ig ON ig.uuid = i.group_uuid
  WHERE
  	ig.stock_account IS NULL AND
    ig.cogs_account IS NULL AND
    sm.document_uuid = document_uuid;

  IF verify_invalid_accounts > 0 THEN
    SIGNAL InvalidInventoryAccounts
    SET MESSAGE_TEXT = 'Every inventory should belong to a group with a cogs account and stock account.';
  END IF;

  -- getting the transaction number
  SET transaction_id = GenerateTransactionId(project_id);

  -- Debiting stock account, by inserting a record to the posting journal table
  INSERT INTO posting_journal
  (
    uuid, project_id, fiscal_year_id, period_id, trans_id, trans_date,
    record_uuid, description, account_id, debit, credit, debit_equiv,
    credit_equiv, currency_id, origin_id, user_id
  )
  SELECT
    HUID(UUID()), project_id, current_fiscal_year_id, current_period_id, transaction_id,
    date, p.uuid, sm.description, ig.stock_account, pi.total, 0, pi.total, 0, currency_id,
    PURCHASE_TRANSACTION_TYPE, user_id
  FROM
    stock_movement As sm
  JOIN
    lot l ON l.uuid = sm.lot_uuid
  JOIN
    purchase p ON p.uuid = l.origin_uuid
  JOIN
    purchase_item pi ON pi.purchase_uuid = p.uuid
  JOIN
    inventory i ON i.uuid = pi.inventory_uuid
  JOIN
    inventory_group ig ON ig.uuid = i.group_uuid
  WHERE
    sm.document_uuid = document_uuid
  GROUP BY i.uuid;

-- Crediting cost of good sale account, by inserting a record to the posting journal table
  INSERT INTO posting_journal
  (
    uuid, project_id, fiscal_year_id, period_id, trans_id, trans_date,
    record_uuid, description, account_id, debit, credit, debit_equiv,
    credit_equiv, currency_id, origin_id, user_id
  )
  SELECT
    HUID(UUID()), project_id, current_fiscal_year_id, current_period_id, transaction_id,
    date, p.uuid, sm.description, ig.cogs_account, 0, pi.total, 0, pi.total, currency_id,
    PURCHASE_TRANSACTION_TYPE, user_id
  FROM
    stock_movement As sm
  JOIN
    lot l ON l.uuid = sm.lot_uuid
  JOIN
    purchase p ON p.uuid = l.origin_uuid
  JOIN
    purchase_item pi ON pi.purchase_uuid = p.uuid
  JOIN
    inventory i ON i.uuid = pi.inventory_uuid
  JOIN
    inventory_group ig ON ig.uuid = i.group_uuid
  WHERE
    sm.document_uuid = document_uuid
  GROUP BY i.uuid;
END $$

-- This procedure inserts records relative to the stock movement integration in the posting journal
CREATE PROCEDURE PostIntegration (
  IN document_uuid BINARY(16),
  IN date DATETIME,
  IN enterprise_id SMALLINT(5) UNSIGNED,
  IN project_id SMALLINT(5) UNSIGNED,
  IN currency_id TINYINT(3) UNSIGNED,
  IN user_id SMALLINT(5) UNSIGNED
)
BEGIN
  DECLARE InvalidInventoryAccounts CONDITION FOR SQLSTATE '45006';
  DECLARE current_fiscal_year_id MEDIUMINT(8) UNSIGNED;
  DECLARE current_period_id MEDIUMINT(8) UNSIGNED;
  DECLARE transaction_id VARCHAR(100);
  DECLARE verify_invalid_accounts SMALLINT(5);
  DECLARE STOCK_INTEGRATION_TRANSACTION_TYPE TINYINT(3) UNSIGNED;

  -- should not be reassigned during the execution, to know why 12 please see the transaction_type table
  SET STOCK_INTEGRATION_TRANSACTION_TYPE = 12;


  -- getting the curent fiscal year
  SET current_fiscal_year_id = (
    SELECT id FROM fiscal_year AS fy
    WHERE date BETWEEN fy.start_date AND DATE(ADDDATE(fy.start_date, INTERVAL fy.number_of_months MONTH)) AND fy.enterprise_id = enterprise_id
  );

  -- getting the period id
  SET current_period_id = (
    SELECT id FROM period AS p
    WHERE DATE(date) BETWEEN DATE(p.start_date) AND DATE(p.end_date) AND p.fiscal_year_id = current_fiscal_year_id
  );

  CALL PostingJournalErrorHandler(enterprise_id, project_id, current_fiscal_year_id, current_period_id, 1, date);

 -- Check that all every inventory has a stock account and a variation account - if they do not the transaction will be Unbalanced
  SELECT
    COUNT(l.uuid) INTO verify_invalid_accounts
  FROM
    lot AS l
  JOIN
  	stock_movement sm ON sm.lot_uuid = l.uuid
  JOIN
  	inventory i ON i.uuid = l.inventory_uuid
  JOIN
  	inventory_group ig ON ig.uuid = i.group_uuid
  WHERE
  	ig.stock_account IS NULL AND
    ig.cogs_account IS NULL AND
    sm.document_uuid = document_uuid;

  IF verify_invalid_accounts > 0 THEN
    SIGNAL InvalidInventoryAccounts
    SET MESSAGE_TEXT = 'Every inventory should belong to a group with a cogs account and stock account.';
  END IF;


  -- getting the transaction number
  SET transaction_id = GenerateTransactionId(project_id);

  -- Debiting stock account, by inserting a record to the posting journal table
  INSERT INTO posting_journal
  (
    uuid, project_id, fiscal_year_id, period_id, trans_id, trans_date,
    record_uuid, description, account_id, debit, credit, debit_equiv,
    credit_equiv, currency_id, origin_id, user_id
  )
  SELECT
    HUID(UUID()), project_id, current_fiscal_year_id, current_period_id, transaction_id,
    date, i.uuid, sm.description, ig.stock_account, l.quantity * l.unit_cost, 0, l.quantity * l.unit_cost, 0, currency_id,
    STOCK_INTEGRATION_TRANSACTION_TYPE, user_id
  FROM
    stock_movement As sm
  JOIN
    lot l ON l.uuid = sm.lot_uuid
  JOIN
    integration i ON i.uuid = l.origin_uuid
  JOIN
    inventory inv ON inv.uuid = l.inventory_uuid
  JOIN
    inventory_group ig ON ig.uuid = inv.group_uuid
  WHERE
    sm.document_uuid = document_uuid
  GROUP BY inv.uuid;

-- Crediting cost of good sale account, by inserting a record to the posting journal table
  INSERT INTO posting_journal
  (
    uuid, project_id, fiscal_year_id, period_id, trans_id, trans_date,
    record_uuid, description, account_id, debit, credit, debit_equiv,
    credit_equiv, currency_id, origin_id, user_id
  )
  SELECT
    HUID(UUID()), project_id, current_fiscal_year_id, current_period_id, transaction_id,
    date, i.uuid, sm.description, ig.cogs_account, 0, l.quantity * l.unit_cost, 0, l.quantity * l.unit_cost, currency_id,
    STOCK_INTEGRATION_TRANSACTION_TYPE, user_id
  FROM
    stock_movement As sm
  JOIN
    lot l ON l.uuid = sm.lot_uuid
  JOIN
    integration i ON i.uuid = l.origin_uuid
  JOIN
    inventory inv ON inv.uuid = l.inventory_uuid
  JOIN
    inventory_group ig ON ig.uuid = inv.group_uuid
  WHERE
    sm.document_uuid = document_uuid
  GROUP BY inv.uuid;
END $$
DELIMITER ;
