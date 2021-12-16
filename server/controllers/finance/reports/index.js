/**
 * @overview finance/reports
 *
 * @description
 * This module simply exposes the build() methods of the receipts and reports
 * in the finance module.
 */
exports.debtors = require('./debtors');
exports.accounts = require('./accounts');
exports.invoices = require('./invoices');
exports.vouchers = require('./vouchers');
exports.cash = require('./cash');
exports.cashflow = require('./cashflow');
exports.patient = require('./financial.patient').report;
exports.income_expense = require('./income_expense');
exports.incomeExpenseByMonth = require('./income_expense_by_month');
exports.incomeExpenseByYear = require('./income_expense_by_year');
exports.journal = require('./journal');
exports.balance = require('./balance');
exports.reportAccounts = require('./reportAccounts');
exports.reportAccountsMultiple = require('./reportAccountsMultiple');
exports.generalLedger = require('./general_ledger');
exports.creditors = require('./creditors');
exports.accountStatement = require('./account_statement');
exports.cashReport = require('./cashReport');
exports.purchases = require('./purchases');
exports.employee = require('./financial.employee').report;
exports.employees = require('./financial.employees').report;
exports.priceList = require('./priceList').report;
exports.ohadaBalanceSheet = require('./ohada_balance_sheet');
exports.ohadaProfitLoss = require('./ohada_profit_loss');
exports.accountReference = require('./account_reference');
exports.costCenter = require('./cost_center');
exports.costCenterStepdown = require('./cost_center_step_down');
exports.annualClientsReport = require('./debtors/annual_clients_report').annualClientsReport;
exports.annualClientsReporting = require('./debtors/annual_clients_report').printing;
exports.breakEven = require('./break_even');
exports.breakEvenCostCenter = require('./break_even_cost_center');

exports.operating = require('./operating');
exports.monthlyBalance = require('./monthly_balance');
exports.unpaidInvoices = require('./unpaid_invoice_payments');
exports.stockValue = require('../../stock/reports/stock/value');

exports.analysisAuxiliaryCashboxes = require('./analysis_auxiliary_cashboxes');
exports.configurableAnalysisReport = require('./configurable_analysis_report');
exports.invoicedReceivedStock = require('./invoiced_received_stock');
exports.recoveryCapacity = require('./recovery_capacity');
