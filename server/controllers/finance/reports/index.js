
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
exports.journal = require('./journal');
exports.balance = require('./balance');
exports.reportAccounts = require('./reportAccounts');
exports.generalLedger = require('./generalLedger');
exports.clientsReport = require('./clientsReport');
exports.creditors = require('./creditors');
exports.accountStatement = require('./account_statement');
exports.balanceSheet = require('./balance_sheet');
exports.cashReport = require('./cashReport');
exports.purchases = require('./purchases');
exports.employee = require('./financial.employee').report;
exports.priceList = require('./priceList').report;
exports.ohadaBalanceSheet = require('./ohada_balance_sheet');
