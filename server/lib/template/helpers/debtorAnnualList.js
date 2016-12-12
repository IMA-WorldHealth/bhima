'use strict';

var fnc = require('./finance');

function generateLines (lines, detailPrevious, currencyId) {
  var out = '';
  for(var id in lines){
    if(lines.hasOwnProperty(id)){
      out += htmlTableLine(lines[id], detailPrevious, currencyId);
    }
  }
  return out;
}

function htmlTableLine(debtorRecord, detailPrevious, currencyId){
  var out = '';
  if(detailPrevious){
    out =
      `<tr>
        <td> ${debtorRecord.accountNumber} </td>
        <td> ${debtorRecord.name} </td>
        <td class='text-right'> ${fnc.currency(debtorRecord.initDebit, currencyId)} </td>
        <td class='text-right'> ${fnc.currency(debtorRecord.initCredit, currencyId)} </td>
        <td class='text-right'> ${fnc.currency(debtorRecord.debit, currencyId)} </td>
        <td class='text-right'> ${fnc.currency(debtorRecord.credit, currencyId)} </td>
        <td class='text-right'> ${fnc.currency(debtorRecord.finalBalance, currencyId)} </td>
    </tr>`;
    
  }else{
    out =
      `<tr>
        <td> ${debtorRecord.accountNumber} </td>
        <td> ${debtorRecord.name} </td>
        <td class='text-right'> ${fnc.currency(debtorRecord.balance, currencyId)} </td>
        <td class='text-right'> ${fnc.currency(debtorRecord.debit, currencyId)} </td>
        <td class='text-right'> ${fnc.currency(debtorRecord.credit, currencyId)} </td>
        <td class='text-right'> ${fnc.currency(debtorRecord.finalBalance, currencyId)} </td>
    </tr>`;    
  }

  return out;
}

exports.generateLines = generateLines;