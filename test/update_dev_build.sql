-- adding  accounts,  for suppliers

SET @account_idSup1 = 300;
SET @account_idSup2 = 301;
INSERT INTO account (id,type_id, enterprise_id, number, parent, label)
VALUES (@account_idSup1, 2, 1, 40111002 ,0, "SUPPLIER'S ACCOUNT 1"),
        (@account_idSup2, 2, 1, 40111003 ,0, "SUPPLIER'S ACCOUNT 2");



-- creditor group


SET @CreditorGroup1 = HUID(UUID());
SET @CreditorGroup2 = HUID(UUID());

INSERT INTO creditor_group (enterprise_id, uuid,name, account_id, locked)
VALUES (1,@CreditorGroup1, 'Creditor groud supplier1', @account_idSup1,0),
        (1, @CreditorGroup2, 'Creditor groud supplier2', @account_idSup2,0);

-- creating creditors
SET @Creditor1 =  HUID(UUID());
SET @Creditor2 =  HUID(UUID());
INSERT INTO creditor (uuid, group_uuid,text)
VALUES (@Creditor1, @CreditorGroup1, 'Creditor supplier 1'),
        (@Creditor2, @CreditorGroup2, 'Creditor supplier 2');

-- creating supliers
SET @Supplier1 =  HUID(UUID());
SET @Supplier2 =  HUID(UUID());
INSERT INTO supplier (uuid, reference, creditor_uuid, display_name, international,locked)
VALUES (@Supplier1, 0, @Creditor1, 'supplier 1', 1,0),
        (@Supplier2, 0, @Creditor2, 'supplier 2', 1,0);

-- creation purchase orders
SET @Purchase1 =  HUID(UUID());
SET @Purchase2 =  HUID(UUID());
INSERT INTO purchase (uuid, project_id, reference, cost, currency_id, supplier_uuid,date,created_at, user_id)
VALUES (@Purchase1, 1, 0, 30.0, 2, @Supplier1, '2017-08-07', '2017-08-07' ,1),
        (@Purchase2, 1, 0, 20.0, 2, @Supplier2, '2017-08-08', '2017-08-08' ,1);

INSERT INTO purchase_item(uuid, purchase_uuid,inventory_uuid, quantity, unit_price, total)
VALUES('purItemSup1',@Purchase1, 0x00EFB27B0D504561BF1394337C069C2A, 2, 15, 30 ),
        ('purItemSup2', @Purchase2, 0x00F2E9564A754DC882DD1E8ECA56FCE7, 2, 10, 20 );
--

-- admin user width all permissions

INSERT INTO permission (unit_id, user_id)
SELECT unit.id, 1 FROM unit
ON DUPLICATE KEY UPDATE unit_id = unit_id, user_id = user_id;


-- depots

INSERT INTO depot (uuid, text, enterprise_id, is_warehouse)
VALUES ('depot1', 'Depot central', 1,1),
        ('depot2', 'Pharmacie', 1,0);

