
-- 2021-01-04
-- author: @jniles
ALTER TABLE `user` MODIFY COLUMN `last_login` TIMESTAMP NULL;
ALTER TABLE `user` ADD COLUMN `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE `user` ADD COLUMN `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- reset all last_login information
UPDATE `user` SET `last_login` = NULL;
