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