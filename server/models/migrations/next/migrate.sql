/**
 * @author: lomamech
 * @description: update migrate.sql file for
 * @date: 2022-01-24
*/
UPDATE report SET `report_key` = 'analysis_auxiliary_cashbox', `title_key` = 'REPORT.ANALYSIS_AUX_CASHBOX.TITLE'
  WHERE report_key = 'analysis_auxiliary_cashboxes';

UPDATE unit SET
  `name` = 'Analysis of Cashbox', `key` = 'REPORT.ANALYSIS_AUX_CASHBOX.TITLE', `description` = 'Analysis of auxiliary cashbox', `path` = '/reports/analysis_auxiliary_cashbox'
  WHERE path = '/reports/analysis_auxiliary_cashboxes';

-- regenerate barcodes for lots
UPDATE lot SET barcode = CONCAT('LT', LEFT(HEX(lot.uuid), 8));
