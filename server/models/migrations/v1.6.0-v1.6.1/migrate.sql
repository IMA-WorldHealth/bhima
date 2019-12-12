/*
 * DATABASE CHANGES FOR VERSION 1.6.0 TO 1.7.0
 */

ALTER TABLE inventory_log ADD COLUMN user_id SMALLINT(5) UNSIGNED NOT NULL;
ALTER TABLE inventory_log ADD CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES user(id);


ALTER TABLE `stock_movement` ADD COLUMN `invoice_uuid` BINARY(16) NULL;
