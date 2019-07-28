delimiter $$

-- this Procedure help to make quick analyse about unbalanced invoice
-- it create a table name 'unbalancedInvoices' that can be used by the analyser
DROP PROCEDURE IF EXISTS UnbalancedInvoicePayments$$
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
 * @date: 2019-06-14
 * description: entity and entity groups units
 */
INSERT INTO `unit` VALUES
  (240, 'Entity Folder', 'ENTITY.MANAGEMENT', 'Entity Folder', 0, '/modules/entities', '/ENTITY_FOLDER'),
  (241, 'Entity Management','ENTITY.MANAGEMENT','',240,'/modules/entities','/entities'),
  (242, 'Entity Group', 'ENTITY.GROUP.TITLE', 'Entity Group', 240, '/modules/entity_group', '/entity_group');

/*
 * @author: mbayopanda
 * @date: 2019-06-14
 * @description: entity group
*/
DROP TABLE IF EXISTS `entity_group`;
CREATE TABLE `entity_group` (
  `uuid` BINARY(16) NOT NULL,
  `label` VARCHAR(190) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `label` (`label`)
) ENGINE=InnoDB DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `entity_group_entity`;
CREATE TABLE `entity_group_entity` (
  `id` SMALLINT(5) NOT NULL AUTO_INCREMENT,
  `entity_uuid` BINARY(16) NOT NULL,
  `entity_group_uuid` BINARY(16) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;

/*
 * @author: mbayopanda
 * @date: 2019-06-10
 * @description: cron emailing tables
 */
DROP TABLE IF EXISTS `cron`;
CREATE TABLE `cron` (
  `id` SMALLINT(5) NOT NULL AUTO_INCREMENT,
  `label` VARCHAR(150) NOT NULL,
  `value` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `cron_email_report`;
CREATE TABLE `cron_email_report` (
  `id` SMALLINT(5) NOT NULL AUTO_INCREMENT,
  `entity_group_uuid` BINARY(16) NOT NULL,
  `cron_id` SMALLINT(5) NOT NULL,
  `report_id` SMALLINT(5) NOT NULL,
  `params` TEXT NULL,
  `label` VARCHAR(200) NOT NULL,
  `last_send` DATETIME NULL,
  `next_send` DATETIME NULL,
  `has_dynamic_dates` TINYINT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `label` (`label`, `report_id`),
  KEY `entity_group_uuid` (`entity_group_uuid`),
  FOREIGN KEY (`entity_group_uuid`) REFERENCES `entity_group` (`uuid`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;

-- cron
INSERT INTO `cron` (`label`, `value`) VALUES
  ('CRON.DAILY', '0 1 * * *'),
  ('CRON.WEEKLY', '0 1 * * 0'),
  ('CRON.MONTHLY', '0 1 30 * *'),
  ('CRON.YEARLY', '0 1 31 12 *');

/*
 * @author: mbayopanda
 * @date: 2019-06-13
 * @description: enable enterprise settings for auto email report
 */
ALTER TABLE `enterprise_setting` ADD COLUMN `enable_auto_email_report` TINYINT(1) NOT NULL DEFAULT 0;

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

/*
  @author: mbayopanda
  @date: 2019-05-13
  @description: stock entries report
*/
INSERT INTO unit VALUES
  (240, '[Stock] Stock Entry Report','TREE.STOCK_ENTRY_REPORT','Stock Entry Report', 144,'/modules/reports/generated/stock_entry','/reports/stock_entry');

INSERT INTO `report` (`id`, `report_key`, `title_key`) VALUES
  (33, 'stock_entry', 'REPORT.STOCK.ENTRY_REPORT');

/*
  @author:lomamech
  @date: 2019-07-20
  @description: This report allows for monthly analysis of accounts
*/
INSERT INTO unit VALUES
  (244, 'Monthly Balance analysis', 'TREE.MONTHLY_ACCOUNT_ANALYSIS', 'Monthly Balance analysis', 144, '/modules/reports/monthlyBalanceAnalysis', '/reports/monthlyBalanceAnalysis');

INSERT INTO `report` (`id`, `report_key`, `title_key`) VALUES
  (34, 'monthlyBalanceAnalysis', 'REPORT.MONTHLY_ACCOUNT_ANALYSIS.TITLE');

