/* migration script from the version 1.13.1 to the next one */
ALTER TABLE `unit` DROP COLUMN `url`;

-- update units to make sure they are in the right category
UPDATE `unit` SET parent = 57 WHERE id = 183;
UPDATE `unit` SET parent = 57 WHERE id = 184;

/**
 * @author: mbayopanda
 * @date: 2020-06-11
 */
DELETE FROM role_unit WHERE unit_id = 162;
DELETE FROM unit WHERE id = 162;

/**
 * @author: mbayopanda
 * @date: 2020-06-23
 */
INSERT INTO unit VALUES
 (271, 'Collection Capacity Report', 'TREE.COLLECTION_CAPACITY_REPORT', 'Collection Capacity Report', 144, '/reports/collectionCapacity');

INSERT INTO `report` (`report_key`, `title_key`) VALUES
 ('collectionCapacity', 'REPORT.COLLECTION_CAPACITY.TITLE');

/**
* @author: jniles
* @date: 2020-07-06
* @description: migrates the services columns from SMALLINT id -> BINARY uuid.
*/

CREATE TEMPORARY TABLE service_map AS SELECT service.id, service.uuid FROM service;

ALTER TABLE `employee` ADD COLUMN `service_uuid` BINARY(16) DEFAULT NULL;
UPDATE `employee` t JOIN service_map sm ON t.service_id = sm.id SET t.service_uuid = sm.uuid;
ALTER TABLE `employee` DROP FOREIGN KEY `employee_ibfk_2`;
ALTER TABLE `employee` DROP COLUMN `service_id`;
ALTER TABLE `employee` ADD FOREIGN KEY (`service_uuid`) REFERENCES `service` (`uuid`);

ALTER TABLE `patient_visit` ADD COLUMN `last_service_uuid` BINARY(16) DEFAULT NULL;
UPDATE `patient_visit` t JOIN service_map sm ON t.last_service_id = sm.id SET t.last_service_uuid = sm.uuid;
ALTER TABLE `patient_visit` DROP FOREIGN KEY `patient_visit_ibfk_2`;
ALTER TABLE `patient_visit` DROP COLUMN `last_service_id`;
ALTER TABLE `patient_visit` ADD FOREIGN KEY (`last_service_uuid`) REFERENCES `service` (`uuid`);

ALTER TABLE `patient_visit_service` ADD COLUMN `service_uuid` BINARY(16) DEFAULT NULL;
UPDATE `patient_visit_service` t JOIN service_map sm ON t.service_id = sm.id SET t.service_uuid = sm.uuid;
ALTER TABLE `patient_visit_service` DROP FOREIGN KEY `patient_visit_service_ibfk_2`;
ALTER TABLE `patient_visit_service` DROP COLUMN `service_id`;
ALTER TABLE `patient_visit_service` ADD FOREIGN KEY (`service_uuid`) REFERENCES `service` (`uuid`);

ALTER TABLE `invoice` ADD COLUMN `service_uuid` BINARY(16) DEFAULT NULL;
UPDATE `invoice` t JOIN service_map sm ON t.service_id = sm.id SET t.service_uuid = sm.uuid;
ALTER TABLE `invoice` DROP FOREIGN KEY `invoice_ibfk_3`;
ALTER TABLE `invoice` DROP COLUMN `service_id`;
ALTER TABLE `invoice` ADD FOREIGN KEY (`service_uuid`) REFERENCES `service` (`uuid`);

ALTER TABLE `ward` ADD COLUMN `service_uuid` BINARY(16) DEFAULT NULL;
UPDATE `ward` t JOIN service_map sm ON t.service_id = sm.id SET t.service_uuid = sm.uuid;
ALTER TABLE `ward` DROP FOREIGN KEY `ward_ibfk_1`;
ALTER TABLE `ward` DROP COLUMN `service_id`;
ALTER TABLE `ward` ADD FOREIGN KEY (`service_uuid`) REFERENCES `service` (`uuid`);

ALTER TABLE `service_fee_center` ADD COLUMN `service_uuid` BINARY(16) DEFAULT NULL;
UPDATE `service_fee_center` t JOIN service_map sm ON t.service_id = sm.id SET t.service_uuid = sm.uuid;
ALTER TABLE `service_fee_center` DROP FOREIGN KEY `service_fee_center_ibfk_1`;
ALTER TABLE `service_fee_center` DROP COLUMN `service_id`;
ALTER TABLE `service_fee_center` ADD FOREIGN KEY (`service_uuid`) REFERENCES `service` (`uuid`);

ALTER TABLE `indicator` ADD COLUMN `service_uuid` BINARY(16) DEFAULT NULL;
UPDATE `indicator` t JOIN service_map sm ON t.service_id = sm.id SET t.service_uuid = sm.uuid;
ALTER TABLE `indicator` DROP COLUMN `service_id`;
ALTER TABLE `indicator` ADD FOREIGN KEY (`service_uuid`) REFERENCES `service` (`uuid`);


-- update the actual service table
ALTER TABLE `service` MODIFY `id` SMALLINT NOT NULL;
ALTER TABLE `service` DROP PRIMARY KEY;
ALTER TABLE `service` DROP COLUMN `id`;


ALTER TABLE `service` ADD PRIMARY KEY (`uuid`);

/**
@author: lomamech:
@date: 2020-07-09
*/

ALTER TABLE `province` DROP INDEX `province_1`;

ALTER TABLE `sector` DROP INDEX `sector_1`;

ALTER TABLE `village` DROP INDEX `village_1`;


/*
@author jmcameron
@description
Add flag for automatic confirmation of purchase orders to the enterprise settings
*/

ALTER TABLE `enterprise_setting` ADD COLUMN `enable_auto_purchase_order_confirmation` TINYINT(1) NOT NULL DEFAULT 1;
