/*
 * @author: mbayopanda
 * @date: 2020-04-20
 */
INSERT INTO unit VALUES
  (269, 'Inventory Adjustment', 'TREE.INVENTORY_ADJUSTMENT', 'Inventory Adjustment', 160, '/modules/stock/inventory-adjustment/inventory-adjustment.html', '/stock/inventory-adjustment');

INSERT INTO flux VALUES 
  (14, 'STOCK_FLUX.INVENTORY_RESET'),
  (15, 'STOCK_FLUX.INVENTORY_ADJUSTMENT');

ALTER TABLE enterprise_setting ADD COLUMN `enable_daily_consumption` SMALLINT(5) NOT NULL DEFAULT 0;
  