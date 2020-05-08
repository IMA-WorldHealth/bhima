/*
 * @author: mbayopanda
 * @date: 2020-04-20
 */
INSERT INTO unit VALUES
  (269, 'Inventory Adjustment', 'TREE.INVENTORY_ADJUSTMENT', 'Inventory Adjustment', 160, '/modules/stock/inventory-adjustment/inventory-adjustment.html', '/stock/inventory-adjustment');

INSERT INTO flux VALUES 
  (14, 'STOCK_FLUX.INVENTORY_RESET'),
  (15, 'STOCK_FLUX.INVENTORY_ADJUSTMENT');
  

/*
 * @author: @lomamech
 * @date: 2020-04-29
 */
INSERT INTO unit VALUES
  (270, 'compare invoiced to received','TREE.COMPARE_INVOICED_RECEIVED','Compare invoiced items to received stock', 144,'/modules/reports/invoicedReceivedStock','/reports/invoicedReceivedStock');

INSERT INTO `report` (`report_key`, `title_key`) VALUES
  ('invoicedReceivedStock', 'REPORT.COMPARE_INVOICED_RECEIVED.TITLE');
