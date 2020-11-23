/**
 * Migration from the version 1.16.1
 */


/*
 * @author: jmcameron
 * @date: 2020-11-18
 * @pull-release: 5129
 * @description: Fix typo in menu report name "System Usage Statistics"
 */
UPDATE `unit` SET name='System Usage Statistics', description='System Usage Statistics' WHERE id=250;

INSERT INTO unit VALUES
  (292, '[Stock] Changes Report', 'REPORT.STOCK_CHANGES.TITLE', 'Stock Changes Report', 282, '/reports/stock_changes');

INSERT INTO `report` (`report_key`, `title_key`) VALUES
  ('stock_changes', 'REPORT.STOCK_CHANGES.TITLE');
