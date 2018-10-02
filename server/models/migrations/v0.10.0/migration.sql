
INSERT INTO unit VALUES
(210, 'unbalanced invoice payments','REPORT.UNBALANCED_INVOICE_PAYMENTS_REPORT.TITLE','',144,'/modules/reports/unbalanced_invoice_payments_report','/reports/unbalanced_invoice_payments_report');

INSERT INTO `report` (`id`, `report_key`, `title_key`) VALUES
(23, 'unbalanced_invoice_payments_report', 'REPORT.UNBALANCED_INVOICE_PAYMENTS_REPORT.TITLE');


-- This Procedure retrieve the balace(debit, credit) of each invoices during a specified period

DROP PROCEDURE IF EXISTS `UnbalancedInvoicePayments`$$
CREATE   PROCEDURE `UnbalancedInvoicePayments`(IN dateFrom DATE, IN dateTo DATE)
BEGIN
  DECLARE _uuid, _debtor_uuid, _tempRef BINARY(16);
  DECLARE _invoiceID VARCHAR(100);
  DECLARE _date DATE;

  DECLARE done BOOLEAN;
  DECLARE curs1 CURSOR FOR 
    SELECT  i.uuid, i.debtor_uuid, i.date 
    FROM invoice i
    WHERE i.date BETWEEN dateFrom AND dateTo
    ORDER BY DATE;
   
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

  -- all invoice balances will be stored temporarely in stage_invoice_balance table

  DROP TEMPORARY TABLE IF EXISTS stage_invoice_balance;
  CREATE TEMPORARY TABLE IF NOT EXISTS stage_invoice_balance(
    invoice_uuid BINARY(16),
    debit DECIMAL(19, 4),
    credit DECIMAL(19, 4),
    debtor_uuid BINARY(16),
    DATE DATE
  );

  OPEN curs1;
    read_loop: LOOP
    FETCH curs1 INTO _uuid, _debtor_uuid, _date;
      IF done THEN
        LEAVE read_loop;
      END IF;
    
      
      INSERT INTO stage_invoice_balance
      SELECT _uuid, SUM(iv.debit_equiv) AS debit, SUM(iv.credit_equiv) AS credit, _debtor_uuid, _date
      FROM
	      ( SELECT p.debit_equiv, p.credit_equiv
          FROM posting_journal p
          WHERE (p.record_uuid = _uuid OR p.reference_uuid = _uuid) AND p.entity_uuid = _debtor_uuid
          UNION ALL
          SELECT p.debit_equiv, p.credit_equiv
          FROM general_ledger p
          WHERE  (p.record_uuid = _uuid OR p.reference_uuid = _uuid) AND p.entity_uuid = _debtor_uuid
        ) AS iv;

    END LOOP;
  CLOSE curs1;

  SELECT   BUID(iv.invoice_uuid) AS invoice_uuid, BUID(iv.debtor_uuid) AS debtor_uuid, 
	  iv.debit, iv.credit, DATE AS creation_date,  (iv.debit - iv.credit) AS balance,
	  (iv.credit/iv.debit) AS paymentPercentage , dm.text AS reference
  FROM stage_invoice_balance iv
  JOIN document_map dm ON iv.invoice_uuid = dm.uuid
  WHERE  iv.debit <> iv.credit;

  

END$$
