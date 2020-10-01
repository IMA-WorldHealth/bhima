
/*@author : jeremielodi
@date : 2020-08-19
@subject : Donor management
*/
INSERT INTO unit VALUES
(290,'Donors','TREE.DONOR','Donors management',1,'/donors');

ALTER TABLE `donor` 
  ADD COLUMN `email`  VARCHAR(50) DEFAULT NULL,
  ADD COLUMN `phone`  VARCHAR(50) DEFAULT NULL,
  ADD COLUMN `address`  VARCHAR(150) DEFAULT NULL;

CREATE TABLE `donation_item` (
  `uuid` BINARY(16) NOT NULL,
  `donation_uuid`   BINARY(16) NOT NULL,
  `inventory_uuid`  BINARY(16) NOT NULL,
  `quantity`        INT(11) NOT NULL DEFAULT 0,
  `unit_price`      DECIMAL(19,8) UNSIGNED NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `donation_item_1` (`donation_uuid`, `inventory_uuid`),
  KEY `donation_uuid` (`donation_uuid`),
  KEY `inventory_uuid` (`inventory_uuid`),
  CONSTRAINT `donation_item__donation` FOREIGN KEY (`donation_uuid`) REFERENCES `donation` (`uuid`) ON DELETE CASCADE,
  CONSTRAINT `donation_item__inventory` FOREIGN KEY (`inventory_uuid`) REFERENCES `inventory` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;
