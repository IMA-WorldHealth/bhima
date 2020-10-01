/* @author: lomamech
 * @date: 2020-09-29
 * @description: Stock Requisition Features To Add # 4849
 */

ALTER TABLE `stock_requisition` ADD COLUMN `project_id` SMALLINT(5) UNSIGNED NOT NULL AFTER `user_id`;

ALTER TABLE `stock_requisition` ADD UNIQUE KEY `stock_requisition_2` (`project_id`, `reference`);

ALTER TABLE `stock_requisition` CHANGE COLUMN `reference` `reference` INT(11) UNSIGNED NOT NULL DEFAULT '0';

ALTER TABLE `stock_requisition` DROP PRIMARY KEY, ADD PRIMARY KEY (`uuid`);


ALTER TABLE `stock_requisition` ADD CONSTRAINT `stock_requisition__project` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`);

ALTER TABLE `stock_movement` ADD COLUMN `stock_requisition_uuid` BINARY(16) NULL AFTER `invoice_uuid`;

INSERT INTO `status` VALUES
  (7, 'excessive', 'FORM.LABELS.STATUS_TYPE.EXCESSIVE_RECEIVED_QUANTITY');


/*
 * @author: jmcameron
 * @date: 2020-09-28
 * @pull-release: 4946
 * @description:  Move the stock-related settings from enterprise_setting
 *    to the new stock_setting table.
 * NOTE: This migration should be done immediately after building/loading
 *       the desired database.  If 'yarn dev' is run before the migration
 *       script, this migration will fail since it will try to add a row
 *       that already exists.
 */
INSERT INTO stock_setting(enterprise_id, month_average_consumption,
  default_min_months_security_stock, enable_auto_purchase_order_confirmation,
  enable_auto_stock_accounting, enable_daily_consumption,
  enable_strict_depot_permission, enable_supplier_credit)
SELECT enterprise_id, month_average_consumption,
  default_min_months_security_stock, enable_auto_purchase_order_confirmation,
  enable_auto_stock_accounting, enable_daily_consumption,
  enable_strict_depot_permission, enable_supplier_credit
FROM enterprise_setting;

ALTER TABLE enterprise_setting DROP COLUMN month_average_consumption;
ALTER TABLE enterprise_setting DROP COLUMN default_min_months_security_stock;
ALTER TABLE enterprise_setting DROP COLUMN enable_auto_purchase_order_confirmation;
ALTER TABLE enterprise_setting DROP COLUMN enable_auto_stock_accounting;
ALTER TABLE enterprise_setting DROP COLUMN enable_daily_consumption;
ALTER TABLE enterprise_setting DROP COLUMN enable_strict_depot_permission;
ALTER TABLE enterprise_setting DROP COLUMN enable_supplier_credit;
