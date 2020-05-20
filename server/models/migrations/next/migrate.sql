-- migrate next.sql

/**
@author: jniles:
@date: 2020-05-14
*/
UPDATE `report` SET `report_key` = 'stock_sheet' WHERE `title_key` = 'REPORT.STOCK.INVENTORY_REPORT';
UPDATE `unit` SET `path` = '/reports/stock_sheet', `url` = '/modules/reports/stock_sheet' WHERE id = 182;
