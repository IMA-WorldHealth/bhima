'use strict';

var fnc = require('./finance');

function generateLines (lines, currencyId) {
  var out = '';
  for(var id in lines){
    out += htmlTableLine(lines[id], currencyId);
  }
  return out;
}

function htmlTableLine(debtorRecord, currencyId){
  var out =
    `<tr>
        <td> ${debtorRecord.accountNumber} </td>
        <td> ${debtorRecord.name} </td>
        <td class='text-right'> ${fnc.currency(debtorRecord.balance, currencyId)} </td>
        <td class='text-right'> ${fnc.currency(debtorRecord.debit, currencyId)} </td>
        <td class='text-right'> ${fnc.currency(debtorRecord.credit, currencyId)} </td>
        <td class='text-right'> ${fnc.currency(debtorRecord.finalBalance, currencyId)} </td>
    </tr>`;

  return out;
}

exports.generateLines = generateLines;