delimiter $$

-- this Procedure help to make quick analyse about unbalanced invoice
-- it create a table name 'unbalancedInvoices' that can be used by the analyser
DROP PROCEDURE IF EXISTS UnbalancedInvoicePaymentsTable$$
CREATE PROCEDURE UnbalancedInvoicePayments(
  IN dateFrom DATE,
  IN dateTo DATE
) BEGIN

  -- this holds all the invoices that were made during the period
  -- two copies are needed for the UNION ALL query.
  DROP TEMPORARY TABLE IF EXISTS tmp_invoices_1;
  CREATE TEMPORARY TABLE tmp_invoices_1 (INDEX uuid (uuid)) AS
    SELECT invoice.uuid, invoice.debtor_uuid, invoice.date
    FROM invoice
    WHERE
      DATE(invoice.date) BETWEEN DATE(dateFrom) AND DATE(dateTo)
      AND reversed = 0
    ORDER BY invoice.date;

  DROP TABLE IF EXISTS tmp_invoices_2;
  CREATE TEMPORARY TABLE tmp_invoices_2 AS SELECT * FROM tmp_invoices_1;

  -- This holds the invoices from the PJ/GL
  DROP TEMPORARY TABLE IF EXISTS tmp_records;
  CREATE TEMPORARY TABLE tmp_records AS
    SELECT ledger.record_uuid AS uuid, ledger.debit_equiv, ledger.credit_equiv
    FROM (
      SELECT pj.record_uuid, pj.debit_equiv, pj.credit_equiv
      FROM posting_journal pj
        JOIN tmp_invoices_1 i ON i.uuid = pj.record_uuid
          AND pj.entity_uuid = i.debtor_uuid

      UNION ALL

      SELECT gl.record_uuid, gl.debit_equiv, gl.credit_equiv
      FROM general_ledger gl
        JOIN tmp_invoices_2 i ON i.uuid = gl.record_uuid
            AND gl.entity_uuid = i.debtor_uuid
  ) AS ledger;

  -- this holds the references/payments against the invoices
  DROP TEMPORARY TABLE IF EXISTS tmp_references;
  CREATE TEMPORARY TABLE tmp_references AS
    SELECT ledger.reference_uuid AS uuid, ledger.debit_equiv, ledger.credit_equiv
    FROM (
      SELECT pj.reference_uuid, pj.debit_equiv, pj.credit_equiv
      FROM posting_journal pj
        JOIN tmp_invoices_1 i ON i.uuid = pj.reference_uuid
          AND pj.entity_uuid = i.debtor_uuid

      UNION ALL

      SELECT gl.reference_uuid, gl.debit_equiv, gl.credit_equiv
      FROM general_ledger gl
        JOIN tmp_invoices_2 i ON i.uuid = gl.reference_uuid
          AND gl.entity_uuid = i.debtor_uuid
  ) AS ledger;

  -- combine invoices and references to get the balance of each invoice.
  -- note that we filter out balanced invoices
  DROP TEMPORARY TABLE IF EXISTS tmp_invoice_balances;
  CREATE TEMPORARY TABLE tmp_invoice_balances AS
    SELECT z.uuid, SUM(z.debit_equiv) AS debit_equiv,
      SUM(z.credit_equiv) AS credit_equiv,
      SUM(z.debit_equiv) - SUM(z.credit_equiv) AS balance
    FROM (
      SELECT i.uuid, i.debit_equiv, i.credit_equiv FROM tmp_records i
      UNION ALL
      SELECT p.uuid, p.debit_equiv, p.credit_equiv FROM tmp_references p
    )z
    GROUP BY z.uuid
    HAVING balance <> 0;

  -- even though this column is called "balance", it is actually the amount remaining
  -- on the invoice.
  SELECT em.text AS debtorReference, debtor.text AS debtorName, balances.debit_equiv AS debit,
    balances.credit_equiv AS credit, iv.date AS creation_date, balances.balance,
     (balances.credit_equiv / IF(balances.debit_equiv = 0, 1, balances.debit_equiv )) AS paymentPercentage,
    dm.text AS reference
  FROM tmp_invoices_1 AS iv
    JOIN tmp_invoice_balances AS balances ON iv.uuid = balances.uuid
    LEFT JOIN document_map AS dm ON dm.uuid = iv.uuid
    JOIN debtor ON debtor.uuid = iv.debtor_uuid
    LEFT JOIN entity_map AS em ON em.uuid = iv.debtor_uuid
  ORDER BY iv.date;
END$$


-- this Procedure help to make quick analyse about unbalanced invoice
-- it create a table name 'unbalancedInvoices' that can be used by the analyser
DROP PROCEDURE IF EXISTS UnbalancedInvoicePaymentsTable$$
CREATE PROCEDURE UnbalancedInvoicePaymentsTable(
  IN dateFrom DATE,
  IN dateTo DATE
) BEGIN

  -- this holds all the invoices that were made during the period
  -- two copies are needed for the UNION ALL query.
  DROP TEMPORARY TABLE IF EXISTS tmp_invoices_1;
  CREATE TEMPORARY TABLE tmp_invoices_1 (INDEX uuid (uuid)) AS
    SELECT invoice.uuid, invoice.debtor_uuid, invoice.date
    FROM invoice
    WHERE
      DATE(invoice.date) BETWEEN DATE(dateFrom) AND DATE(dateTo)
      AND reversed = 0
    ORDER BY invoice.date;

  DROP TEMPORARY TABLE IF EXISTS tmp_invoices_2;
  CREATE TEMPORARY TABLE tmp_invoices_2 AS SELECT * FROM tmp_invoices_1;

  DROP TEMPORARY TABLE IF EXISTS tmp_records;
  -- This holds the invoices from the PJ/GL
  CREATE TEMPORARY TABLE tmp_records AS
    SELECT ledger.record_uuid AS uuid, ledger.debit_equiv, ledger.credit_equiv
    FROM (
      SELECT pj.record_uuid, pj.debit_equiv, pj.credit_equiv
      FROM posting_journal pj
        JOIN tmp_invoices_1 i ON i.uuid = pj.record_uuid
          AND pj.entity_uuid = i.debtor_uuid

      UNION ALL

      SELECT gl.record_uuid, gl.debit_equiv, gl.credit_equiv
      FROM general_ledger gl
        JOIN tmp_invoices_2 i ON i.uuid = gl.record_uuid
            AND gl.entity_uuid = i.debtor_uuid
  ) AS ledger;

  -- this holds the references/payments against the invoices
  DROP TEMPORARY TABLE IF EXISTS tmp_references;
  CREATE TEMPORARY TABLE tmp_references AS
    SELECT ledger.reference_uuid AS uuid, ledger.debit_equiv, ledger.credit_equiv
    FROM (
      SELECT pj.reference_uuid, pj.debit_equiv, pj.credit_equiv
      FROM posting_journal pj
        JOIN tmp_invoices_1 i ON i.uuid = pj.reference_uuid
          AND pj.entity_uuid = i.debtor_uuid

      UNION ALL

      SELECT gl.reference_uuid, gl.debit_equiv, gl.credit_equiv
      FROM general_ledger gl
        JOIN tmp_invoices_2 i ON i.uuid = gl.reference_uuid
          AND gl.entity_uuid = i.debtor_uuid
  ) AS ledger;

  -- combine invoices and references to get the balance of each invoice.
  -- note that we filter out balanced invoices
  DROP TEMPORARY TABLE IF EXISTS tmp_invoice_balances;
  CREATE TEMPORARY TABLE tmp_invoice_balances AS
    SELECT z.uuid, SUM(z.debit_equiv) AS debit_equiv,
      SUM(z.credit_equiv) AS credit_equiv,
      SUM(z.debit_equiv) - SUM(z.credit_equiv) AS balance
    FROM (
      SELECT i.uuid, i.debit_equiv, i.credit_equiv FROM tmp_records i
      UNION ALL
      SELECT p.uuid, p.debit_equiv, p.credit_equiv FROM tmp_references p
    )z
    GROUP BY z.uuid
    HAVING balance <> 0;

  -- even though this column is called "balance", it is actually the amount remaining
  -- on the invoice.

  DROP TEMPORARY TABLE IF EXISTS unbalanced_invoices;
  CREATE TEMPORARY TABLE `unbalanced_invoices` AS (
    SELECT BUID(ivc.uuid) as invoice_uuid , em.text AS debtorReference, debtor.text AS debtorName,
      BUID(debtor.uuid) as debtorUuid,
      balances.debit_equiv AS debit,
      balances.credit_equiv AS credit, iv.date AS creation_date, balances.balance,
      dm.text AS reference, ivc.project_id, p.name as 'projectName', dbtg.name as 'debtorGroupName',
      s.name as 'serviceName', s.id as 'serviceId',
      ((balances.credit_equiv / IF(balances.debit_equiv = 0, 1, balances.debit_equiv )*100)) AS paymentPercentage
    FROM tmp_invoices_1 AS iv
        JOIN invoice ivc ON ivc.uuid = iv.uuid
        JOIN service s On s.id = ivc.service_id
        JOIN debtor dbt ON ivc.debtor_uuid = dbt.uuid
        JOIN debtor_group dbtg ON dbtg.uuid = dbt.group_uuid
        JOIN project p ON p.id = ivc.project_id
      JOIN tmp_invoice_balances AS balances ON iv.uuid = balances.uuid
      LEFT JOIN document_map AS dm ON dm.uuid = iv.uuid
      JOIN debtor ON debtor.uuid = iv.debtor_uuid
      LEFT JOIN entity_map AS em ON em.uuid = iv.debtor_uuid
    ORDER BY iv.date
  );
END$$

-- author: jniles
-- date: 30/05/2019
-- Fix primary key collisions at HEV.
ALTER TABLE invoice_invoicing_fee DROP PRIMARY KEY;
ALTER TABLE invoice_invoicing_fee ADD PRIMARY KEY (invoice_uuid, invoicing_fee_id);

DELIMITER ;
