/*

--------
OVERVIEW
--------

This procedures file contains all procedures for creating vouchers.  A "voucher"
is a generic accounting document that can model essentially any transaction.
Given their flexibility, they are expected to be a user's main method of
creating non-standard transactions, such as recording generic payments or
balancing accounts.  All transactions that are not an invoice or cash payment
are modeled as vouchers.

Unlike cash payments and invoices, where many additional calculations may need
to take place prior to writing the transaction, vouchers alone have no
additional preprocessing.  For this reason, they are missing the StageVoucher()
and StageVoucherItem() methods.  The tables can be written to directly from JS.

There is also a special facility for reversing transactions.  In double-entry
accounting, to reverse a transaction, one only needs to flip the debits and
credits of a previous transaction.  However, this does not capture the reason
for which the transaction needed to be reversed.  To overcome this limitation,
BHIMA implements ReverseTransaction(), which adds special text to the previous
transaction's description, as well as points the voucher's "reference_uuid"
column to the reversed transaction.  Despite a similar sounding name, the
"reference_uuid" column is never written to the posting_journal.  It is used
only for reference lookups on the voucher table.
*/


/*
CALL PostVoucher();

DESCRIPTION
This function posts a voucher that has already been written to the vouchers
table.  The route will convert currencies from the given currency into the
enterprise currency directly as it writes the values into the posting_journal.
*/
CREATE PROCEDURE PostVoucher(
  IN uuid BINARY(16)
)
BEGIN
  DECLARE enterprise_id INT;
  DECLARE project_id INT;
  DECLARE currency_id INT;
  DECLARE date TIMESTAMP;

  -- variables to store core set-up results
  DECLARE fiscal_year_id MEDIUMINT(8) UNSIGNED;
  DECLARE period_id MEDIUMINT(8) UNSIGNED;
  DECLARE current_exchange_rate DECIMAL(19, 4) UNSIGNED;
  DECLARE enterprise_currency_id TINYINT(3) UNSIGNED;
  DECLARE transaction_id VARCHAR(100);
  DECLARE gain_account_id INT UNSIGNED;
  DECLARE loss_account_id INT UNSIGNED;

  --
  SELECT p.enterprise_id, p.id, v.currency_id, v.date
    INTO enterprise_id, project_id, currency_id, date
  FROM voucher AS v JOIN project AS p ON v.project_id = p.id
  WHERE v.uuid = uuid;

  -- populate core setup values
  CALL PostingSetupUtil(date, enterprise_id, project_id, currency_id, fiscal_year_id, period_id, current_exchange_rate, enterprise_currency_id, transaction_id, gain_account_id, loss_account_id);

  -- make sure the exchange rate is correct
  SET current_exchange_rate = GetExchangeRate(enterprise_id, currency_id, date);
  SET current_exchange_rate = (SELECT IF(currency_id = enterprise_currency_id, 1, current_exchange_rate));

  -- POST to the posting journal
  INSERT INTO posting_journal (uuid, project_id, fiscal_year_id, period_id,
    trans_id, trans_date, record_uuid, description, account_id, debit,
    credit, debit_equiv, credit_equiv, currency_id, entity_uuid,
    reference_uuid, comment, origin_id, user_id)
  SELECT
    HUID(UUID()), v.project_id, fiscal_year_id, period_id, transaction_id, v.date,
    v.uuid, v.description, vi.account_id, vi.debit, vi.credit,
    vi.debit * (1 / current_exchange_rate), vi.credit * (1 / current_exchange_rate), v.currency_id,
    vi.entity_uuid, vi.document_uuid, NULL, v.type_id, v.user_id
  FROM voucher AS v JOIN voucher_item AS vi ON v.uuid = vi.voucher_uuid
  WHERE v.uuid = uuid;

  -- NOTE: this does not handle any rounding - it simply converts the currency as needed.
END $$

/*
CALL ReverseTransaction()

DESCRIPTION
A unique procedure specifically for reversing cash payments or invoices.  It
should not be called for vouchers.  The procedures will simply copy the previous
transaction and create a voucher reversing the debits and credits of the
transaction.  In double-entry accounting, this will effectively annul the last
transaction.  Additionally, the voucher will store the uuid of the record that
is being reversed in the "reference_uuid" column of the "voucher" table.  This
enables filters to look up the reversing entry later for any cash payment or
invoice.

Once the procedure has finished, the corresponding cash or invoice record will
have the "reversed" column set to "1".
*/
CREATE PROCEDURE ReverseTransaction(
  IN uuid BINARY(16),
  IN user_id INT,
  IN description TEXT,
  IN voucher_uuid BINARY(16)
)
BEGIN
  -- NOTE: someone should check that the record_uuid is not used as a reference_uuid somewhere
  -- This is done in JS currently, but could be done here.
  DECLARE isInvoice BOOLEAN;
  DECLARE isCashPayment BOOLEAN;
  DECLARE reversalType INT;

  SET reversalType = 10;

  SET isInvoice = (SELECT IFNULL((SELECT 1 FROM invoice WHERE invoice.uuid = uuid), 0));

  -- avoid a scan of the cash table if we already know this is an invoice reversal
  IF NOT isInvoice THEN
    SET isCashPayment = (SELECT IFNULL((SELECT 1 FROM cash WHERE cash.uuid = uuid), 0));
  END IF;

  -- @fixme - why do we have `amount` in the voucher table?
  -- @todo - make only one type of reversal (not cash, credit, or voucher)

  INSERT INTO voucher (uuid, date, project_id, currency_id, amount, description, user_id, type_id, reference_uuid)
    SELECT voucher_uuid, NOW(), zz.project_id, enterprise.currency_id, 0, CONCAT_WS(' ', '(REVERSAL)', description), user_id, reversalType, uuid
    FROM (
      SELECT pj.project_id, pj.description FROM posting_journal AS pj WHERE pj.record_uuid = uuid
      UNION ALL
      SELECT gl.project_id, gl.description FROM general_ledger AS gl WHERE gl.record_uuid = uuid
    ) AS zz
      JOIN project ON zz.project_id = project.id
      JOIN enterprise ON project.enterprise_id = enterprise.id
    LIMIT 1;

  -- NOTE: the debits and credits are swapped on purpose here
  INSERT INTO voucher_item (uuid, account_id, debit, credit, voucher_uuid, document_uuid, entity_uuid)
    SELECT HUID(UUID()), zz.account_id, zz.credit_equiv, zz.debit_equiv, voucher_uuid, zz.reference_uuid, zz.entity_uuid
    FROM (
      SELECT pj.account_id, pj.credit_equiv, pj.debit_equiv, pj.reference_uuid, pj.entity_uuid
      FROM posting_journal AS pj WHERE pj.record_uuid = uuid
      UNION ALL
      SELECT gl.account_id, gl.credit_equiv, gl.debit_equiv, gl.reference_uuid, gl.entity_uuid
      FROM general_ledger AS gl WHERE gl.record_uuid = uuid
    ) AS zz;

  -- update the "amount" with the sum of the voucher_items.  We could choose either
  -- debits or credits to sum here ... they should be equivalent.
  UPDATE voucher SET amount = (
    SELECT SUM(vi.debit) FROM (
      SELECT * FROM voucher_item) AS vi WHERE vi.voucher_uuid = voucher.uuid
    ) WHERE voucher.uuid = voucher_uuid;

  -- make sure we update the invoice with the fact that it got reversed.
  IF isInvoice THEN
    UPDATE invoice SET reversed = 1 WHERE invoice.uuid = uuid;
  END IF;

  -- make sure we update the cash payment that was reversed
  IF isCashPayment THEN
    UPDATE cash SET reversed = 1 WHERE cash.uuid = uuid;
  END IF;

  CALL PostVoucher(voucher_uuid);
END $$
