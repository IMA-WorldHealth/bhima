/* migration script from the version 1.13.1 to the next one */
ALTER TABLE `unit` DROP COLUMN `url`;

-- update units to make sure they are in the right category
UPDATE `unit` SET parent = 57 WHERE id = 183;
UPDATE `unit` SET parent = 57 WHERE id = 184;

/**
 * @author: mbayopanda
 * @date: 2020-06-11
 */
DELETE FROM role_unit WHERE unit_id = 162;
DELETE FROM unit WHERE id = 162;

/**
 * @author: mbayopanda
 * @date: 2020-06-23
 */
INSERT INTO unit VALUES
  (271, 'Collection Capacity Report', 'TREE.COLLECTION_CAPACITY_REPORT', 'Collection Capacity Report', 144, '/reports/collectionCapacity');
  
INSERT INTO `report` (`report_key`, `title_key`) VALUES
  ('collectionCapacity', 'REPORT.COLLECTION_CAPACITY.TITLE');