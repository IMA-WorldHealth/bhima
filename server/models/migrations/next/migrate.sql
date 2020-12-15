/*
@author : lomamech
@date : 2020-12-15
@subject : Addition of the employee's name, on the description of the transaction in posting journal
*/

DROP PROCEDURE IF EXISTS `PostVoucher`$$
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
  DECLARE current_exchange_rate DECIMAL(19, 8) UNSIGNED;
  DECLARE enterprise_currency_id TINYINT(3) UNSIGNED;
  DECLARE transaction_id VARCHAR(100);
  DECLARE gain_account_id INT UNSIGNED;
  DECLARE loss_account_id INT UNSIGNED;


  DECLARE transIdNumberPart INT;
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

  SET transIdNumberPart = GetTransactionNumberPart(transaction_id, project_id);

  -- POST to the posting journal
  -- @TODO(sfount) transaction ID number reference should be fetched seperately from full transaction ID to model this relationship better
  INSERT INTO posting_journal (uuid, project_id, fiscal_year_id, period_id,
    trans_id, trans_id_reference_number, trans_date, record_uuid, description, account_id, debit,
    credit, debit_equiv, credit_equiv, currency_id, entity_uuid,
    reference_uuid, comment, transaction_type_id, user_id)
  SELECT
    HUID(UUID()), v.project_id, fiscal_year_id, period_id, transaction_id, transIdNumberPart, v.date,
    v.uuid, IF(p.display_name IS NOT NULL, CONCAT(v.description,' / ', p.display_name), v.description) description,
    vi.account_id, vi.debit, vi.credit, vi.debit * (1 / current_exchange_rate), vi.credit * (1 / current_exchange_rate), v.currency_id,
    vi.entity_uuid, vi.document_uuid, NULL, v.type_id, v.user_id
  FROM voucher AS v JOIN voucher_item AS vi ON v.uuid = vi.voucher_uuid
  LEFT JOIN employee AS emp ON emp.creditor_uuid = vi.entity_uuid
  LEFT JOIN patient AS p ON p.uuid = emp.patient_uuid
  WHERE v.uuid = uuid;

  -- NOTE: this does not handle any rounding - it simply converts the currency as needed.
END $$
