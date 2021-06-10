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
 * @author: mbayopanda
 * @date: 2021-06-01
 */
INSERT INTO `unit` VALUES 
  (297, 'Journal Log','TREE.JOURNAL_LOG','The Jouranl log module', 5,'/journal/log');
  
ALTER TABLE transaction_history ADD COLUMN `value` TEXT DEFAULT NULL;
