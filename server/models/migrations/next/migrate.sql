/*
 * DATABASE CHANGES FOR VERSION 1.5.0 TO 1.6.0 
 */

/*
 * @author: mbayopanda
 * @date: 2019-10-03
 */
DELETE FROM `cron` WHERE `label` = 'CRON.EACH_MINUTE';
INSERT INTO unit VALUES
(250, 'Sytem usage statistic', 'REPORT.SYSTEM_USAGE_STAT.TITLE', 'Sytem usage statistic', 144, '/modules/reports/systemUsageStat', '/reports/systemUsageStat');


INSERT INTO `report` (`report_key`, `title_key`) VALUES
('systemUsageStat', 'REPORT.SYSTEM_USAGE_STAT.TITLE');
