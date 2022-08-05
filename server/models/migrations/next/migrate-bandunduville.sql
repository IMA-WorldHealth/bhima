-- update inventory references to unit_id

UPDATE `inventory` SET unit_id = 46 WHERE unit_id =  3;  --> PALLET
UPDATE `inventory` SET unit_id = 40 WHERE unit_id =  5;  --> LOT
UPDATE `inventory` SET unit_id = 29 WHERE unit_id =  9;  --> CAPSULE
UPDATE `inventory` SET unit_id = 34 WHERE unit_id = 10;  --> FLASK
UPDATE `inventory` SET unit_id = 45 WHERE unit_id = 13;  --> PIECE
UPDATE `inventory` SET unit_id = 47 WHERE unit_id = 14;  --> POUCH
UPDATE `inventory` SET unit_id = 54 WHERE unit_id = 15;  --> TABLET
UPDATE `inventory` SET unit_id = 56 WHERE unit_id = 16;  --> TUBE
UPDATE `inventory` SET unit_id = 53 WHERE unit_id = 19;  --> SYRUP
UPDATE `inventory` SET unit_id = 52 WHERE unit_id = 20;  --> SUPPOSITORY
UPDATE `inventory` SET unit_id = 36 WHERE unit_id = 22;  --> INFUSION


-- The order matters for these:
UPDATE `inventory` SET unit_id = 44 WHERE unit_id =  2;  --> PALLET
UPDATE `inventory` SET unit_id =  2 WHERE unit_id =  6;  --> AMPOULE **

UPDATE `inventory` SET unit_id = 39 WHERE unit_id = 25;  --> KIT     **
UPDATE `inventory` SET unit_id = 25 WHERE unit_id =  4;  --> BOX     **

UPDATE `inventory` SET unit_id = 33 WHERE unit_id = 21;  --> EGG
UPDATE `inventory` SET unit_id = 21 WHERE unit_id =  7;  --> BAG     **


-- Create new site-local inventory_unit entries
INSERT INTO `inventory_unit` (`id`, `abbr`, `text`, `token`) VALUES (100, 'susp', 'Suspension', NULL);
UPDATE `inventory` SET unit_id = 100 WHERE unit_id = 23;

INSERT INTO `inventory_unit` (`id`, `abbr`, `text`, `token`) VALUES (101, 'clr', 'Collyre', NULL);
UPDATE `inventory` SET unit_id = 101 WHERE unit_id = 24;
UPDATE `inventory` SET unit_id = 24 WHERE unit_id = 12;  --> BOTTLE  **

INSERT INTO `inventory_unit` (`id`, `abbr`, `text`, `token`) VALUES (102, 'SLT', 'Solution', NULL);
UPDATE `inventory` SET unit_id = 102 WHERE unit_id = 26;

INSERT INTO `inventory_unit` (`id`, `abbr`, `text`, `token`) VALUES (103, 'PrtqPfssnll', 'Pratique Professionnelle', NULL);
UPDATE `inventory` SET unit_id = 103 WHERE unit_id = 28;


----------------------------------------------------------------------
-- OLD Inventory Units
--   Based on download of 2022-07-10
--   ( * => inventory_unit IDs actually used)
--
-- > select * from inventory_unit;
-- +-----+-------------+--------------------------+
-- | id  | abbr        | text                     |                ** = Two steps
-- +-----+-------------+--------------------------+
-- |  1 *| Act         | Act                      | --> OK
-- |  2  | Pal         | Pallet                   | --> 44 PALLET
-- |  3  | Pill        | Pillule                  | --> 46 PILL
-- |  4 *| Box         | Box                      | --> 25 BOX     **
-- |  5 *| Lot         | Lot                      | --> 40 LOT
-- |  6 *| amp         | ampoule                  | --> 2 AMPOULE  **
-- |  7 *| bags        | bags                     | --> 21 BAG     **
-- |  8  | btl         | bouteille                | --> 24 BOTTLE  **
-- |  9 *| cap         | capsule                  | --> 29 CAPSULE
-- | 10 *| flc         | flacon                   | --> 34 FLASK
-- | 11  | jar         | jar                      | --> 38 JAR
-- | 12 *| ltr         | littre                   | --> 24 BOTTLE  **
-- | 13 *| pce         | piece                    | --> 45 PIECE
-- | 14 *| sch         | sachet                   | --> 47 POUCH
-- | 15 *| tab         | tablette                 | --> 54 TABLET
-- | 16 *| tub         | tube                     | --> 56 TUBE
-- | 17  | vial        | vial                     | --> SKIP (not used)
-- | 18  | unit        | unit                     | --> SKIP (not used)
-- | 19 *| srp         | Sirop                    | --> 53 SYRUP
-- | 20 *| supp        | Suppositoire             | --> 52 SUPPOSITORY
-- | 21 *| OV          | Ovule                    | --> 33 EGG
-- | 22 *| Inf         | Infusion                 | --> 36 INFUSION
-- | 23 *| susp        | Suspension               | --> NEW
-- | 24 *| clr         | Collyre                  | --> NEW
-- | 25 *| kt          | Kit                      | --> 39 KIT
-- | 26 *| SLT         | Solution                 | --> NEW
-- | 27  | BSSCR       | Boisson Sucre            | --> SKIP (not used)
-- | 28 *| PRTQPFSSNLL | PRATIQUE PROFESSIONNELLE | --> NEW
-- +-----+-------------+--------------------------+ -->
