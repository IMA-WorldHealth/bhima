-- change the pavillion table to ward table
RENAME TABLE pavillion TO ward;

-- insert unit
INSERT INTO unit VALUES 
  (228, 'Ward Configurations', 'TREE.WARD_CONFIGURATION', 'Ward configuration module', 227, '/modules/ward/configuration', '/ward/configuration');

-- patient management tables
DROP TABLE IF EXISTS `room_type`;
CREATE TABLE `room_type`(
 `id` SMALLINT(5) UNSIGNED NOT NULL AUTO_INCREMENT,
 `label` VARCHAR(120) NOT NULL,
  PRIMARY KEY(`id`)
)ENGINE=InnoDB  DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `room`;
CREATE TABLE `room`(
 `uuid` BINARY(16) NOT NULL,
 `label` VARCHAR(120) NOT NULL,
 `description` text NULL,
 `ward_uuid` BINARY(16) NOT NULL,
 `room_type_id` SMALLINT(5) UNSIGNED NULL,
  PRIMARY KEY(`uuid`),
  UNIQUE KEY `room_label_0` (`label`, `ward_uuid`),
  FOREIGN KEY (`ward_uuid`) REFERENCES ward (`uuid`),
  FOREIGN KEY (`room_type_id`) REFERENCES room_type (`id`)
)ENGINE=InnoDB  DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `bed`;
CREATE TABLE `bed`(
 `id` SMALLINT(5) UNSIGNED NOT NULL AUTO_INCREMENT,
 `label` VARCHAR(120) NOT NULL,
 `room_uuid` BINARY(16) NOT NULL,
 `is_occupied` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY(`id`),
  UNIQUE KEY `bed_label_0` (`label`, `room_uuid`),
  FOREIGN KEY (`room_uuid`) REFERENCES room (`uuid`)
)ENGINE=InnoDB  DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;

-- Putting depot to stock module
UPDATE unit SET parent = 160, `key` = 'DEPOT.TITLE' WHERE id = 20;
DELETE FROM role_unit WHERE unit_id=196;
DELETE FROM unit WHERE id=196;





-- indicators

DROP TABLE IF EXISTS `indictor_status`;
CREATE TABLE `indictor_status` (
  `id` SMALLINT(5) UNSIGNED NOT NULL,
  `text` VARCHAR(40) NOT NULL,
  `translate_key` VARCHAR(100) NOT NULL,
  PRIMARY KEY(`id`)
)ENGINE=InnoDB DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `indicator`;
CREATE TABLE `indicator` (
  `uuid` BINARY(16) NOT NULL,
  `status_id` SMALLINT(5) UNSIGNED NOT NULL,
  `period_id` MEDIUMINT(8) UNSIGNED NOT NULL,
  `user_id` SMALLINT(5) UNSIGNED NOT NULL,
  `type` VARCHAR(40) NOT NULL,
  PRIMARY KEY(`uuid`),
  FOREIGN KEY (`period_id`) REFERENCES `period` (`id`) ON UPDATE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON UPDATE CASCADE,
  FOREIGN KEY (`status_id`) REFERENCES `indicator_status` (`id`) ON UPDATE CASCADE
)ENGINE=InnoDB DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `hospitalization_indicator`;
CREATE TABLE `hospitalization_indicator` (
  `uuid` BINARY(16),
  `service_id`SMALLINT(5) UNSIGNED NOT NULL,
  `day_realized` INT DEFAULT 0,
  `bed_number` INT DEFAULT 0,
  `daysOfHospitalization` INT DEFAULT 0,
  `hospitalizedPatients` INT DEFAULT 0,
  `hospitalizedPatientPerDay` INT DEFAULT 0,
  `PatientsDied` INT DEFAULT 0,  
  `indicator_uuid` BINARY(16) NOT NULL,
  PRIMARY KEY (`uuid`),
  FOREIGN KEY (`service_id`) REFERENCES `service` (`id`) ON UPDATE CASCADE,
  FOREIGN KEY (`indicator_uuid`) REFERENCES `indicator` (`uuid`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `personel_indicator`;
CREATE TABLE `personel_indicator` (
  `uuid` BINARY(16),
  `bed_number` INT DEFAULT 0,
  `doctorsNumber` INT DEFAULT 0,
  `nurseNumber` INT DEFAULT 0,
  `caregiversNumber` INT DEFAULT 0,
  `totalStaff` INT DEFAULT 0,
  `externalConsultationNumber` INT DEFAULT 0,
  `consultationNumber` INT DEFAULT 0,
  `surgeryByDoctor` INT DEFAULT 0,
  `day_realized` INT DEFAULT 0,
  `hospitalizedPatients` INT DEFAULT 0,
  `indicator_uuid` BINARY(16) NOT NULL,
  PRIMARY KEY (`uuid`),
  FOREIGN KEY (`indicator_uuid`) REFERENCES `indicator` (`uuid`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `finances_indicator`;
CREATE TABLE `finances_indicator` (
  `uuid` BINARY(16),
  `bed_number` INT DEFAULT 0,
  `totalReceiptAmount` INT DEFAULT 0,
  `subsidyAmount` INT DEFAULT 0,
  `medicationSaleAmount` INT DEFAULT 0,
  `totalExpenseAmount` INT DEFAULT 0,
  `variousChargesAmount` INT DEFAULT 0,
  `purchaseMedicationAmount` INT DEFAULT 0,
  `personalChargeAmount` INT DEFAULT 0,
  `totalOperatingExpenditureAmount` INT DEFAULT 0,
  `totalDepreciationAmount` INT DEFAULT 0,
  `totalDebtAmount` INT DEFAULT 0,
  `totalCashAmount` INT DEFAULT 0,
  `totalStockValueAmount` INT DEFAULT 0,
  `personelNumber` INT DEFAULT 0,
  `indicator_uuid` BINARY(16) NOT NULL,
  PRIMARY KEY (`uuid`),
  FOREIGN KEY (`indicator_uuid`) REFERENCES `indicator` (`uuid`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;

INSERT INTO `indicator_status`(`id`, `text`,`translate_key`)VALUES
  (1, 'incomplete', 'FORM.LABELS.INCOMPLETE'),
  (2, 'complete', 'FORM.LABELS.COMPLETE'),
  (3, 'validated', 'FORM.LABELS.VALIDATED');
