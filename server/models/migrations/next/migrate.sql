/*
 * DATABASE CHANGES FOR VERSION 1.9.1 TO 1.10.0
 */

-- inventory change report
--- by jeremielodi
--- 2019-11-18

INSERT INTO unit (`name`, `key`, `description`, `parent`, `url`, `path`) VALUES
  ('Inventory Changes Report', 'REPORT.INVENTORY_CHANGE.TITLE', 'Inventory Changes Report', 144, '/modules/reports/inventoryChanges', '/reports/inventoryChanges');

INSERT INTO `report` (`report_key`, `title_key`) VALUES
  ('inventoryChanges', 'REPORT.INVENTORY_CHANGE.TITLE');
