/*
  ACCOUNT REFERENCE MODULE AND REPORT
  ===================================
  NOTA : Please create `account_reference` and `account_reference_item` tables first
*/

INSERT INTO unit VALUES 
(205, 'Account Reference Management','TREE.ACCOUNT_REFERENCE_MANAGEMENT','',1,'/modules/account_reference','/account_reference'),
(206, 'Account Reference Report','TREE.ACCOUNT_REFERENCE_REPORT','',144,'/modules/reports/account_reference','/reports/account_reference');

INSERT INTO `report` (`id`, `report_key`, `title_key`) VALUES
(20, 'account_reference', 'REPORT.ACCOUNT_REFERENCE.TITLE');