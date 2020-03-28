/*
Migrate to next
 */
-- @lomamech 2020-03-24
ALTER TABLE `enterprise_setting` ADD COLUMN `month_average_consumption` SMALLINT(5) NOT NULL DEFAULT 6;
