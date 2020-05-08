
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
exports.income_expense_by_month = require('./income_expense_by_month');
exports.income_expense_by_year = require('./income_expense_by_year');
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
exports.priceList = require('./priceList').report;
exports.ohadaBalanceSheet = require('./ohada_balance_sheet');
exports.ohadaProfitLoss = require('./ohada_profit_loss');
exports.accountReference = require('./account_reference');
exports.feeCenter = require('./fee_center');
exports.annualClientsReport = require('./debtors/annual-clients-report').annualClientsReport;
exports.annualClientsReporting = require('./debtors/annual-clients-report').printing;
exports.breakEven = require('./break_even');
exports.breakEvenFeeCenter = require('./break_even_fee_center');

exports.operating = require('./operating');
exports.monthlyBalance = require('./monthlyBalance');
exports.unpaidInvoices = require('../reports/unpaid-invoice-payments');
exports.stockValue = require('../../stock/reports/stock/value');

exports.analysisAuxiliaryCashbox = require('./analysis_auxiliary_cashbox');
exports.configurableAnalysisReport = require('./configurable_analysis_report');
exports.invoicedReceivedStock = require('./invoicedReceivedStock');
