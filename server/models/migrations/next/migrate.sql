
-- @jeremielodi 23-04-2020
-- stock consumption graph report

INSERT INTO unit VALUES
(268, '[Stock] Consumption graph','TREE.STOCK_CONSUMPTION_GRAPH_REPORT','Stock Consumption graph report', 144,'/modules/reports/generated/stock_consumption_graph_report','/reports/stock_consumption_graph_report');
  
INSERT INTO `report` (`report_key`, `title_key`) VALUES
('stock_consumption_graph_report', 'REPORT.STOCK_CONSUMPTION_GRAPH_REPORT.TITLE');