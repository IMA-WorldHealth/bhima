
-- @jeremielodi 23-04-2020
-- stock consumption graph report

INSERT INTO unit VALUES
(268, '[Stock] Consumption graph','TREE.STOCK_CONSUMPTION_GRAPH_REPORT','Stock Consumption graph report', 144,'/modules/reports/generated/stock_consumption_graph_report','/reports/stock_consumption_graph_report');
  
INSERT INTO report (`report_key`, `title_key`) VALUES
('stock_consumption_graph_report', 'REPORT.STOCK_CONSUMPTION_GRAPH_REPORT.TITLE');

/*
 * @author: mbayopanda
 * @date: 2020-04-20
 */
INSERT INTO unit VALUES
  (269, 'Inventory Adjustment', 'TREE.INVENTORY_ADJUSTMENT', 'Inventory Adjustment', 160, '/modules/stock/inventory-adjustment/inventory-adjustment.html', '/stock/inventory-adjustment');

INSERT INTO flux VALUES 
  (14, 'STOCK_FLUX.INVENTORY_RESET'),
  (15, 'STOCK_FLUX.INVENTORY_ADJUSTMENT');


--@lomamech 2020-04-25
ALTER TABLE stock_movement ADD COLUMN `period_id` MEDIUMINT(8) UNSIGNED NOT NULL;
ALTER TABLE stock_movement ADD FOREIGN KEY (`period_id`) REFERENCES `period` (`id`);

UPDATE stock_movement AS sm
INNER JOIN (
	SELECT sm.uuid, sm.document_uuid, sm.quantity, MONTH(sm.date) AS m_month, YEAR(sm.date) AS m_movement, p.id AS period_id
	FROM stock_movement AS sm, period AS p
	WHERE ((MONTH(p.start_date) = MONTH(sm.date)) AND (YEAR(p.start_date) = YEAR(sm.date)))
) AS m_p ON sm.uuid = m_p.uuid
SET sm.period_id = m_p.period_id;
