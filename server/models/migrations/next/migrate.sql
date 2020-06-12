/* migration script from the version 1.13.1 to the next one */

ALTER TABLE `unit` DROP COLUMN `url`;

-- update units to make sure they are in the right category
UPDATE `unit` SET parent = 57 WHERE id = 183;
UPDATE `unit` SET parent = 57 WHERE id = 184;
-- migrate next.sql

/**
@author: jniles:
@date: 2020-05-14
*/
UPDATE `report` SET `report_key` = 'stock_sheet' WHERE `title_key` = 'REPORT.STOCK.INVENTORY_REPORT';
UPDATE `unit` SET `path` = '/reports/stock_sheet', `url` = '/modules/reports/stock_sheet' WHERE id = 182;

/**
@author: jeremielodi:
@date: 2020-05-26
*/
ALTER TABLE enterprise_setting MODIFY `enable_auto_stock_accounting` TINYINT(1) NOT NULL DEFAULT 1;

/**
@author: jniles
@date: 2020-05-27
*/
DROP TABLE IF EXISTS `event`;

/**
 * @author: mbayopanda
 * @date: 2020-06-04
 */
INSERT INTO unit VALUES
  (271, 'Stock Inline Movements', 'TREE.STOCK_INLINE_MOVEMENTS', 'The stock movements registry', 160, '/modules/stock/inline-movements', '/stock/inline-movements');

/**
 * @author: mbayopanda
 * @date: 2020-06-11
 */
DELETE FROM unit WHERE id = 162;