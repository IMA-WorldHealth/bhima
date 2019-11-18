/*
 * DATABASE CHANGES FOR VERSION 1.8.1 TO 1.9.0 
 *
 * DATABASE CHANGES FOR VERSION 1.7.0 TO 1.8.0 
 */

/*
 * @author: mbayopanda
 * @date: 2019-10-21
 */
INSERT INTO `unit` VALUES 
  (262, 'Stock Requisition','TREE.STOCK_REQUISITION','Stock Requisition', 160,'/modules/stock/stock_requisition','/stock/requisition');

DROP TABLE IF EXISTS `status`;
CREATE TABLE `status` (
  `id`              SMALLINT(5) NOT NULL AUTO_INCREMENT,
  `status_key`      VARCHAR(50) NOT NULL,
  `title_key`       VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `stock_requestor_type`;
CREATE TABLE `stock_requestor_type` (
  `id`              SMALLINT(5) NOT NULL AUTO_INCREMENT,
  `type_key`        VARCHAR(50) NOT NULL,
  `title_key`       VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `stock_requisition`;
CREATE TABLE `stock_requisition` (
  `uuid`                BINARY(16) NOT NULL,
  `requestor_uuid`      BINARY(16) NOT NULL,
  `requestor_type_id`   INT(11) NOT NULL,
  `depot_uuid`          BINARY(16) NOT NULL,
  `description`         TEXT NULL,
  `date`                DATETIME NOT NULL,
  `user_id`             SMALLINT(5) UNSIGNED NOT NULL,
  `reference`           INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `status_id`           TINYINT(3) UNSIGNED NOT NULL DEFAULT 1,
  `updated_at`          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at`          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`reference`),
  UNIQUE KEY `stock_requisition_uuid` (`uuid`),
  KEY `requestor_uuid` (`requestor_uuid`),
  KEY `depot_uuid` (`depot_uuid`),
  FOREIGN KEY (`depot_uuid`) REFERENCES `depot` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `stock_requisition_item`;
CREATE TABLE `stock_requisition_item` (
  `requisition_uuid`  BINARY(16) NOT NULL,
  `inventory_uuid`    BINARY(16) NOT NULL,
  `quantity`          INT(11) NOT NULL DEFAULT 0,
  KEY `requisition_uuid` (`requisition_uuid`),
  FOREIGN KEY (`requisition_uuid`) REFERENCES `stock_requisition` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;

-- application process status
INSERT INTO `status` VALUES 
  (1, 'in_progress', 'FORM.LABELS.STATUS_TYPE.IN_PROGRESS'),
  (2, 'done', 'FORM.LABELS.STATUS_TYPE.DONE'),
  (3, 'partially', 'FORM.LABELS.STATUS_TYPE.PARTIALLY'),
  (4, 'draft', 'FORM.LABELS.STATUS_TYPE.DRAFT'),
  (5, 'cancelled', 'FORM.LABELS.STATUS_TYPE.CANCELLED'),
  (6, 'completed', 'FORM.LABELS.STATUS_TYPE.COMPLETED');

-- type of requestors
INSERT INTO `stock_requestor_type` (`type_key`, `title_key`) VALUES 
  ('service', 'FORM.LABELS.SERVICE'),
  ('depot', 'FORM.LABELS.DEPOT');
INSERT INTO `unit` VALUES
  (254, 'Data Collection', 'TREE.DATA_COLLECTION', '', 0, '/modules/data_collection', '/data_collection'),
  (255, 'Fill Form', 'TREE.FILL_FORM', '', 254, '/modules/fill_form', '/fill_form'),
  (256, 'Display Metadata', 'TREE.DISPLAY_METADATA', '', 254, '/modules/display_metadata', '/display_metadata'),
  (257, 'Data Kit', 'TREE.DATA_KIT', 'Data Kit', 254, '/modules/data_kit', '/data_kit'),
  (258, 'Data Collector Management', 'TREE.FORMS_MANAGEMENT', '', 257, '/modules/data_collector_management', '/data_collector_management'),
  (259, 'Choices list management', 'TREE.CHOICES_LIST_MANAGEMENT', '', 257, '/modules/choices_list_management', '/choices_list_management'),
  (260, 'Survey Form', 'TREE.FORMS_CONFIGURATION', '', 257, '/modules/survey_form', '/survey_form'),  
  (261, 'Data Kit Report', 'TREE.DATA_KIT_REPORT', 'Data Kit Report', 144, '/modules/reports/dataKit', '/reports/dataKit');
  
INSERT INTO `report` (`report_key`, `title_key`) VALUES
  ('dataKit', 'TREE.DATA_KIT_REPORT');

-- Survey Form Type
INSERT INTO `survey_form_type` (`id`, `label`, `type`, `is_list`) VALUES
  (1, 'FORM.LABELS.NUMBER', 'number', 0),
  (2, 'FORM.LABELS.TEXT', 'text', 0),
  (3, 'FORM.LABELS.SELECT_ONE', 'select_one', 1),
  (4, 'FORM.LABELS.SELECT_MULTIPLE', 'select_multiple', 1),
  (5, 'FORM.LABELS.NOTE', 'note', 0),
  (6, 'FORM.LABELS.DATE', 'date', 0),
  (7, 'FORM.LABELS.TIME', 'time', 0),
  (8, 'FORM.LABELS.IMAGE', 'image', 0),
  (9, 'FORM.LABELS.CALCULATION', 'calculation', 0),
  (10, 'FORM.LABELS.TEXT_AREA', 'text_area', 0);

-- BHIMA DATA COLLECTOR
-- 2019-11-05

-- inventory change report
--- by jeremielodi
--- 2019-11-18

INSERT INTO unit VALUES
(266, 'Inventory change Report', 'REPORT.INVENTORY_CHANGE.TITLE', 'Inventory change Report', 144, '/modules/reports/inventory_change', '/reports/inventory_change');

INSERT INTO `report` (`report_key`, `title_key`) VALUES
('inventoryChange', 'REPORT.INVENTORY_CHANGE.TITLE');
