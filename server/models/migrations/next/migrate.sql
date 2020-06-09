/* migration script from the version 1.13.1 to the next one */

ALTER TABLE `unit` DROP COLUMN `url`;
