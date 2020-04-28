
-- @jeremielodi 23-04-2020
-- stock consumption graph report

INSERT INTO unit VALUES
(268, '[Stock] Consumption graph','TREE.STOCK_CONSUMPTION_GRAPH_REPORT','Stock Consumption graph report', 144,'/modules/reports/generated/stock_consumption_graph_report','/reports/stock_consumption_graph_report');
  
INSERT INTO `report` (`report_key`, `title_key`) VALUES
('stock_consumption_graph_report', 'REPORT.STOCK_CONSUMPTION_GRAPH_REPORT.TITLE');
/*
 * @author: mbayopanda
 * @date: 2020-04-20
 */
INSERT INTO `unit` VALUES
  (269, 'Inventory Adjustment', 'TREE.INVENTORY_ADJUSTMENT', 'Inventory Adjustment', 160, '/modules/stock/inventory-adjustment/inventory-adjustment.html', '/stock/inventory-adjustment');

INSERT INTO `flux` VALUES 
  (14, 'STOCK_FLUX.INVENTORY_RESET'),
  (15, 'STOCK_FLUX.INVENTORY_ADJUSTMENT');
