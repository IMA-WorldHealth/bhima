-- Update inventory references to unit_id

UPDATE `inventory` SET unit_id = 46 WHERE unit_id =  3;  --> PALLET
UPDATE `inventory` SET unit_id = 25 WHERE unit_id =  4;  --> BOX
UPDATE `inventory` SET unit_id = 24 WHERE unit_id =  8;  --> BOTTLE
UPDATE `inventory` SET unit_id = 29 WHERE unit_id =  9;  --> CAPSULE
UPDATE `inventory` SET unit_id = 34 WHERE unit_id = 10;  --> FLASK
UPDATE `inventory` SET unit_id = 24 WHERE unit_id = 12;  --> BOTTLE
UPDATE `inventory` SET unit_id = 45 WHERE unit_id = 13;  --> PIECE
UPDATE `inventory` SET unit_id = 47 WHERE unit_id = 14;  --> POUCH
UPDATE `inventory` SET unit_id = 54 WHERE unit_id = 15;  --> TABLET
UPDATE `inventory` SET unit_id = 56 WHERE unit_id = 16;  --> TUBE
UPDATE `inventory` SET unit_id = 58 WHERE unit_id = 17;  --> VIAL
UPDATE `inventory` SET unit_id = 52 WHERE unit_id = 18;  --> SUPPOSITORY
UPDATE `inventory` SET unit_id = 53 WHERE unit_id = 19;  --> SYRUP
UPDATE `inventory` SET unit_id = 33 WHERE unit_id = 21;  --> EGG

-- The order matters for these two
UPDATE `inventory` SET unit_id = 44 WHERE unit_id =  2;  --> PALLET
UPDATE `inventory` SET unit_id =  2 WHERE unit_id =  6;  --> AMPOULE  **

-- Create new site-local inventory_unit entries
INSERT INTO `inventory_unit` (`id`, `abbr`, `text`, `token`) VALUES (100, 'PT', 'Pot', NULL);
UPDATE `inventory` SET unit_id = 100 WHERE unit_id = 20;


----------------------------------------------------------------------
-- OLD Inventory Units
--   Based on download of 2022-08-11
--   ( * => inventory_unit IDs actually used)
--
-- > select * from inventory_unit;
-- +-----+------+--------------+
-- | id  | abbr | text         |                ** = Two step
-- +-----+------+--------------+
-- |  1 *| Act  | Act          | --> OK
-- |  2 *| Pal  | Pallet       | --> 44 PALLET
-- |  3  | Pill | Pillule      | --> 46 PILL
-- |  4 *| Box  | Box          | --> 25 BOX
-- |  5  | Lot  | Lot          | --> 40 LOT
-- |  6 *| amp  | ampoule      | --> 2 AMPOULE  **
-- |  7  | bags | bags         | --> 21 BAG     **
-- |  8 *| btl  | bouteille    | --> 24 BOTTLE
-- |  9 *| cap  | capsule      | --> 29 CAPSULE
-- | 10 *| flc  | flacon       | --> 34 FLASK
-- | 11  | jar  | jar          | --> SKIP (not used)
-- | 12 *| ltr  | littre       | --> 24 BOTTLE
-- | 13 *| pce  | piece        | --> 45 PIECE
-- | 14 *| sch  | sachet       | --> 47 POUCH
-- | 15 *| tab  | tablette     | --> 54 TABLET
-- | 16 *| tub  | tube         | --> 56 TUBE
-- | 17 *| vial | vial         | --> 58 VIAL
-- | 18 *| Sup  | suppositoire | --> 52 SUPPOSITORY
-- | 19 *| SRP  | Sirop        | --> 53 SYRUP
-- | 20 *| PT   | Pot          | --> NEW
-- | 21 *| OV   | Ovule        | --> 33 EGG
-- +-----+------+--------------+
