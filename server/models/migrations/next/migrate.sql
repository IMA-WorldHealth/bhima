/*
 * DATABASE CHANGES FOR VERSION 1.4.0 TO 1.5.0 
 */

/*
 * @author: mbayopanda
 * @date: 2019-09-22
 * @description: realized profit report
 */
INSERT INTO unit VALUES
  (249, 'Realized Profit Report', 'TREE.REALIZED_PROFIT_REPORT', 'Realized Profit Report', 144, '/modules/reports/realizedProfit', '/reports/realizedProfit');

INSERT INTO report (id, report_key, title_key) VALUES
  (39, 'realizedProfit', 'REPORT.REALIZED_PROFIT.TITLE');
