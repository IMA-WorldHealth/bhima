/*
 * DATABASE CHANGES FOR VERSION 1.4.0 TO 1.5.0 
 */

/*
 * @author: mbayopanda
 * @date: 2019-09-22
 * @description: realized profit report
 */
INSERT INTO unit VALUES
  (249, 'Realized Profit Report', 'TREE.REALIZED_PROFIT_REPORT', 'Realized Profit Report', 144, '/modules/reports/realizedProfit', '/reports/realizedProfit');

INSERT INTO report (id, report_key, title_key) VALUES
  (39, 'realizedProfit', 'REPORT.REALIZED_PROFIT.TITLE');

/*
 * @author: jeremielodi
 */
DROP TABLE IF EXISTS `inventory_log`;
CREATE TABLE `inventory_log` (
  `uuid` BINARY(16) NOT NULL,
  `inventory_uuid` BINARY(16) NOT NULL,
  `log_timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `text` text,
  `user_id` smallINT(5) UNSIGNED NOT NULL,
  PRIMARY KEY (`uuid`),
  KEY `inventory_uuid` (`inventory_uuid`),
  KEY `user_id` (`user_id`),
  FOREIGN KEY (`inventory_uuid`) REFERENCES `inventory` (`uuid`),
  FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;
