/* v1.28.x */

-- remove references to stock_changes report
DELETE FROM unit WHERE `path` = '/reports/stock_changes';
DELETE FROM report where `report_key` = 'stock_changes';
