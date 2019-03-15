function configuration(data) {
  const configured = {
    accountsTurnOver : '',
    accountsRevenues : '',
    accountsTurnOverBalance : 0,
    numberCase : data.encounters[0].numberCase,
  };

  let totalCharges = 0;
  let totalFixedCharges = 0;
  let totalVariableCharges = 0;
  let totalRevenues = 0;

  data.breakEvenReference.forEach(breakEventRef => {
    data.accountReferences.forEach(accountRef => {
      if (breakEventRef.abbr === accountRef.abbr) {
        breakEventRef.debit = breakEventRef.is_cost ? accountRef.debit : accountRef.debit * (-1);
        breakEventRef.credit = breakEventRef.is_cost ? accountRef.credit : accountRef.credit * (-1);
        breakEventRef.balance = breakEventRef.is_cost ? accountRef.balance : accountRef.balance * (-1);
      }
    });

    if (breakEventRef.is_cost) {
      totalCharges += breakEventRef.balance;

      if (breakEventRef.is_variable) {
        breakEventRef.variable_charge = 1;
        totalVariableCharges += breakEventRef.balance;
      } else {
        breakEventRef.fixed_charge = 1;
        totalFixedCharges += breakEventRef.balance;
      }
    } else {
      totalRevenues += breakEventRef.balance;
    }
  });

  configured.charges = data.breakEvenReference.filter(item => {
    return item.is_cost;
  });

  configured.revenues = data.breakEvenReference.filter(item => {
    return !item.is_cost;
  });


  configured.revenues.forEach(revenues => {
    configured.accountsRevenues += `${revenues.accounts_numbers}, `;
    if (revenues.is_turnover) {
      configured.accountsTurnOver += `${revenues.accounts_numbers}, `;
      configured.accountsTurnOverBalance += revenues.balance;
    }
  });

  configured.totalCharges = totalCharges;
  configured.totalFixedCharges = totalFixedCharges;
  configured.totalVariableCharges = totalVariableCharges;
  configured.totalRevenues = totalRevenues;
  configured.marginVariableLoads = configured.accountsTurnOverBalance - totalVariableCharges;
  configured.resultsTurnOver = configured.marginVariableLoads - totalFixedCharges;
  configured.ratioMarginVariableLoads = configured.accountsTurnOverBalance
    ? configured.marginVariableLoads / configured.accountsTurnOverBalance : 0;

  configured.breakEvenValue = configured.ratioMarginVariableLoads
    ? totalFixedCharges / configured.ratioMarginVariableLoads : 0;

  configured.breakEvenPoint = configured.accountsTurnOverBalance
    ? configured.breakEvenValue / (configured.accountsTurnOverBalance / 360) : 0;

  configured.breakEvenPoint = parseInt(configured.breakEvenPoint, 10);

  // Break Even By Cases
  configured.breakEvenPointCase = configured.accountsTurnOverBalance
    ? configured.breakEvenValue / (configured.accountsTurnOverBalance / configured.numberCase) : 0;

  configured.calculateBreakEven = (configured.marginVariableLoads > 0) ? 1 : 0;
  configured.cantCalculateBreakEven = (configured.marginVariableLoads <= 0) ? 1 : 0;

  configured.breakEvenPointCase = parseInt(configured.breakEvenPointCase, 10);

  configured.marginVariableLoadsRevenues = totalRevenues - totalVariableCharges;

  configured.calculateBreakEvenRevenues = (configured.marginVariableLoadsRevenues > 0) ? 1 : 0;
  configured.cantCalculateBreakEvenRevenues = (configured.marginVariableLoadsRevenues <= 0) ? 1 : 0;

  configured.resultsTurnOverRevenues = configured.marginVariableLoadsRevenues - totalFixedCharges;
  configured.ratioMarginVariableLoadsRevenues = totalRevenues
    ? configured.marginVariableLoadsRevenues / totalRevenues : 0;

  configured.breakEvenValueRevenues = configured.ratioMarginVariableLoadsRevenues
    ? totalFixedCharges / configured.ratioMarginVariableLoadsRevenues : 0;

  configured.breakEvenPointRevenues = configured.totalRevenues
    ? configured.breakEvenValueRevenues / (configured.totalRevenues / 360) : 0;
  configured.breakEvenPointRevenues = parseInt(configured.breakEvenPointRevenues, 10);

  // Break Even By Cases
  configured.breakEvenPointRevenuesCase = configured.totalRevenues
    ? configured.breakEvenValueRevenues / (configured.totalRevenues / configured.numberCase) : 0;
  configured.breakEvenPointRevenuesCase = parseInt(configured.breakEvenPointRevenuesCase, 10);

  return configured;
}

exports.configuration = configuration;
