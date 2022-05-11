-- migration file for the next BHIMA release


/*
 * @author: jmcameron
 * @description: Reformat reports
 * @date: 2022-05-23
 */
UPDATE `report` set report_key='analysis_auxiliary_cashboxes' WHERE title_key='REPORT.ANALYSIS_AUX_CASHBOX.TITLE';
