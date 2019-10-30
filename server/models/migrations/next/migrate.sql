/* v1.6.1 to v1.7.0 */

ALTER TABLE `stock_consumption` MODIFY `period_id` MEDIUMINT(8) UNSIGNED NOT NULL;

ALTER TABLE `stock_consumption` ADD CONSTRAINT `fk_inventory_uuid_sc` FOREIGN KEY (`inventory_uuid`) REFERENCES `inventory` (`uuid`);
ALTER TABLE `stock_consumption` ADD CONSTRAINT `fk_depot_uuid_sc` FOREIGN KEY (`depot_uuid`) REFERENCES `depot` (`uuid`);
ALTER TABLE `stock_consumption` ADD CONSTRAINT `fk_period_id_sc` FOREIGN KEY (`period_id`) REFERENCES `period` (`id`);
/*
 * DATABASE CHANGES FOR VERSION 1.6.0 TO 1.7.0 
 */

/*
* Pricelist importation
  by Jeremielodi
  2019-10-16
*/

DROP PROCEDURE IF EXISTS importPriceListItem;
CREATE PROCEDURE importPriceListItem (
  IN _price_list_uuid BINARY(16),
  IN _inventory_code VARCHAR(30),
  IN _value DOUBLE,
  IN _is_percentage tinyint(1)
)
BEGIN
  DECLARE _inventory_uuid BINARY(16);
  DECLARE isIventory tinyint(5);
   DECLARE inventoryLabel VARCHAR(100);
  
  SELECT uuid, text,  count(uuid) 
  INTO _inventory_uuid, inventoryLabel, isIventory
  FROM inventory
  WHERE code = _inventory_code;

  IF isIventory = 1 THEN
    DELETE FROM price_list_item 
      WHERE price_list_uuid = _price_list_uuid AND inventory_uuid = _inventory_uuid;
    INSERT INTO price_list_item(uuid, inventory_uuid, price_list_uuid, label, value, is_percentage)
    VALUES(HUID(uuid()), _inventory_uuid, _price_list_uuid, inventoryLabel, _value, _is_percentage);
  END IF;

END $$
