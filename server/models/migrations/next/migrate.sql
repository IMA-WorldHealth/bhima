/* v1.6.1 to v1.7.0 */

ALTER TABLE `stock_consumption` MODIFY `period_id` MEDIUMINT(8) UNSIGNED NOT NULL;

ALTER TABLE `stock_consumption` ADD CONSTRAINT `fk_inventory_uuid_sc` FOREIGN KEY (`inventory_uuid`) REFERENCES `inventory` (`uuid`);
ALTER TABLE `stock_consumption` ADD CONSTRAINT `fk_depot_uuid_sc` FOREIGN KEY (`depot_uuid`) REFERENCES `depot` (`uuid`);
ALTER TABLE `stock_consumption` ADD CONSTRAINT `fk_period_id_sc` FOREIGN KEY (`period_id`) REFERENCES `period` (`id`);
