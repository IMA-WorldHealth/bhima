-- adding  accounts,  for suppliers

INSERT INTO account (type_id, enterprise_id, number, parent, label)
VALUES (2, 1, 40111002 ,0, "SUPPLIER'S ACCOUNT 1"),
        (2, 1, 40111003 ,0, "SUPPLIER'S ACCOUNT 2");


-- creditor group
INSERT INTO creditor_group (enterprise_id, uuid,name, account_id, locked)
VALUES (1,'cgsp1', 'Creditor groud supplier1', 286,0),
        (1, 'cgsp2', 'Creditor groud supplier2', 287,0);

-- creating creditors
INSERT INTO creditor (uuid, group_uuid,text)
VALUES ('credtSp1', HUID(BUID('cgsp1')), 'Creditor supplier 1'),
        ('credtSp2', HUID(BUID('cgsp2')), 'Creditor supplier 2');

-- creating supliers

INSERT INTO supplier (uuid, reference, creditor_uuid, display_name, international,locked)
VALUES ('supplier1', 0,  HUID( BUID('credtSp1')), 'supplier 1', 1,0),
        ('supplier2', 0,  HUID(BUID('credtSp2')), 'supplier 2', 1,0);

-- creation purchase orders
INSERT INTO purchase (uuid, project_id, reference, cost, currency_id, supplier_uuid,date,created_at, user_id)
VALUES ('purchase1', 1, 0, 30.0, 2, HUID(BUID('supplier1')), '2017-08-07', '2017-08-07' ,1),
        ('purchase2', 1, 0, 20.0, 2, HUID(BUID('supplier2')), '2017-08-08', '2017-08-08' ,1);

INSERT INTO purchase_item(uuid, purchase_uuid,inventory_uuid, quantity, unit_price, total)
VALUES('purItemSup1', HUID(BUID('purchase1')), 0x00EFB27B0D504561BF1394337C069C2A, 2, 15, 30 ),
        ('purItemSup2', HUID(BUID('purchase2')), 0x00F2E9564A754DC882DD1E8ECA56FCE7, 2, 10, 20 );
--

-- admin user width all permissions

INSERT INTO `permission` (`unit_id`, `user_id`) VALUES
(13, 1),
( 19, 1),
(20, 1),
(21, 1),
( 26, 1),
( 29, 1),
( 48, 1),
(57, 1),
( 61, 1),
( 62, 1),
( 82, 1),
(105, 1),
(107, 1),
( 138, 1),
(139, 1),
(140, 1),
(141, 1),
(142, 1),
(143, 1),
(146, 1),
(150, 1),
(151, 1),
( 152, 1),
(153, 1),
(154, 1),
(155, 1),
(156, 1),
(157, 1),
(158, 1),
(160, 1),
(161, 1),
( 162, 1),
( 163, 1),
( 164, 1),
( 165, 1),
( 166, 1),
( 167, 1),
( 171, 1),
(181, 1),
(182, 1);


-- depots

INSERT INTO depot (uuid, text, enterprise_id, is_warehouse)
VALUES ('depot1', 'Depot central', 1,1),
        ('depot2', 'Pharmacie', 1,0);

