/*
 * Migration file from v1.21.1
 */

 /*
  * @author: mbayopanda
  * @date: 2021-12-04
  */
CALL add_column_if_missing('enterprise_setting', 'enable_require_cost_center_for_posting', 'TINYINT(1) NOT NULL DEFAULT 0 AFTER `posting_payroll_cost_center_mode`');
