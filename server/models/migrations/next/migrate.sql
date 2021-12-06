/*
 * Migration file from v1.21.1
 */

/*
 * @author: jmcameron
 * @date: 2021-12-06
 */
INSERT IGNORE INTO `unit` VALUES
  (305, 'Average Medical Costs Per Patient', 'TREE.AVERAGE_MED_COST_REPORT', 'Report of avg med costs', 282, '/reports/avg_med_costs_per_patient');

INSERT IGNORE INTO `report` (`report_key`, `title_key`) VALUES
  ('avg_med_costs_per_patient', 'TREE.AVERAGE_MED_COST_REPORT');
