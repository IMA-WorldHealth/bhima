
const numeral = require('numeral');

const USD_FMT = '$0,0.00';
const FC_FMT = '0.0,00 FC';

/** @todo use the currency filter fork written for the client to perform the same behaviour here */
function currency(value, currencyId) {

  // if currencyId is not defined, defaults to USD.
  // @TODO - super-hardcoded values for the moment.  Can we do better?
  const fmt = (currencyId === 1) ? FC_FMT : USD_FMT;
  return numeral(value).format(fmt);
}

exports.currency = currency;
