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

DELIMITER ;

-- author: jniles
-- date: 30/05/2019
-- Fix primary key collisions at HEV.
ALTER TABLE invoice_invoicing_fee DROP PRIMARY KEY;
ALTER TABLE invoice_invoicing_fee ADD PRIMARY KEY (invoice_uuid, invoicing_fee_id);

INSERT INTO unit VALUES
(241, 'Multiple Payroll by indice','TREE.MULTI_PAYROLL_INDICE','Multiple Payroll (indice)', 57,'/modules/multiple_payroll_indice','/multiple_payroll_indice');
  
/*
 * @author: mbayopanda
 * @date: 2019-05-31
*/
ALTER TABLE `service` ADD COLUMN project_id SMALLINT(5) UNSIGNED NOT NULL;

/*
 * @author: mbayopanda
 * @date: 2019-06-11
 * @description:
 * fix depot path, the id is 20, but we just use name and key
 * to be sure we update depot for all databases
*/
UPDATE unit SET path="/depots" WHERE `name`="Depot Management" AND `key`="DEPOT.TITLE";


/*
 * @author: jeremielodi
 * @date: 2019-06-07
*/
ALTER TABLE `period` ADD COLUMN `translate_key` VARCHAR(40) NULL;
ALTER TABLE `period` ADD COLUMN `year` VARCHAR(10) NULL;


DELIMITER $$

DROP PROCEDURE IF EXISTS `UpdatePeriodLabels`$$
CREATE   PROCEDURE `UpdatePeriodLabels`()
BEGIN
DECLARE _id mediumint(8) unsigned;
DECLARE _start_date, _end_date DATE;

DECLARE done BOOLEAN;
DECLARE curs1 CURSOR FOR 
   SELECT id, start_date, end_date FROM period;

DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

OPEN curs1;
    read_loop: LOOP
    FETCH curs1 INTO _id, _start_date, _end_date;
        IF done THEN
            LEAVE read_loop;
        END IF;
         UPDATE period SET 
			  period.translate_key = CONCAT('TABLE.COLUMNS.DATE_MONTH.', UPPER(DATE_FORMAT(_start_date, "%M"))),
			  period.year =  YEAR(_start_date)
			WHERE period.id = _id;
    END LOOP;
CLOSE curs1;
END$$
DELIMITER ;

-- update columns 
call UpdatePeriodLabels();
 * @author : jeremie Lodi
 * payroll using indices
*/

DROP TABLE IF EXISTS `staffing_indice`;

CREATE TABLE `staffing_indice` (
  `uuid` BINARY(16) NOT NULL,
  `employee_uuid` BINARY(16) NOT NULL,
  `grade_uuid` BINARY(16) NOT NULL,
  `fonction_id`   TINYINT(3) UNSIGNED DEFAULT NULL,
  `grade_indice` DECIMAL(19,4) NOT NULL,
  `function_indice` DECIMAL(19,4) NOT NULL,
  `date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`uuid`),
  FOREIGN KEY (`employee_uuid`) REFERENCES `employee` (`uuid`),
  FOREIGN KEY (`fonction_id`) REFERENCES `fonction` (`id`),
  FOREIGN KEY (`grade_uuid`) REFERENCES `grade` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `staffing_grade_indice`;
CREATE TABLE `staffing_grade_indice` (
  `uuid` BINARY(16) NOT NULL,
  `value`  DECIMAL(19,4) NOT NULL,
  `grade_uuid` BINARY(16) NOT NULL,
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `grade_uuid_uniq`(`grade_uuid`),
  FOREIGN KEY (`grade_uuid`) REFERENCES `grade` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `staffing_function_indice`;
CREATE TABLE `staffing_function_indice` (
  `uuid` BINARY(16) NOT NULL,
  `value`  DECIMAL(19,4) NOT NULL,
  `fonction_id`   TINYINT(3) UNSIGNED NOT NULL,
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `fonction_id_uniq`(`fonction_id`),
  FOREIGN KEY (`fonction_id`) REFERENCES `fonction` (`id`)
) ENGINE=InnoDB DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;


ALTER TABLE  `rubric_payroll` ADD COLUMN `is_monetary_value`  TINYINT(1) DEFAULT 1;
ALTER TABLE  `rubric_payroll` ADD COLUMN `position`  TINYINT(1) DEFAULT 0;
ALTER TABLE  `rubric_payroll` ADD COLUMN `is_indice` TINYINT(1) DEFAULT 0;


DROP TABLE IF EXISTS `stage_payment_indice`;
CREATE TABLE `stage_payment_indice` (
  `uuid` BINARY(16) NOT NULL,
  `employee_uuid` BINARY(16) NOT NULL,
  `payroll_configuration_id` INT(10) UNSIGNED NOT NULL,
  `currency_id` TINYINT(3) UNSIGNED DEFAULT NULL,
  `rubric_id` INT(10)  UNSIGNED NOT NULL,
  `rubric_value`  DECIMAL(19,4) NOT NULL,
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `paiement_1` (`employee_uuid`, `rubric_id`, `payroll_configuration_id`),
  KEY `employee_uuid` (`employee_uuid`),
  KEY `payroll_configuration_id` (`payroll_configuration_id`),
  KEY `currency_id` (`currency_id`),
  FOREIGN KEY (`employee_uuid`) REFERENCES `employee` (`uuid`),
  FOREIGN KEY (`rubric_id`) REFERENCES `rubric_payroll` (`id`),
  FOREIGN KEY (`payroll_configuration_id`) REFERENCES `payroll_configuration` (`id`),
  FOREIGN KEY (`currency_id`) REFERENCES `currency` (`id`)
) ENGINE=InnoDB DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `staffing_indice_parameters`;
CREATE TABLE `staffing_indice_parameters` (
  `uuid` BINARY(16) NOT NULL,
  `pay_envelope`  DECIMAL(19,4) NOT NULL,
  `working_days`   TINYINT(3) UNSIGNED NOT NULL,
  `payroll_configuration_id` INT(10) UNSIGNED NOT NULL,
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `payroll_config_id`(`payroll_configuration_id`),
  FOREIGN KEY (`payroll_configuration_id`) REFERENCES `payroll_configuration` (`id`)
) ENGINE=InnoDB DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;

