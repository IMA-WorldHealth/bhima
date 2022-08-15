-- Update inventory references to unit_id

UPDATE `inventory` SET unit_id = 46 WHERE unit_id =  3;  --> PILL
UPDATE `inventory` SET unit_id = 25 WHERE unit_id =  4;  --> BOX
UPDATE `inventory` SET unit_id = 40 WHERE unit_id =  5;  --> LOT
UPDATE `inventory` SET unit_id = 21 WHERE unit_id =  7;  --> BAG     **
UPDATE `inventory` SET unit_id = 24 WHERE unit_id =  8;  --> BOTTLE  **
UPDATE `inventory` SET unit_id = 29 WHERE unit_id =  9;  --> CAPSULE
UPDATE `inventory` SET unit_id = 34 WHERE unit_id = 10;  --> FLASK
UPDATE `inventory` SET unit_id = 38 WHERE unit_id = 11;  --> JAR
UPDATE `inventory` SET unit_id = 24 WHERE unit_id = 12;  --> BOTTLE
UPDATE `inventory` SET unit_id = 45 WHERE unit_id = 13;  --> PIECE
UPDATE `inventory` SET unit_id = 47 WHERE unit_id = 14;  --> POUCH
UPDATE `inventory` SET unit_id = 54 WHERE unit_id = 15;  --> TABLET
UPDATE `inventory` SET unit_id = 56 WHERE unit_id = 16;  --> TUBE
UPDATE `inventory` SET unit_id = 58 WHERE unit_id = 17;  --> VIAL
UPDATE `inventory` SET unit_id = 24 WHERE unit_id = 20;  --> BOTTLE  **

-- The order matters on these two
UPDATE `inventory` SET unit_id = 44 WHERE unit_id =  2;  --> PALLET
UPDATE `inventory` SET unit_id =  2 WHERE unit_id =  6;  --> AMPOULE  **

-- Create new site-local inventory_unit entries
INSERT INTO `inventory_unit` (`id`, `abbr`, `text`, `token`) VALUES (100, 'MEKA', 'MEKA', NULL);
UPDATE `inventory` SET unit_id = 100 WHERE unit_id = 18;


----------------------------------------------------------------------
-- OLD Inventory Units
--   Based on download of 2022-08-11
--   ( * => inventory_unit IDs actually used)
--
-- > select * from inventory_unit;
-- +-----+-----------+------------------------------+
-- | id  | abbr      | text                         |
-- +-----+-----------+------------------------------+
-- |  1 *| Act       | Act                          | --> OK
-- |  2 *| Pallet    | Pallet                       | --> 44 PALLET
-- |  3 *| Pill      | Pill                         | --> 46 PILL
-- |  4 *| Box       | Box                          | --> 25 BOX
-- |  5 *| Lot       | Lot                          | --> 40 LOT
-- |  6 *| amp       | amp                          | --> 2 AMPOULE  **
-- |  7 *| bags      | bags                         | --> 21 BAG     **
-- |  8 *| btl       | btl                          | --> 24 BOTTLE  **
-- |  9 *| cap       | cap                          | --> 29 CAPSULE
-- | 10 *| flc       | flc                          | --> 34 FLASK
-- | 11 *| jar       | jar                          | --> 38 JAR
-- | 12 *| ltr       | ltr                          | --> 24 BOTTLE
-- | 13 *| pce       | pce                          | --> 45 PIECE
-- | 14 *| sch       | sch                          | --> 47 POUCH
-- | 15 *| tab       | tab                          | --> 54 TABLET
-- | 16 *| tub       | tub                          | --> 56 TUBE
-- | 17 *| vial      | vial                         | --> 58 VIAL
-- | 18 *| MEKA      | MEKA                         | --> NEW
-- | 19  | COLIS     | COLIS                        | --> 41 PACKAGE
-- | 20 *| BOUTEILLE | BOUTEILLE                    | --> 24 BOTTLE  **
-- | 21  | BL        | BLOUSSES OPERATOIRE STERILES | --> SKIP (not used)
-- | 22  | CH OP.    | CHAMPS OPERATOIRE AVEC TROU  | --> SKIP (not used)
-- | 23  | BP        | BANDE PLATREE 10CM*2.7 CM    | --> SKIP (not used)
-- | 24  | BP 2      | BANDE PLATREE                | --> SKIP (not used)
-- | 25  | BP2       | BANDE PLATREE 15CM*2.7 CM    | --> SKIP (not used)
-- +-----+-----------+------------------------------+ -->
