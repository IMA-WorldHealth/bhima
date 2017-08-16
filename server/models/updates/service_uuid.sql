-- UPDATE SERVICES WHICH DOESN'T HAVE UUID
UPDATE `service` SET `uuid` = HUID(UUID()) WHERE `uuid` IS NULL;

-- DEPOT FOR SERVICE
INSERT INTO depot (uuid, text, enterprise_id, is_warehouse, service_uuid)
  SELECT HUID(UUID()), CONCAT('Service - ', s.name), 1, 0, s.uuid FROM service s 
  WHERE s.uuid NOT IN (SELECT d.service_uuid FROM depot d WHERE d.service_uuid IS NOT NULL);