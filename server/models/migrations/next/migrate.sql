
/**
 * Inventory tags table
 */
DROP TABLE IF EXISTS `inventory_tag`;
CREATE TABLE `inventory_tag` (
  `inventory_uuid`          BINARY(16) NOT NULL,
  `tag_uuid`          BINARY(16) NOT NULL,
  FOREIGN KEY (`inventory_uuid`) REFERENCES `inventory` (`uuid`),
  FOREIGN KEY (`tag_uuid`) REFERENCES `tags` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;


/**
 * @author: jmcameron
 * @date: 2021-06-02
 */
INSERT IGNORE INTO `report` (`report_key`, `title_key`) VALUES
('aggregated_stock_consumption', 'REPORT.AGGREGATED_STOCK_CONSUMPTION.TITLE');

INSERT IGNORE INTO `unit` VALUES
(296, 'Agg. Stock Consumption Report','REPORT.AGGREGATED_STOCK_CONSUMPTION.TITLE',
 'aggregated consumption', 282, '/reports/aggregated_stock_consumption');


/**
 * @author: mbayopanda
 * @date: 2021-06-01
 */
INSERT IGNORE INTO `unit` VALUES
(297, 'Journal Log','TREE.JOURNAL_LOG','The Journal log module', 5,'/journal/log');

ALTER TABLE transaction_history ADD COLUMN `value` TEXT DEFAULT NULL;

/* author: jniles
 * @date: 2021-06-15
 */
INSERT INTO `actions`(`id`, `description`) VALUES
  (8, 'USERS.ACTIONS.EDIT_LOT');

/**
 * @author: lomamech
 * @date: 2021-06-17
 * Requisition status
 */
ALTER TABLE `status` ADD COLUMN `class_style` VARCHAR(100) NOT NULL;

UPDATE status SET class_style = 'label label-default' WHERE id = 1;
UPDATE status SET class_style = 'label label-primary' WHERE id = 2;
UPDATE status SET class_style = 'label label-warning' WHERE id = 3;
UPDATE status SET class_style = 'label label-info' WHERE id = 4;
UPDATE status SET class_style = 'label label-danger' WHERE id = 5;
UPDATE status SET class_style = 'label label-success' WHERE id = 6;
UPDATE status SET class_style = 'label label-danger' WHERE id = 7;

/**
 * @author: mbayopanda
 * @date: 2021-06-23
 */
DROP TABLE IF EXISTS `stock_value`;
CREATE TABLE  `stock_value` (
    `depot_uuid` BINARY(16) NOT NULL,
    `inventory_uuid` BINARY(16) NOT NULL,
    `date` DATE NOT NULL,
    `quantity` INT(11) NOT NULL,
    `wac` DECIMAL(19,4) NOT NULL,
    KEY `depot_uuid` (`depot_uuid`),
    KEY `inventory_uuid` (`inventory_uuid`),
    INDEX `depot_inventory` (`depot_uuid`, `inventory_uuid`),
    INDEX `date` (`date`),
    CONSTRAINT `stock_value__depot` FOREIGN KEY (`depot_uuid`) REFERENCES `depot` (`uuid`),
    CONSTRAINT `stock_value__inventory` FOREIGN KEY (`inventory_uuid`) REFERENCES `inventory` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;