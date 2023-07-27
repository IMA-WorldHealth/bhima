/* v1.28.x */
/**
 * @author: lomamech
 * @description: Payroll Hospital general model #7000
 * @date: 2023-07-23
 */
DROP TABLE IF EXISTS `title_employee`;
CREATE TABLE `title_employee` (
  `id` TINYINT(3) UNSIGNED NOT NULL AUTO_INCREMENT,
  `title_txt` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `title_1` (`title_txt`)
) ENGINE=InnoDB DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;

INSERT INTO unit VALUES
  (318, 'Job Titles Management','TREE.TITLE','',57, '/titles');

CALL add_column_if_missing('employee', 'title_employee_id', 'TINYINT(1) NOT NULL DEFAULT 0');
ALTER TABLE `employee` ADD CONSTRAINT `employee__title_employee` FOREIGN KEY (`title_employee_id`) REFERENCES `title_employee` (`id`);

CALL add_column_if_missing('enterprise_setting', 'percentage_fixed_bonus', 'TINYINT(3) UNSIGNED NOT NULL DEFAULT 100');