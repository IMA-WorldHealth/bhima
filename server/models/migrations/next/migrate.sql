/* migration script from the version 1.13.1 to the next one */
ALTER TABLE `unit` DROP COLUMN `url`;

-- update units to make sure they are in the right category
UPDATE `unit` SET parent = 57 WHERE id = 183;
UPDATE `unit` SET parent = 57 WHERE id = 184;

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