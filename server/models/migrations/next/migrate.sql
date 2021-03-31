/**
  * @author: mbayopanda
  * @date: 2021-03-5
  * @desc: the stock_adjustment_log table
  */
DROP TABLE IF EXISTS `stock_adjustment_log`;
CREATE TABLE `stock_adjustment_log` (
  `movement_uuid` BINARY(16) NOT NULL,
  `created_at`    timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `old_quantity`  INT(11) NOT NULL DEFAULT 0,
  `new_quantity`  INT(11) NOT NULL DEFAULT 0,
  PRIMARY KEY `movement_uuid` (`movement_uuid`)
) ENGINE=InnoDB DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;


/**
@author: jniles
@date: 2021-03-18
@description: add edited flag to the purchase order.
*/
CALL add_column_if_missing('purchase', 'edited', 'BOOLEAN NOT NULL DEFAULT FALSE');
CALL add_column_if_missing('purchase', 'updated_at', 'TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP');

DROP TABLE IF EXISTS `integration`;

/**
  * @author: jmcameron
  * @date: 2021-03-25
  * @desc: Remove obsolete columns from the lots table
  */
CALL drop_column_if_exists('lots', 'delay');
CALL drop_column_if_exists('lots', 'initial_quantity');
CALL drop_column_if_exists('lots', 'quantity');
CALL drop_column_if_exists('lots', 'entry_date');

/**
 * @author: mbayopanda
 * @date: 2021-03-23
 * @desc: modules for CDR reporting from apisoft data
 */
 INSERT INTO unit VALUES
  (295, 'CDR Peremption Reporting','CDR_REPORTING.MODULE_TITLE','CDR reporting module',0,'/CDR_REPORTING_FOLDER'),
  (296, 'CDR Peremption Depot','CDR_REPORTING.DEPOT','CDR reporting depot',295,'/cdr_reporting/depots'),
  (297, 'CDR Peremption Peremption','CDR_REPORTING.PEREMPTION','CDR peremption reporting',295,'/cdr_reporting/peremption');

DROP TABLE IF EXISTS `cdr_reporting_depot`;
CREATE TABLE `cdr_reporting_depot` (
  `uuid` BINARY(16) NOT NULL,
  `text` VARCHAR(191) NOT NULL,
  `last_movement_date` DATETIME DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `cdr_reporting_depot_1` (`text`)
) ENGINE=InnoDB DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `cdr_reporting_article`;
CREATE TABLE `cdr_reporting_article` (
  `depot_uuid` BINARY(16) NOT NULL,
  `code` VARCHAR(30) NOT NULL,
  `nom` VARCHAR(191) NOT NULL,
  KEY (`code`),
  KEY `depot_uuid` (`depot_uuid`)
) ENGINE=InnoDB DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `cdr_reporting_article_lot`;
CREATE TABLE `cdr_reporting_article_lot` (
  `depot_uuid` BINARY(16) NOT NULL,
  `code_article` VARCHAR(30) NOT NULL,
  `numero_lot` VARCHAR(30) NOT NULL,
  `date_peremption` DATETIME DEFAULT NULL,
  KEY `code_article` (`code_article`),
  KEY `numero_lot` (`numero_lot`),
  KEY `depot_uuid` (`depot_uuid`)
) ENGINE=InnoDB DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `cdr_reporting_lot_document`;
CREATE TABLE `cdr_reporting_lot_document` (
  `depot_uuid` BINARY(16) NOT NULL,
  `code_document` VARCHAR(10) NOT NULL,
  `code_article` VARCHAR(30) NOT NULL,
  `numero_lot` VARCHAR(30) NOT NULL,
  `quantite` INTEGER(11) NOT NULL DEFAULT 0,
  `valorisation` DECIMAL(19,4) NOT NULL DEFAULT 0,
  KEY `depot_uuid` (`depot_uuid`),
  KEY `code_document` (`code_document`),
  KEY `code_article` (`code_article`),
  KEY `numero_lot` (`numero_lot`)
) ENGINE=InnoDB DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `cdr_reporting_mouvement_stock`;
CREATE TABLE `cdr_reporting_mouvement_stock` (
  `compteur` INTEGER(11) NOT NULL AUTO_INCREMENT,
  `depot_uuid` BINARY(16) NOT NULL,
  `type` VARCHAR(1) NOT NULL,
  `code_document` VARCHAR(30) NOT NULL,
  `code_article` VARCHAR(30) NOT NULL,
  `date` DATETIME DEFAULT NULL,
  `quantite` INTEGER(11) NOT NULL DEFAULT 0,
  `valorisation` DECIMAL(19,4) NOT NULL DEFAULT 0,
  `periode` VARCHAR(10) NOT NULL ,
  KEY `depot_uuid` (`depot_uuid`),
  KEY (`compteur`),
  KEY (`code_document`),
  KEY (`code_article`),
  KEY (`periode`)
) ENGINE=InnoDB DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `cdr_reporting_aggregated_stock`;
CREATE TABLE `cdr_reporting_aggregated_stock` (
  `depot_uuid` BINARY(16) NOT NULL,
  `expired_distributed` DECIMAL(19,4) NOT NULL DEFAULT 0,
  `stock_at_period` DECIMAL(19,4) NOT NULL DEFAULT 0,
  `peremption_rate` DECIMAL(19,4) NOT NULL DEFAULT 0,
  `expired_distributed_quarter` DECIMAL(19,4) NOT NULL DEFAULT 0,
  `peremption_rate_quarter` DECIMAL(19,4) NOT NULL DEFAULT 0,
  `expired_distributed_semestre` DECIMAL(19,4) NOT NULL DEFAULT 0,
  `peremption_rate_semestre` DECIMAL(19,4) NOT NULL DEFAULT 0,
  `periode` DATETIME DEFAULT NULL ,
  `quarter` SMALLINT(1) NOT NULL DEFAULT 0,
  `semestre` SMALLINT(1) NOT NULL DEFAULT 0,
  KEY `depot_uuid` (`depot_uuid`)
) ENGINE=InnoDB DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;
