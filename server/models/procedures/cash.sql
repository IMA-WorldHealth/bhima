-- Handles the Cash Table's Rounding
-- CREATE PROCEDURE HandleCashRounding(
--   uuid BINARY(16),
--   enterpriseCurrencyId INT,
--   exchange DECIMAL
-- )
-- BEGIN
--
-- Post Cash Payments
CREATE PROCEDURE PostCash(
  IN cashUuid binary(16)
)
BEGIN
  -- required posting values
  DECLARE cashDate DATETIME;
  DECLARE cashEnterpriseId SMALLINT(5);
  DECLARE cashCurrencyId TINYINT(3) UNSIGNED;
  DECLARE cashAmount DECIMAL(19,4);
  DECLARE enterpriseCurrencyId INT;
  DECLARE isCaution BOOLEAN;

  -- variables to store core set-up results
  DECLARE cashProjectId SMALLINT(5);
  DECLARE currentFiscalYearId MEDIUMINT(8) UNSIGNED;
  DECLARE currentPeriodId MEDIUMINT(8) UNSIGNED;
  DECLARE currentExchangeRate DECIMAL(19, 8);
  DECLARE transactionId VARCHAR(100);
  DECLARE gain_account_id INT UNSIGNED;
  DECLARE loss_account_id INT UNSIGNED;

  DECLARE minMonentaryUnit DECIMAL(19,4);
  DECLARE previousInvoiceBalances DECIMAL(19,4);

  DECLARE remainder DECIMAL(19,4);
  DECLARE lastInvoiceUuid BINARY(16);

  DECLARE cashPaymentOriginId SMALLINT(5);

  -- set origin to the CASH_PAYMENT transaction type
  SET cashPaymentOriginId = 2;

  -- copy cash payment values into working variables
  SELECT cash.amount, cash.date, cash.currency_id, enterprise.id, cash.project_id, enterprise.currency_id, cash.is_caution
    INTO  cashAmount, cashDate, cashCurrencyId, cashEnterpriseId, cashProjectId, enterpriseCurrencyId, isCaution
  FROM cash
    JOIN project ON cash.project_id = project.id
    JOIN enterprise ON project.enterprise_id = enterprise.id
  WHERE cash.uuid = cashUuid;

  -- populate core setup values
  CALL PostingSetupUtil(cashDate, cashEnterpriseId, cashProjectId, cashCurrencyId, currentFiscalYearId, currentPeriodId, currentExchangeRate, enterpriseCurrencyId, transactionId, gain_account_id, loss_account_id);

  -- get the current exchange rate
  SET currentExchangeRate = GetExchangeRate(cashEnterpriseId, cashCurrencyId, cashDate);
  SET currentExchangeRate = (SELECT IF(cashCurrencyId = enterpriseCurrencyId, 1, currentExchangeRate));

  /*
    Begin the posting process.  We will first write the total value as moving into the cashbox
    (a debit to the cashbox's cash account).  Then, we will loop through each cash_item and credit
    the debtor for the amount they paid towards each invoice.

    NOTE
    In this section we divide by exchange rate (like x * (1/exchangeRate)) because we are converting
    from a non-native currency into the native enterprise currency.
  */

  -- write the cash amount going into the cashbox to the posting_journal
  INSERT INTO posting_journal (
    uuid, project_id, fiscal_year_id, period_id, trans_id, trans_date,
    record_uuid, description, account_id, debit, credit, debit_equiv,
    credit_equiv, currency_id, user_id, origin_id
  ) SELECT
    HUID(UUID()), cashProjectId, currentFiscalYearId, currentPeriodId, transactionId, c.date, c.uuid, c.description,
    cb.account_id, c.amount, 0, (c.amount * (1 / currentExchangeRate)), 0, c.currency_id, c.user_id, cashPaymentOriginId
  FROM cash AS c
    JOIN cash_box_account_currency AS cb ON cb.currency_id = c.currency_id AND cb.cash_box_id = c.cashbox_id
  WHERE c.uuid = cashUuid;

  /*
    If this is a caution payment, all we need to do is convert and write a single
    line to the posting_journal.
  */
  IF isCaution THEN

    INSERT INTO posting_journal (
      uuid, project_id, fiscal_year_id, period_id, trans_id, trans_date,
      record_uuid, description, account_id, debit, credit, debit_equiv,
      credit_equiv, currency_id, entity_uuid, user_id, origin_id
    ) SELECT
      HUID(UUID()), cashProjectId, currentFiscalYearId, currentPeriodId, transactionId, c.date, c.uuid,
      c.description, dg.account_id, 0, c.amount, 0, (c.amount * (1 / currentExchangeRate)), c.currency_id,
      c.debtor_uuid, c.user_id, cashPaymentOriginId
    FROM cash AS c
      JOIN debtor AS d ON c.debtor_uuid = d.uuid
      JOIN debtor_group AS dg ON d.group_uuid = dg.uuid
    WHERE c.uuid = cashUuid;

  /*
    In this block, we are paying cash items.  We have to look through each cash item, recording the
    amount paid as a new line in the posting_journal.  The `reference_uuid` is assigned to the
    `invoice_uuid` of the cash_item table.
  */
  ELSE

    -- write each cash_item into the posting_journal
    INSERT INTO posting_journal (
      uuid, project_id, fiscal_year_id, period_id, trans_id, trans_date,
      record_uuid, description, account_id, debit, credit, debit_equiv,
      credit_equiv, currency_id, entity_uuid, user_id, reference_uuid, origin_id
    ) SELECT
      HUID(UUID()), cashProjectId, currentFiscalYearId, currentPeriodId, transactionId, c.date, c.uuid,
      c.description, dg.account_id, 0, ci.amount, 0, (ci.amount * (1 / currentExchangeRate)), c.currency_id,
      c.debtor_uuid, c.user_id, ci.invoice_uuid, cashPaymentOriginId
    FROM cash AS c
      JOIN cash_item AS ci ON c.uuid = ci.cash_uuid
      JOIN debtor AS d ON c.debtor_uuid = d.uuid
      JOIN debtor_group AS dg ON d.group_uuid = dg.uuid
    WHERE c.uuid = cashUuid;

    /*
      Finally, we have to see if there is any rounding to do.  If the absolute value of the balance
      due minus the balance paid is less than the minMonentaryUnit, it means we should just round that
      amount away.

      If (cashAmount - previousInvoiceBalances) > 0 then the debtor overpaid and we should debit them and
      credit the rounding account.  If the (cashAmount - previousInvoiceBalances) is negative, then the debtor
      underpaid and we should credit them and debit the rounding account the remainder
    */

    /* These values are in the original currency amount */
    SET previousInvoiceBalances = (
      SELECT SUM(invoice.balance) AS balance FROM stage_cash_invoice_balances AS invoice
    );

    -- this is date ASC to get the most recent invoice
    SET lastInvoiceUuid = (
      SELECT invoice.uuid FROM stage_cash_invoice_balances AS invoice ORDER BY invoice.date LIMIT 1
    );

    SET minMonentaryUnit = (
      SELECT currency.min_monentary_unit FROM currency WHERE currency.id = cashCurrencyId
    );

    SET remainder = cashAmount - previousInvoiceBalances;

    -- check if we should round or not
    -- if the remainder is 0 the invoice is payed without need for rounding
    IF (minMonentaryUnit > ABS(remainder) && remainder <> 0) THEN

      /*
        A positive remainder means that the debtor overpaid slightly and we should debit
        the difference to the debtor and credit the difference as a gain to the gain_account

        - The debtor entity an invoice reference are not included on the gain
          account transaction. In this case the debtor covered MORE than the
          invoiced amount and so referencing them on the enterprise gain will
          actually debit them the additional amount.
      */
      IF (remainder > 0) THEN

        -- The debtor is not debited in this transaction. They have already
        -- balanced the invoice and their debt according to the invoice (the
        -- exact amount). The additional payment can just be put in a gain account.

        -- credit the rounding account
        INSERT INTO posting_journal (
          uuid, project_id, fiscal_year_id, period_id, trans_id, trans_date,
          record_uuid, description, account_id, debit, credit, debit_equiv,
          credit_equiv, currency_id, user_id, origin_id
        ) SELECT
          HUID(UUID()), cashProjectId, currentFiscalYearId, currentPeriodId, transactionId, c.date, c.uuid, c.description,
          gain_account_id, 0, remainder, 0, (remainder * (1 / currentExchangeRate)), c.currency_id, c.user_id, cashPaymentOriginId
        FROM cash AS c
          JOIN debtor AS d ON c.debtor_uuid = d.uuid
          JOIN debtor_group AS dg ON d.group_uuid = dg.uuid
        WHERE c.uuid = cashUuid;

      /*
        A negative remainder means that the debtor underpaid slightly and we should credit
        the difference to the debtor and debit the difference as a loss to the loss_account

        - The debtor and invoice are referenced on the loss account transaction
          make up for the amount that is loss. In this case the debtor has not
          actually paid enough money to cover the amount of the invoice. If this
          is not referenced his balance will not be zero.
      */
      ELSE

        -- convert the remainder into the enterprise currency
        SET remainder = (-1 * remainder);

        -- credit the debtor
        INSERT INTO posting_journal (
          uuid, project_id, fiscal_year_id, period_id, trans_id, trans_date,
          record_uuid, description, account_id, debit, credit, debit_equiv,
          credit_equiv, currency_id, entity_uuid, user_id, reference_uuid, origin_id
        ) SELECT
          HUID(UUID()), cashProjectId, currentFiscalYearId, currentPeriodId, transactionId, c.date, c.uuid, c.description,
          dg.account_id, 0, remainder, 0, (remainder * (1 / currentExchangeRate)), c.currency_id,
          c.debtor_uuid, c.user_id, lastInvoiceUuid, cashPaymentOriginId
        FROM cash AS c
          JOIN debtor AS d ON c.debtor_uuid = d.uuid
          JOIN debtor_group AS dg ON d.group_uuid = dg.uuid
        WHERE c.uuid = cashUuid;

        -- debit the rounding account
        INSERT INTO posting_journal (
          uuid, project_id, fiscal_year_id, period_id, trans_id, trans_date,
          record_uuid, description, account_id, debit, credit, debit_equiv,
          credit_equiv, currency_id, user_id, origin_id
        ) SELECT
          HUID(UUID()), cashProjectId, currentFiscalYearId, currentPeriodId, transactionId, c.date, c.uuid, c.description,
          loss_account_id, remainder, 0, (remainder * (1 / currentExchangeRate)), 0, c.currency_id, c.user_id, cashPaymentOriginId
        FROM cash AS c
          JOIN debtor AS d ON c.debtor_uuid = d.uuid
          JOIN debtor_group AS dg ON d.group_uuid = dg.uuid
        WHERE c.uuid = cashUuid;
      END IF;
    END IF;
  END IF;
END $$

CREATE PROCEDURE StageCash(
  IN amount DECIMAL(19,4) UNSIGNED,
  IN currency_id TINYINT(3),
  IN cashbox_id MEDIUMINT(8) UNSIGNED,
  IN debtor_uuid BINARY(16),
  IN project_id SMALLINT(5) UNSIGNED,
  IN date TIMESTAMP,
  IN user_id SMALLINT(5) UNSIGNED,
  IN is_caution BOOLEAN,
  IN description TEXT,
  IN uuid BINARY(16)
)
BEGIN
  -- verify if cash stage already exists within this connection, if the
  -- stage already exists simply write to it, otherwise create it select into it
  DECLARE `no_cash_stage` TINYINT(1) DEFAULT 0;
  DECLARE CONTINUE HANDLER FOR SQLSTATE '42S02' SET `no_cash_stage` = 1;
  SELECT NULL FROM stage_cash LIMIT 0;


  IF (`no_cash_stage` = 1) THEN
    CREATE TEMPORARY TABLE stage_cash
      (SELECT uuid, project_id, date, debtor_uuid, currency_id, amount, user_id, cashbox_id, description, is_caution);

  ELSE
    INSERT INTO stage_cash
      (SELECT uuid, project_id, date, debtor_uuid, currency_id, amount, user_id, cashbox_id, description, is_caution);
  END IF;
END $$

CREATE PROCEDURE StageCashItem(
  IN uuid BINARY(16),
  IN cash_uuid BINARY(16),
  IN invoice_uuid BINARY(16)
)
BEGIN
  -- verify if cash_item stage already exists within this connection, if the
  -- stage already exists simply write to it, otherwise create it select into it
  DECLARE `no_cash_item_stage` TINYINT(1) DEFAULT 0;
  DECLARE CONTINUE HANDLER FOR SQLSTATE '42S02' SET `no_cash_item_stage` = 1;
  SELECT NULL FROM `stage_cash_item` LIMIT 0;

  IF (`no_cash_item_stage` = 1) THEN
    CREATE TEMPORARY TABLE stage_cash_item
      (INDEX invoice_uuid (invoice_uuid))
      SELECT uuid, cash_uuid, invoice_uuid;

  ELSE
    INSERT INTO stage_cash_item
      (SELECT uuid, cash_uuid, invoice_uuid);
  END IF;
END $$

-- This makes sure the temporary tables exist before using them
CREATE PROCEDURE VerifyCashTemporaryTables()
BEGIN
  CREATE TEMPORARY TABLE IF NOT EXISTS stage_cash_records (
    uuid BINARY(16), debit DECIMAL(19,4), credit DECIMAL(19,4), entity_uuid BINARY(16), date TIMESTAMP,
    INDEX uuid (uuid),
    INDEX entity_uuid (entity_uuid)
  );

  CREATE TEMPORARY TABLE IF NOT EXISTS stage_cash_references (
    uuid BINARY(16), debit DECIMAL(19,4), credit DECIMAL(19,4), entity_uuid BINARY(16), date TIMESTAMP,
    INDEX uuid (uuid),
    INDEX entity_uuid (entity_uuid)
  );

  CREATE TEMPORARY TABLE IF NOT EXISTS stage_cash_invoice_balances (
    uuid BINARY(16), balance DECIMAL(19, 4), date TIMESTAMP,
    INDEX uuid (uuid)
  );
END $$

-- This calculates the amount due on previous invoices based on what is being paid
CREATE PROCEDURE CalculateCashInvoiceBalances(
  IN cashUuid BINARY(16)
)
BEGIN
  DECLARE cashDate DATETIME;
  DECLARE cashCurrencyId INT;
  DECLARE cashEnterpriseId INT;
  DECLARE cashDebtorUuid BINARY(16);
  DECLARE enterpriseCurrencyId INT;
  DECLARE currentExchangeRate DECIMAL(19,4);

  -- copy cash payment values into working variables
  SELECT cash.date, cash.currency_id, enterprise.id, enterprise.currency_id, cash.debtor_uuid
    INTO cashDate, cashCurrencyId, cashEnterpriseId, enterpriseCurrencyId, cashDebtorUuid
  FROM stage_cash AS cash
    JOIN project ON cash.project_id = project.id
    JOIN enterprise ON project.enterprise_id = enterprise.id
  WHERE cash.uuid = cashUuid;

  /* calculate the exchange rate for balances based on the stored cash currency */
  SET currentExchangeRate = GetExchangeRate(cashEnterpriseId, cashCurrencyId, cashDate);
  SET currentExchangeRate = (SELECT IF(cashCurrencyId = enterpriseCurrencyId, 1, currentExchangeRate));

  CALL VerifyCashTemporaryTables();

  INSERT INTO stage_cash_records
    SELECT p.record_uuid AS uuid, p.debit_equiv as debit, p.credit_equiv as credit, p.entity_uuid, p.trans_date as date
    FROM posting_journal AS p
    JOIN stage_cash_item AS ci ON
      ci.invoice_uuid = p.record_uuid
    WHERE ci.cash_uuid = cashUuid
    AND p.entity_uuid = cashDebtorUuid;

  INSERT INTO stage_cash_records
    SELECT g.record_uuid AS uuid, g.debit_equiv as debit, g.credit_equiv as credit, g.entity_uuid, g.trans_date as date
    FROM general_ledger AS g
    JOIN stage_cash_item AS ci ON
      ci.invoice_uuid = g.record_uuid
    WHERE ci.cash_uuid = cashUuid
    AND g.entity_uuid = cashDebtorUuid;

  INSERT INTO stage_cash_references
    SELECT p.reference_uuid AS uuid, p.debit_equiv as debit, p.credit_equiv as credit, p.entity_uuid, p.trans_date as date
    FROM posting_journal AS p
    JOIN stage_cash_item AS ci ON
      ci.invoice_uuid = p.reference_uuid
    WHERE ci.cash_uuid = cashUuid
    AND p.entity_uuid = cashDebtorUuid;

  INSERT INTO stage_cash_references
    SELECT g.reference_uuid AS uuid, g.debit_equiv as debit, g.credit_equiv as credit, g.entity_uuid, g.trans_date as date
    FROM general_ledger AS g
    JOIN stage_cash_item AS ci ON
      ci.invoice_uuid = g.reference_uuid
    WHERE ci.cash_uuid = cashUuid
    AND g.entity_uuid = cashDebtorUuid;

  INSERT INTO stage_cash_invoice_balances
    SELECT zz.uuid, zz.balance, zz.date
    FROM (
      SELECT ledger.uuid, (SUM(ledger.debit - ledger.credit) * currentExchangeRate) AS balance, MIN(ledger.date) AS date
      FROM (
        SELECT crec.uuid, crec.debit, crec.credit, crec.entity_uuid, crec.date FROM stage_cash_records AS crec
      UNION ALL
        SELECT cref.uuid, cref.debit, cref.credit, cref.entity_uuid, cref.date FROM stage_cash_references AS cref
      ) AS ledger
      GROUP BY ledger.uuid
    ) AS zz ORDER BY zz.date;
END $$

/*
  WriteCashItems

  Allocates cash payment to invoices, making sure that the debtor does not
  overpay the invoice amounts.
*/
CREATE PROCEDURE WriteCashItems(
  IN cashUuid BINARY(16)
)
BEGIN

  DECLARE cashAmount DECIMAL(19, 4);
  DECLARE minMonentaryUnit DECIMAL(19,4);

  DECLARE totalInvoiceCost DECIMAL(19,4);
  DECLARE amountToAllocate DECIMAL(19,4);
  DECLARE allocationAmount DECIMAL(19,4);
  DECLARE invoiceUuid BINARY(16);
  DECLARE invoiceBalance DECIMAL(19,4);
  DECLARE done INT DEFAULT FALSE;

  -- error condition states
  DECLARE Overpaid CONDITION FOR SQLSTATE '45501';

  -- CURSOR for allocation of payments to invoice costs.
  DECLARE curse CURSOR FOR SELECT invoice.uuid, invoice.balance FROM stage_cash_invoice_balances AS invoice;

  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

  -- set local variables
  SELECT cash.amount, currency.min_monentary_unit
    INTO cashAmount, minMonentaryUnit
  FROM cash JOIN currency ON currency.id = cash.currency_id
  WHERE cash.uuid = cashUuid;

  /*
    Calculate the balances on invoices to pay.
    NOTE: this assumes that CalculateCashInvoiceBalances(cashUuid) has been called before this procedure
  */
  SET totalInvoiceCost = (SELECT IFNULL(SUM(invoice.balance), 0) FROM stage_cash_invoice_balances AS invoice);

  /*
    If the difference between the paid amount and the totalInvoiceCost is greater than the
    minMonentaryUnit, the client has overpaid.
  */
  IF ((cashAmount - totalInvoiceCost)  > minMonentaryUnit) THEN
    SET @text = CONCAT(
      'The invoices appear to be overpaid.  The total cost of all invoices are ',
      CAST(totalInvoiceCost AS char), ' but the cash payment amount is ', CAST(cashAmount AS char)
    );

    SIGNAL Overpaid SET MESSAGE_TEXT = @text;
  END IF;

  /*
   NOTE
   It is possible to underpay.  This is never checked - the loop will
   simply exit early and the other invoices will not be credited.

   Loop through the table of invoice balances, allocating money from the total payment to
   balance those invoices.
  */
  SET amountToAllocate = cashAmount;

  OPEN curse;

  allocateCashPayments: LOOP
    FETCH curse INTO invoiceUuid, invoiceBalance;

    IF done THEN
      LEAVE allocateCashPayments;
    END IF;

    -- figure out how much to allocate
    IF (amountToAllocate - invoiceBalance > 0) THEN
      SET amountToAllocate = amountToAllocate - invoiceBalance;
      SET allocationAmount = invoiceBalance;
    ELSE
      SET allocationAmount = amountToAllocate;
      SET amountToAllocate = 0;
      SET done = TRUE;
    END IF;

    INSERT INTO cash_item
      SELECT stage_cash_item.uuid, stage_cash_item.cash_uuid, allocationAmount, invoiceUuid
      FROM stage_cash_item
      WHERE stage_cash_item.invoice_uuid = invoiceUuid AND stage_cash_item.cash_uuid = cashUuid LIMIT 1;

  END LOOP allocateCashPayments;
END $$

CREATE PROCEDURE WriteCash(
  IN cashUuid BINARY(16)
)
BEGIN

  -- cash details
  INSERT INTO cash (uuid, project_id, date, debtor_uuid, currency_id, amount, user_id, cashbox_id, description, is_caution)
    SELECT * FROM stage_cash WHERE stage_cash.uuid = cashUuid;
END $$
