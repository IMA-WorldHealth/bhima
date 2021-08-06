/**
 * @author: mbayopanda
 * @date: 2021-06-23
 */
DROP TABLE IF EXISTS `stock_value`;
CREATE TABLE  `stock_value` (
    `inventory_uuid` BINARY(16) NOT NULL,
    `date` DATE NOT NULL,
    `quantity` INT(11) NOT NULL,
    `wac` DECIMAL(19,4) NOT NULL,
    KEY `inventory_uuid` (`inventory_uuid`),
    INDEX `date` (`date`),
    CONSTRAINT `stock_value__inventory` FOREIGN KEY (`inventory_uuid`) REFERENCES `inventory` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;

/** Recompute stock values for all depots */
/** All databases in production must run this script */
CALL RecomputeStockValue(NULL);

/* author: mbayopanda
 * @date: 2021-08-05
 */
CALL add_column_if_missing('depot', 'is_cost_regulator', ' TINYINT(1) UNSIGNED NOT NULL DEFAULT 0');

