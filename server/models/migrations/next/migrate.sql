/* migration script from the version 1.13.1 to the next one */

ALTER TABLE `unit` DROP COLUMN `url`;

-- update units to make sure they are in the right category
UPDATE `unit` SET parent = 57 WHERE id = 183;
UPDATE `unit` SET parent = 57 WHERE id = 184;
