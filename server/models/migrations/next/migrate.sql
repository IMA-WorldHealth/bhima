/* @author: lomamech
 * @date: 2020-09-15
 * @description: Stock Requisition Features To Add # 4849
 */

ALTER TABLE `stock_requisition` ADD COLUMN `project_id` SMALLINT(5) UNSIGNED NOT NULL AFTER `user_id`;

ALTER TABLE `stock_requisition` ADD CONSTRAINT `stock_requisition__project` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`);

DROP TABLE IF EXISTS `stock_requisition_movement`;
CREATE TABLE `stock_requisition_movement` (
  `stock_requisition_uuid` BINARY(16) NOT NULL,
  `document_uuid` BINARY(16) NOT NULL,
  KEY `stock_requisition_uuid` (`stock_requisition_uuid`),
  KEY `document_uuid` (`document_uuid`),
  CONSTRAINT `stock_requisition__movement` FOREIGN KEY (`stock_requisition_uuid`) REFERENCES `stock_requisition` (`uuid`),
  CONSTRAINT `stock_movement__requisition` FOREIGN KEY (`document_uuid`) REFERENCES `stock_movement` (`document_uuid`)
) ENGINE=InnoDB DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;

INSERT INTO `status` VALUES
  (7, 'excessive', 'FORM.LABELS.STATUS_TYPE.EXCESSIVE_RECEIVED_QUANTITY');

