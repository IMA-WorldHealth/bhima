'use strict';

const accountingjs = require('accounting-js');

const USD_FMT = {
  precision: 2
};

const FC_FMT = {
  symbol: 'FC',
  precision: 2,
  thousand: '.',
  decimal: ',',
  format: '%v %s' // value before symbol
};

/** @todo use the currency filter fork written for the client to perform the same behaviour here */
function currency(value, currencyId) {

  // if currencyId is not defined, defaults to USD.
  // @TODO - super-hardcoded values for the moment.  Can we do better?
  const fmt = (currencyId === 1) ? FC_FMT : USD_FMT;

  return accountingjs.formatMoney(value, fmt);
}

/**
 * @function indentAccount
 * @description indent accounts based on the accunt depth for the chart of accounts
 * @param {number} depth the account number
 * @return {number} number the processed indent
 */
function indentAccount(depth) {
  let number = Number(depth);
  return number ? number * 40 : 0;
}

exports.currency = currency;
exports.indentAccount = indentAccount;
