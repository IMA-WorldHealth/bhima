DELIMITER $$

/*
  ---------------------------------------------------
  Add an inventory tag
  ---------------------------------------------------

  Add a tag to this inventory (create it if necessary)
*/
DROP PROCEDURE IF EXISTS AddInventoryTag$$
CREATE PROCEDURE AddInventoryTag (
  IN inventoryUuid BINARY(16),
  IN tagName VARCHAR(100),
  IN tagColor VARCHAR(50)
)
BEGIN
  DECLARE tagExists TINYINT(1);
  DECLARE tagUuid BINARY(16);

  SET tagExists = (SELECT IF((SELECT COUNT(t.name) FROM tags AS t WHERE t.name = tagName) > 0, 1, 0));

  /* If the tag does not exist yet, create it */
  IF (tagExists = 0) THEN
    SET tagUuid = HUID(UUID());
    INSERT INTO `tags` (`uuid`, `name`, `color`) VALUES (tagUuid, tagName, tagColor);
  ELSE
    SET tagUuid = (SELECT `uuid` FROM `tags` WHERE `name` = tagName);
  END IF;

  /* Create a new tag for this inventory */
  INSERT IGNORE INTO `inventory_tag` (`inventory_uuid`, `tag_uuid`) VALUES (inventoryUuid, tagUuid);
END$$


/*
  ---------------------------------------------------
  Import Inventory Procedure
  ---------------------------------------------------

  This procedure import a new inventory into the system
  by creating one and performing a stock integration
  if necessary.
*/
DROP PROCEDURE IF EXISTS ImportInventory$$
CREATE PROCEDURE ImportInventory (
  IN enterpriseId SMALLINT(5),
  IN inventoryGroupName VARCHAR(100),
  IN inventoryCode VARCHAR(30),
  IN inventoryText VARCHAR(100),
  IN inventoryType VARCHAR(30),
  IN inventoryUnit VARCHAR(30),
  IN inventoryUnitPrice DECIMAL(18, 4),
  IN inventoryConsumable TINYINT(1),
  IN inventoryIsAsset TINYINT(1),
  IN inventoryBrand TEXT,
  IN inventoryModel TEXT,
  IN tag VARCHAR(50)
)
BEGIN
  DECLARE inventoryUuid BINARY(16);
  DECLARE existInventoryGroup TINYINT(1);
  DECLARE existInventoryType TINYINT(1);
  DECLARE existInventoryUnit TINYINT(1);
  DECLARE existInventory TINYINT(1);

  DECLARE randomCode INT(11);
  DECLARE inventoryGroupUuid BINARY(16);
  DECLARE inventoryTypeId TINYINT(3);
  DECLARE inventoryUnitId SMALLINT(5);

  SET existInventoryGroup = (SELECT IF((SELECT COUNT(`name`) AS total FROM `inventory_group` WHERE `code` = inventoryGroupName OR `name` = inventoryGroupName) > 0, 1, 0));
  SET existInventory = (SELECT IF((SELECT COUNT(`text`) AS total FROM `inventory` WHERE `code` = inventoryCode OR `text` = inventoryText) > 0, 1, 0));
  SET existInventoryType = (SELECT IF((SELECT COUNT(*) AS total FROM `inventory_type` WHERE `text` = inventoryType) > 0, 1, 0));
  SET existInventoryUnit = (SELECT IF((SELECT COUNT(*) AS total FROM `inventory_unit` WHERE `text` = inventoryUnit OR `abbr` = inventoryUnit) > 0, 1, 0));

  /* Create group if doesn't exist */
  IF (existInventoryGroup = 0) THEN
    SET randomCode = (SELECT ROUND(RAND() * 10000000));
    SET inventoryGroupUuid = HUID(UUID());
    INSERT INTO `inventory_group` (`uuid`, `name`, `code`) VALUES (inventoryGroupUuid, inventoryGroupName, randomCode);
  ELSE
    SET inventoryGroupUuid = (SELECT `uuid` FROM `inventory_group` WHERE `code` = inventoryGroupName OR `name` = inventoryGroupName LIMIT 1);
  END IF;

  /* Create type if doesn't exist */
  IF (existInventoryType = 0) THEN
    SET inventoryTypeId = (SELECT MAX(`id`) + 1 FROM `inventory_type`);
    INSERT INTO `inventory_type` (`id`, `text`) VALUES (inventoryTypeId, inventoryType);
  ELSE
    SET inventoryTypeId = (SELECT `id` FROM `inventory_type` WHERE LOWER(`text`) = LOWER(inventoryType) LIMIT 1);
  END IF;

  /* Create unit if doesn't exist */
  IF (existInventoryUnit = 0) THEN
    SET inventoryUnitId = (SELECT MAX(`id`) + 1 FROM `inventory_unit`);
    INSERT INTO `inventory_unit` (`id`, `abbr`, `text`) VALUES (inventoryUnitId, inventoryUnit, inventoryUnit);
  ELSE
    SET inventoryUnitId = (SELECT `id` FROM `inventory_unit` WHERE LOWER(`text`) = LOWER(inventoryUnit) OR LOWER(`abbr`) = LOWER(inventoryUnit) LIMIT 1);
  END IF;

  /*
    Create inventory if it doesn't exist

    If the inventory already exists, skip because we are in a loop and
    we have to continue importing other inventories

    Inventory imported are considered by default as stockable (consumbale)
  */
  IF (existInventory = 0) THEN
    SET inventoryUuid = HUID(UUID());
    INSERT INTO `inventory` (`enterprise_id`, `uuid`, `code`, `text`, `price`, `group_uuid`, `type_id`, `unit_id`,
                             `consumable`, `is_asset`, `manufacturer_brand`, `manufacturer_model`)
    VALUES
    (enterpriseId, inventoryUuid, inventoryCode, inventoryText, inventoryUnitPrice, inventoryGroupUuid, inventoryTypeId,
     inventoryUnitId, inventoryConsumable, inventoryIsAsset, inventoryBrand, inventoryModel);

    IF (tag != '') THEN
      CALL AddInventoryTag(inventoryUuid, tag, "#8000FF");
    END IF;
  END IF;
END $$

DELIMITER ;
