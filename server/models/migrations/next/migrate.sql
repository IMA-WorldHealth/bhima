-- migration file for the next BHIMA release


/*
 * @author: jmcameron
 * @description: Reformat reports
 * @date: 2022-05-23
 */
UPDATE `report` set report_key='analysis_auxiliary_cashboxes' WHERE title_key='REPORT.ANALYSIS_AUX_CASHBOX.TITLE';

/*
 * @author: jniles
 * @description: Remove Profit & Loss Statements
 * @date: 2022-05-31
 */
DELETE FROM saved_report WHERE report_id IN (SELECT id from report where report_key IN ('income_expense', 'income_expense_by_month', 'income_expense_by_year'));
DELETE FROM report WHERE report_key IN ('income_expense', 'income_expense_by_month', 'income_expense_by_year');
DELETE FROM role_unit WHERE unit_id IN (180, 211, 216);
DELETE FROM unit WHERE id IN (180, 211, 216);
