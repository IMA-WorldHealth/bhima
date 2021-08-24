/*
 * @author: mbayopanda
 * @date: 2021-08-24
 * @desc: set to decimal the min months of security stock
 */
ALTER TABLE `stock_setting` MODIFY COLUMN `default_min_months_security_stock` DECIMAL(19,4) NOT NULL DEFAULT 2;
ALTER TABLE `depot` MODIFY COLUMN `min_months_security_stock` DECIMAL(19,4) NOT NULL DEFAULT 2;
ALTER TABLE `depot` MODIFY COLUMN `default_purchase_interval` DECIMAL(19,4) NOT NULL DEFAULT 2;