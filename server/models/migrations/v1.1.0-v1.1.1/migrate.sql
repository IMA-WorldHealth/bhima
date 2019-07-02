-- By @lomamech
-- 2019-05-09
-- Resolve error of key translator
UPDATE report SET title_key = 'REPORT.CASH_REPORT.TITLE' WHERE id = 12;

-- @jeremielodi 2019-05-06 hide service is needed
ALTER TABLE `service` ADD COLUMN `hidden` TINYINT(1) DEFAULT 0;

/*
 @author: mbayopanda
 @description: rewrite the stockValue procedure
*/
DELIMITER $$
DROP PROCEDURE IF EXISTS `stockValue`$$
CREATE PROCEDURE `stockValue`(
  IN depotUuid BINARY(16), 
  IN dateTo DATE,
  IN currencyId INT
  )
BEGIN
  DECLARE done BOOLEAN;
  DECLARE mvtIsExit tinyint(1);
  DECLARE mvtQtt, stockQtt, newQuantity INT(11);
  DECLARE mvtUnitCost, mvtValue, newValue, newCost, exchangeRate, stockUnitCost, stockValue DECIMAL(19, 4);

  DECLARE _documentReference VARCHAR(100);
  DECLARE _date DATETIME;
  DECLARE _inventoryUuid BINARY(16);
  DECLARE _iteration, _newStock, _enterpriseId INT;


  DECLARE curs1 CURSOR FOR
    SELECT i.uuid, m.is_exit, l.unit_cost, m.quantity, m.date, dm.text AS documentReference
    FROM stock_movement m
    JOIN lot l ON l.uuid = m.lot_uuid
    JOIN inventory i ON i.uuid = l.inventory_uuid
    JOIN inventory_unit iu ON iu.id = i.unit_id
    JOIN depot d ON d.uuid = m.depot_uuid
    LEFT JOIN document_map dm ON dm.uuid = m.document_uuid
    WHERE m.depot_uuid = depotUuid AND DATE(m.date) <= dateTo
    ORDER BY i.text, m.created_at ASC;

  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

  DROP TEMPORARY TABLE IF EXISTS stage_movement;
  CREATE TEMPORARY TABLE stage_movement(
    inventory_uuid BINARY(16),
    isExit TINYINT(1),
    qtt INT(11),
    unit_cost DECIMAL(19, 4),
    VALUE DECIMAL(19, 4),
    DATE DATETIME,
    reference VARCHAR(100),
    stockQtt INT(11),
    stockUnitCost DECIMAL(19, 4),
    stockValue DECIMAL(19, 4),
    iteration INT
  );
 
  SET _enterpriseId = (SELECT enterprise_id FROM depot WHERE uuid= depotUuid);
  SET exchangeRate = IFNULL(GetExchangeRate(_enterpriseId,currencyId ,dateTo), 1);

  OPEN curs1;
    read_loop: LOOP

    FETCH curs1 INTO _inventoryUuid, mvtIsExit, mvtUnitCost, mvtQtt, _date, _documentReference;
      IF done THEN
        LEAVE read_loop;
      END IF;

      SELECT COUNT(inventory_uuid) INTO _newStock FROM stage_movement WHERE inventory_uuid = _inventoryUuid;
     
      -- initialize stock qtt, value and unit cost for a new inventory
      IF _newStock = 0 THEN
        SET _iteration = 0;
       
        SET stockQtt= 0;
        SET stockUnitCost = 0;
        SET stockValue = 0;
       
        SET mvtValue = 0;
	    SET newQuantity = 0;
	    SET newValue = 0;
	    SET newCost = 0;
      END IF;
		
	  SET mvtUnitCost = mvtUnitCost * (exchangeRate);
      -- stock exit movement, the stock quantity decreases
      IF mvtIsExit = 1 THEN
        SET stockQtt = stockQtt - mvtQtt;
        SET stockValue = stockQtt * stockUnitCost;
      ELSE
       -- stock entry movement, the stock quantity increases
	    SET newQuantity = mvtQtt + stockQtt;
        SET newValue = (mvtUnitCost * mvtQtt) + stockValue;
        SET newCost = newValue / IF(newQuantity = 0, 1, newQuantity);

        SET stockQtt = newQuantity;
        SET stockUnitCost = newCost;
        SET stockValue = newValue;
      END IF;

      INSERT INTO stage_movement VALUES (
        _inventoryUuid, mvtIsExit, mvtQtt, stockQtt, mvtQtt * mvtUnitCost, _date, _documentReference,  stockQtt, stockUnitCost, stockValue, _iteration
      );
      SET _iteration = _iteration + 1;
    END LOOP;
  CLOSE curs1;

  DROP TEMPORARY TABLE IF EXISTS stage_movement_copy;
  CREATE TEMPORARY TABLE stage_movement_copy AS SELECT * FROM stage_movement;

-- inventory stock
  SELECT  BUID(sm.inventory_uuid) AS inventory_uuid, i.text as inventory_name,  sm.stockQtt, sm.stockUnitCost, sm.stockValue
  FROM stage_movement sm
  JOIN inventory i ON i.uuid = sm.inventory_uuid
  INNER JOIN (
    SELECT inventory_uuid, MAX(iteration) as max_iteration
    FROM stage_movement_copy
    GROUP BY inventory_uuid
  )x ON x.inventory_uuid = sm.inventory_uuid AND x.max_iteration = sm.iteration 
  ORDER BY i.text ASC;

-- total in stock
  SELECT SUM(sm.stockValue) as total
  FROM stage_movement as sm
  INNER JOIN (
    SELECT inventory_uuid, MAX(iteration) as max_iteration
    FROM stage_movement_copy
    GROUP BY inventory_uuid
  )x ON x.inventory_uuid = sm.inventory_uuid AND x.max_iteration = sm.iteration;


END $$
DELIMITER ;

/*
 @author: mbayopanda
 @description: patient visits report
*/
INSERT INTO unit VALUES 
  (239, 'Visits Report', 'TREE.VISITS_REPORT', 'Visits registry', 144, '/modules/reports/visit_report', '/reports/visit_report');

INSERT INTO `report` (`id`, `report_key`, `title_key`) VALUES 
  (32, 'visit_report', 'PATIENT_RECORDS.REPORT.VISITS');
