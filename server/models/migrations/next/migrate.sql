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
