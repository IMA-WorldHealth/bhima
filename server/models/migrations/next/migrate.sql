/*
 * @author: jniles
 * @date 2021-08-09
 * @description: adds report on inventory prices
 */
INSERT IGNORE INTO `report` (`report_key`, `title_key`) VALUES
  ('purchase_prices', 'REPORT.PURCHASE_PRICES.TITLE');

INSERT IGNORE INTO `unit` VALUES
  (298, 'Purchase Prices Report','REPORT.PURCHASE_PRICES.TITLE','Report on purchase prices over time', 285,'/reports/purchase_prices');
