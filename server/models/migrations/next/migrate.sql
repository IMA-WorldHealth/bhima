-- next release v1.34.0
/*
 * @author: lomamech
 * @date: 2024-08-24
 * @description: Categorize Debtor Group: Distinguishing Insolvent and Solvent Entities
 */
ALTER TABLE `debtor_group` ADD COLUMN `is_insolvent` TINYINT(1) NOT NULL DEFAULT 0 AFTER `color`;
ALTER TABLE `debtor_group` ADD COLUMN `is_non_client_debtor_groups` TINYINT(1) NOT NULL DEFAULT 0 AFTER `is_insolvent`;