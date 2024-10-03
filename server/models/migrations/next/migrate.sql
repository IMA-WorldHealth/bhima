-- next release v1.34.0
/*
 * @author: lomamech
 * @date: 2024-08-24
 * @description: Categorize Debtor Group: Distinguishing Insolvent and Solvent Entities
 */
ALTER TABLE `debtor_group` ADD COLUMN `is_insolvent` TINYINT(1) NOT NULL DEFAULT 0 AFTER `color`;
ALTER TABLE `debtor_group` ADD COLUMN `is_non_client_debtor_groups` TINYINT(1) NOT NULL DEFAULT 0 AFTER `is_insolvent`;

/*
 * @author: lomamech
 * @date: 2024-09-02
 * @description: Budget Report #7683
 */
INSERT INTO unit values (320, 'Budget Report','TREE.BUDGET_REPORT','',281,'/reports/budget_report');
INSERT IGNORE INTO `report` (`report_key`, `title_key`) VALUES ('budget_report', 'REPORT.BUDGET_REPORT.TITLE');;

/*
 * @author: lomamech
 * @date: 2024-10-01
 * @description: Enhance Payroll Module with Index: Add Feature to Multiply Pay Indices by Frequency for Employee Categorization
 */
ALTER TABLE `rubric_payroll` ADD COLUMN `is_linked_to_grade` TINYINT(1) NULL DEFAULT '0' AFTER `is_linked_pension_fund`;

DROP TABLE IF EXISTS `rubric_grade_indice`;
CREATE TABLE `rubric_grade_indice` (
  `uuid` BINARY(16) NOT NULL,
  `value`  DECIMAL(19,4) NOT NULL,
  `grade_uuid` BINARY(16) NOT NULL,
  `rubric_id` INT(10) UNSIGNED NOT NULL,
  PRIMARY KEY (`uuid`),
  KEY `rubric_id` (`rubric_id`),
  KEY `grade_uuid` (`grade_uuid`),
  CONSTRAINT `rubric_grade_indice__grade` FOREIGN KEY (`grade_uuid`) REFERENCES `grade` (`uuid`),
  CONSTRAINT `rubric_grade_indice__rubric_payroll` FOREIGN KEY (`rubric_id`) REFERENCES `rubric_payroll` (`id`),
  UNIQUE KEY `rubric_grade_indice_1` (`grade_uuid`, `rubric_id`)
) ENGINE=InnoDB DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;
