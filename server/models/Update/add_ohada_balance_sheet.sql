/* Add report in the navigation tree */
INSERT INTO unit VALUES 
  (206, '[OHADA] Bilan','TREE.OHADA_BALANCE_SHEET','',144,'/modules/reports/ohada_balance_sheet_report','/reports/ohada_balance_sheet_report');

/* Record the report */
INSERT INTO `report` (`id`, `report_key`, `title_key`) VALUES
  (20, 'ohada_balance_sheet_report', 'REPORT.OHADA.BALANCE_SHEET');
  