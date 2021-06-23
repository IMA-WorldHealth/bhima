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

/** Recompute stock values for all depots */
/** All databases in production must run this script */
CALL RecomputeStockValue(NULL);
