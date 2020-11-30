/**
 * Migration from the version 1.16.1 to v1.17.0
 */

/*
 * @author: jmcameron
 * @date: 2020-11-18
 * @pull-release: 5129
 * @description: Fix typo in menu report name "System Usage Statistics"
 */
UPDATE `unit` SET name='System Usage Statistics', description='System Usage Statistics' WHERE id=250;

INSERT INTO unit VALUES
  (292, '[Stock] Changes Report', 'REPORT.STOCK_CHANGES.TITLE', 'Stock Changes Report', 282, '/reports/stock_changes');

INSERT INTO `report` (`report_key`, `title_key`) VALUES
  ('stock_changes', 'REPORT.STOCK_CHANGES.TITLE');

/*
 * @author: jmcameron
 * @date: 2020-11-23
 * @pull-release: TBD
 * @description: Rename reports to use underscores
 */
UPDATE `report` set report_key='unpaid_invoice_payments' WHERE report_key='unpaid-invoice-payments';
UPDATE `report` set report_key='annual_clients_report' WHERE report_key='annual-clients-report';

UPDATE `report` set report_key='employee_standing' WHERE report_key='employeeStanding';
UPDATE `report` set report_key='debtor_summary' WHERE report_key='debtorSummary';
UPDATE `report` set report_key='client_debts' WHERE report_key='clientDebts';
UPDATE `report` set report_key='client_support' WHERE report_key='clientSupport';
UPDATE `report` set report_key='receovery_capacity' WHERE report_key='recoveryCapacity';
UPDATE `report` set report_key='invoiced_received_stock' WHERE report_key='invoicedReceivedStock';
UPDATE `report` set report_key='system_usage_stat' WHERE report_key='systemUsageStat';
UPDATE `report` set report_key='indicators_report' WHERE report_key='indicatorsReport';
UPDATE `report` set report_key='patient_standing' WHERE report_key='patientStanding';
UPDATE `report` set report_key='cashflow_by_service' WHERE report_key='cashflowByService';
UPDATE `report` set report_key='fee_center' WHERE report_key='feeCenter';
UPDATE `report` set report_key='break_even' WHERE report_key='breakEven';
UPDATE `report` set report_key='break_even_fee_center' WHERE report_key='breakEvenFeeCenter';
UPDATE `report` set report_key='monthly_balance' WHERE report_key='monthlyBalance';
UPDATE `report` set report_key='analysis_auxiliary_cashboxes'
   WHERE report_key='analysisAuxiliaryCash';
UPDATE `report` set report_key='data_kit' WHERE report_key='dataKit';
UPDATE `report` set report_key='purchase_order_analysis' WHERE report_key='purchaseOrderAnalysis';
UPDATE `report` set report_key='inventory_changes' WHERE report_key='inventoryChanges';
UPDATE `report` set report_key='monthly_consumption_report' WHERE report_key='monthlyConsumptionReport';

/*
 * @author: lomamech
 * @date: 2020-11-23
 * @subject : Stock Dashboard
 */
INSERT INTO unit VALUES
  (291, '[Stock] Dashboard', 'TREE.STOCK_DASHBOARD','Stock Dashboard', 160,'/stock/dashboard');
