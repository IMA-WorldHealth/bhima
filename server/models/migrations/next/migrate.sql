/**
 * Migration from the version 1.16.1
 */

INSERT INTO unit VALUES
  (292, '[Stock] Changes Report', 'REPORT.STOCK_CHANGES.TITLE', 'Stock Changes Report', 282, '/reports/stock_changes');

INSERT INTO `report` (`report_key`, `title_key`) VALUES
  ('stock_changes', 'REPORT.STOCK_CHANGES.TITLE');
