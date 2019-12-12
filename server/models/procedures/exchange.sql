DELIMITER $$
/*

--------
OVERVIEW
--------

These procedures encompass operations updating exchange rates and balances relating
to those exchange rates.

BHIMA is a multi-currency system, which means that account balances can be kept in different
currencies. However, the underlying value is always stored in the enterprise currency.  This
is found in the debit_equiv and credit_equiv columns, and in the period_total table.  There is
a trade-off with this method of storing values though: accounts in a currency different from
the enterprise currency are affected by changing exchange rates.

To illustrate, suppose there exists an enterprise with balances held in $USD.  Suppose further
the enterprise has a cashbox in FC with 10,000FC in the cashbox.  At an exchange rate of 1600FC to
1$USD, the value of this cashbox in the enterprise currency (and hence, in the period_total table)
is $6.25USD.  Finally, suppose the exchange rate increases to 1650FC/USD. What does the balance
report indicate the value of the cashbox is?

Without any further action, the balance report will indicate 10,312.5FC in the cashbox, even though
the physical cash is only 10,000FC. To ensure that the balance report maintains the correct balance,
the system must write a correcting entry that removes 312.5FC from the cashbox at the time of
exchange.  This is called gain or loss on exchange.

*/

/*

DROP PROCEDURE IF EXISTS `GetBalanceOfCurrenciedAccounts`$$
CREATE PROCEDURE `GetBalanceOfCurrenciedAccounts` (
  IN _enterprise_id SMALLINT,
  IN _currency_id TINYINT
)
BEGIN
  DECLARE _enterprise_currency_id TINYINT UNSIGNED;

  DROP TEMPORARY TABLE tmp_currency_account_balances;
  CREATE TEMPORARY TABLE tmp_currency_account_balances (
    SELECT project_id, uuid, cost, debtor_uuid, service_id, user_id, date,
      description
  );

  SELECT enterprise.currency_id
    INTO _enterprise_currency_id
  FROM enterprise WHERE id = _enterprise_id;

  SELECT c.account_id , a.label, a.number,
    0 AS enterprise_currency_balance,
    0 AS foreign_currency_balance,
  FROM cash_box_account_currency c
  JOIN account a ON a.id =  c.account_id
  WHERE currency_id = _currency_id;

END$$
*/

/*



CALL UpdateGainOrLossOnExchangeAccounts();

DESCRIPTION
Creates additional transactions for each non-enterprise currency cashbox with a nonzero balance
to ensure that the balances remain the same after the exchange operation.

*/
DROP PROCEDURE IF EXISTS `UpdateGainOrLossOnExchangeAccounts`$$
CREATE PROCEDURE `UpdateGainOrLossOnExchangeAccounts` (
  IN _enterprise_id INT,
  IN _project_id INT,
  IN _user_id INT,
  IN _currency_id TINYINT,
  IN _date TIMESTAMP,
  IN _rate DECIMAL(19, 12)
)
BEGIN
  DECLARE _account_id, _loss_account_id, _gain_account_id INT(10) UNSIGNED;
  DECLARE _previous_rate, _balance_period_total, _balance_general_ledger, _balance, _difference DECIMAL(19, 4);
  DECLARE _fiscal_year_id, _period_id  mediumint(8) UNSIGNED;
  DECLARE exhange_voucher_uuid BINARY(16);
  DECLARE _description, _account_label VARCHAR(255);

  DECLARE done BOOLEAN;
  DECLARE cash_account_cursor CURSOR FOR
    SELECT c.account_id , CONCAT(a.number , ' - ', a.label)
    FROM cash_box_account_currency c
    JOIN account a ON a.id =  c.account_id
    WHERE currency_id = _currency_id;


  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

  SET _previous_rate = (SELECT GetExchangeRate(_enterprise_id, _currency_id, _date)  LIMIT 1);

  SELECT period.id, period.fiscal_year_id
    INTO _period_id, _fiscal_year_id
  FROM period WHERE period.start_date <= DATE(_date) AND DATE(_date) <= period.end_date LIMIT 1;

  -- get gain or loss on exchange account identifiers
  SELECT loss_account_id, gain_account_id
    INTO _loss_account_id, _gain_account_id
  FROM enterprise WHERE id = _enterprise_id;

  SET _description = "Gain ou perte pour le nouveau taux d'echange(Gain Or Loss for New exchange rate)";

  OPEN cash_account_cursor;
  read_loop: LOOP
    FETCH cash_account_cursor INTO _account_id, _account_label;

    IF done THEN
      LEAVE read_loop;
    END IF;

    -- balance up to current period
    SET _balance_period_total = (
      SELECT SUM(debit - credit)
      FROM period_total
      WHERE account_id = _account_id
        AND fiscal_year_id = _fiscal_year_id
        AND period_id < _period_id
      GROUP BY fiscal_year_id
    );

    -- balance  from the general_ledger
    SET _balance_general_ledger = (
      SELECT SUM(debit_equiv - credit_equiv)
      FROM general_ledger
      WHERE account_id = _account_id
        AND fiscal_year_id = _fiscal_year_id
        AND period_id = _period_id
      GROUP BY fiscal_year_id
    );

    -- get current account balance
    SET _balance = IFNULL(_balance_period_total, 0) + IFNULL(_balance_general_ledger, 0);

    SET _difference = (_rate * _balance) - (_previous_rate * _balance);

    IF (_balance <> 0)  THEN
      SET exhange_voucher_uuid = HUID(uuid());

      INSERT INTO voucher(uuid, date, project_id, currency_id, amount, description, user_id, type_id)
      VALUES(exhange_voucher_uuid, _date, _project_id, _currency_id, ABS(_difference), CONCAT(_description,', ', _account_label), _user_id, 18);

      IF (_difference > 0) THEN
        INSERT INTO voucher_item(uuid, account_id, debit, credit,voucher_uuid)
        VALUES(HUID(uuid()), _loss_account_id, ABS(_difference), 0, exhange_voucher_uuid);

        INSERT INTO voucher_item(uuid, account_id, debit, credit,voucher_uuid)
        VALUES(HUID(uuid()), _account_id, 0, ABS(_difference), exhange_voucher_uuid);
      ELSE

        INSERT INTO voucher_item(uuid, account_id, debit, credit, voucher_uuid)
        VALUES(HUID(uuid()), _gain_account_id, 0,  ABS(_difference), exhange_voucher_uuid);

        INSERT INTO voucher_item(uuid, account_id, debit, credit,voucher_uuid)
        VALUES(HUID(uuid()), _account_id, ABS(_difference), 0, exhange_voucher_uuid);
      END IF;

      CALL PostVoucher(exhange_voucher_uuid);
    END IF;

  END LOOP;
  CLOSE cash_account_cursor;
END$$

DELIMITER ;
