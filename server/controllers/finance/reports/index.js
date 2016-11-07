'use strict';

/**
 * @overview finance/reports
 *
 * @description
 * This module simply exposes the build() methods of the receipts and reports
 * in the finance module.
 */

exports.debtors  = require('./debtors');
exports.accounts = require('./accounts');
exports.invoices = require('./invoices');
exports.vouchers = require('./vouchers');
exports.cash     = require('./cash');
exports.cashflow = require('./cashflow');
exports.financialPatient = require('./financial.patient');
exports.incomeExpense = require('./incomeExpense');
exports.journal  = require('./journal');
<<<<<<< 763b91219a283a29039a96c4d05db60cef33131e
exports.balance  = require('./balance');
=======
exports.reportAccounts  = require('./reportAccounts');
>>>>>>> Report of account
