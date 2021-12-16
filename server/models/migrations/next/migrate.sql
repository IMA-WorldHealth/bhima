/*
 * Migration file from v1.21.1
 */

/*
 * @author: jmcameron
 * @description: Add new menu item
 * @date: 2021-12-11
 */
INSERT IGNORE INTO `unit` VALUES
  (305, 'Average Medical Costs Per Patient', 'TREE.AVERAGE_MED_COST_REPORT', 'Report of avg med costs', 282, '/reports/avg_med_costs_per_patient');

INSERT IGNORE INTO `report` (`report_key`, `title_key`) VALUES
  ('avg_med_costs_per_patient', 'TREE.AVERAGE_MED_COST_REPORT');

/*
 * @author: jmcameron
 * @description: Hide old cost center menu items
 * @date: 2021-12-09
 */
DELETE FROM role_unit WHERE unit_id IN (220, 221, 222, 223, 230, 231, 232);
DELETE FROM report WHERE report_key IN (
  'cost_center',
  'break_even',
  'break_even_cost_center'
);
DELETE FROM unit WHERE id IN (220, 221, 222, 223, 230, 231, 232);

/*
 * @author: jmcameron
 * @description: Increase precision of exchange rate
 * @date: 2021-12-16
 */
ALTER TABLE `exchange_rate` MODIFY `rate` DOUBLE NOT NULL;

DELIMITER $$
DROP FUNCTION IF EXISTS `GetExchangeRate`$$
CREATE FUNCTION `GetExchangeRate`(
  enterpriseId INT,
  currencyId INT,
  date TIMESTAMP
)
RETURNS DOUBLE DETERMINISTIC
BEGIN
  RETURN (
    SELECT e.rate FROM exchange_rate AS e
    WHERE e.enterprise_id = enterpriseId AND e.currency_id = currencyId AND e.date <= date
    ORDER BY e.date DESC LIMIT 1
  );
END$$
DELIMITER ;
