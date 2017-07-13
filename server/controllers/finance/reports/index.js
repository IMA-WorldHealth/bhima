
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
exports.incomeExpense = require('./incomeExpense');
exports.journal = require('./journal');
exports.balance = require('./balance');
exports.reportAccounts = require('./reportAccounts');
exports.generalLedger = require('./generalLedger');
exports.clientsReport = require('./clientsReport');
exports.creditors = require('./creditors');
exports.accountStatement = require('./account_statement');
exports.balanceSheet = require('./balance_sheet');
