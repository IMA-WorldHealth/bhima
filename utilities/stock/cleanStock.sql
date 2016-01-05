delete from consumption_service where consumption_uuid in (select uuid from consumption JOIN stock on consumption.tracking_number = stock.tracking_number where stock.purchase_order_uuid is null);

delete from consumption_patient where consumption_uuid in (select uuid from consumption JOIN stock on consumption.tracking_number = stock.tracking_number where stock.purchase_order_uuid is null);

delete from consumption where tracking_number in (select tracking_number from stock where purchase_order_uuid is null);

delete from movement where tracking_number in (select tracking_number from stock where stock.purchase_order_uuid is null);

delete from stock where purchase_order_uuid is null;



DELETE FROM movement WHERE tracking_number IN (SELECT stock.tracking_number FROM stock LEFT JOIN purchase_item on stock.purchase_order_uuid = purchase_item.purchase_uuid AND purchase_item.inventory_uuid = stock.inventory_uuid WHERE purchase_item.uuid IS NULL);

DELETE FROM consumption_service WHERE consumption_uuid in (SELECT consumption.uuid FROM consumption JOIN (SELECT tracking_number FROM stock LEFT JOIN purchase_item ON stock.purchase_order_uuid = purchase_item.purchase_uuid AND purchase_item.inventory_uuid = stock.inventory_uuid WHERE purchase_item.uuid is null) AS t ON t.tracking_number = consumption.tracking_number);

DELETE FROM consumption_patient WHERE consumption_uuid in (SELECT consumption.uuid FROM consumption JOIN (SELECT tracking_number FROM stock LEFT JOIN purchase_item ON stock.purchase_order_uuid = purchase_item.purchase_uuid AND purchase_item.inventory_uuid = stock.inventory_uuid WHERE purchase_item.uuid IS NULL) AS t ON t.tracking_number = consumption.tracking_number);

CREATE TEMPORARY TABLE track (
  tracking_number text NOT NULL
);

INSERT INTO track SELECT stock.tracking_number FROM stock LEFT JOIN purchase_item on stock.purchase_order_uuid = purchase_item.purchase_uuid AND purchase_item.inventory_uuid = stock.inventory_uuid WHERE purchase_item.uuid IS NULL;


DELETE FROM stock WHERE tracking_number IN (SELECT tracking_number FROM track);

DROP TABLE track;
