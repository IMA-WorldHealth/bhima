function configuration(data) {
  const configured = {};
  const includeManual = data.includeManual;

  data.references.forEach(reference => {
    data.accountReferences.forEach(accountRef => {
      if (reference.abbr === accountRef.abbr) {
        reference.debit = accountRef.debit;
        reference.credit = accountRef.credit;
        reference.balance = accountRef.balance;
      }
    });
  });

  configured.principal = data.feeCenter.filter(item => {
    return item.is_principal;
  });

  configured.auxiliary = data.feeCenter.filter(item => {
    return !item.is_principal;
  });

  configured.dataCostDistributions = data.dataDistributions.filter(item => {
    return item.is_cost;
  });

  configured.dataProfitDistributions = data.dataDistributions.filter(item => {
    return !item.is_cost;
  });

  configured.principalFeeCenters = data.references.filter(item => {
    return item.is_principal;
  });

  configured.principalCostCenters = data.references.filter(item => {
    return item.is_principal && item.is_cost;
  });

  configured.principalProfitCenters = data.references.filter(item => {
    return item.is_principal && !item.is_cost;
  });

  configured.auxiliaryFeeCenters = data.references.filter(item => {
    return !item.is_principal;
  });

  configured.auxiliaryCostCenters = data.references.filter(item => {
    return !item.is_principal && item.is_cost;
  });

  configured.colspanAuxCost = configured.auxiliaryCostCenters.length + 3;

  configured.auxiliaryProfitCenters = data.references.filter(item => {
    return !item.is_principal && !item.is_cost;
  });

  configured.colspanAuxProfit = configured.auxiliaryProfitCenters.length + 3;

  let totalPrincipalCost = 0;
  let totalPrincipalProfit = 0;

  // Getting balance of account references associated with auxiliary cost centers
  let totalAuxCost = 0;
  configured.auxiliaryCostCenters.forEach(aux => {
    let total = 0;
    let ratio = 0;

    //Retrieving Evaluated Auxiliary Cost Center Distributions to Main Cost Centers to Find the Distribution Rate
    configured.dataCostDistributions.forEach(cost => {
      if ((cost.auxiliary_fee_center_id === aux.id)) {
        total += (cost.debit - cost.credit);
      }
    });
    aux.total = total;
    totalAuxCost += aux.balance;

    if (aux.total && aux.balance) {
      ratio = (aux.total / aux.balance);
    }
    aux.ratio = ratio;
    //automatic total is the value that should be distributed to the main center taking into account 
    //the distribution keys, from this value is deducted the sum of the distributions carried out manually.
    aux.automaticTotal = includeManual ? aux.balance - aux.total : aux.balance;
  });

  // Getting balance of account references associated with auxiliary profit centers
  let totalAuxProfit = 0;
  configured.auxiliaryProfitCenters.forEach(aux => {
    let total = 0;
    let ratio = 0;

    //Retrieving Evaluated Auxiliary Profit Center Distributions to Main Profit Centers to Find the Distribution Rate
    configured.dataProfitDistributions.forEach(profit => {
      if ((profit.auxiliary_fee_center_id === aux.id)) {
        total += (profit.debit - profit.credit);
      }
    });
    aux.total = total;
    totalAuxProfit += aux.balance;

    if (aux.total && aux.balance) {
      ratio = (aux.total / aux.balance);
    }
    aux.ratio = ratio;
    //automatic total is the value that should be distributed to the main center taking into account 
    //the distribution keys, from this value is deducted the sum of the distributions carried out manually.    
    aux.automaticTotal = includeManual ? aux.balance - aux.total : aux.balance;
  });

  let totalGeneralCost = 0;
  let totalGeneralProfit = 0;

  configured.principal.forEach(pr => {
    pr.costValues = [];
    pr.profitValues = [];
    let totalCost = 0;
    let totalProfit = 0;
    configured.principalCostCenters.forEach(dPrincCost => {
      if (pr.id === dPrincCost.id) {
        totalCost += dPrincCost.balance;
        totalPrincipalCost += dPrincCost.balance;
        pr.balanceCost = dPrincCost.balance;
      }
    });

    configured.principalProfitCenters.forEach(dPrincProfit => {
      if (pr.id === dPrincProfit.id) {
        totalProfit += dPrincProfit.balance;
        totalPrincipalProfit += dPrincProfit.balance;
        pr.balanceProfit = dPrincProfit.balance;
      }
    });

    configured.auxiliaryProfitCenters.forEach(aux => {
      let balance = 0;
      let automaticValue = 0;
      let distributionKey = [];

      if (aux.automaticTotal) {
        distributionKey = data.distributionKey.filter(item => {
          return ((item.auxiliary_fee_center_id === aux.id) && ((item.principal_fee_center_id === pr.id)));
        });

        if (distributionKey.length && distributionKey[0].rate) {
          automaticValue = (aux.automaticTotal * distributionKey[0].rate) / 100;
        }
      }

      configured.dataProfitDistributions.forEach(profit => {
        if ((profit.principal_fee_center_id === pr.id) && (profit.auxiliary_fee_center_id === aux.id)) {
          balance = profit.debit - profit.credit;
        }
      });

      let valuePrinCAux = includeManual ? (automaticValue + balance) : automaticValue;
      totalProfit += valuePrinCAux;
      pr.profitValues.push({ value : valuePrinCAux });
    });

    pr.totalProfit = totalProfit;
    pr.totalCost = totalCost;

    totalGeneralCost += totalCost;
    totalGeneralProfit += totalProfit;
    pr.results = totalProfit + totalCost;
    pr.resultCredit = (pr.results < 0);

    // console.log('PR1NC1P4L______1000____-');
    // console.log(pr);




  });

      configured.totalPrincipalCost = totalPrincipalCost; 
      configured.totalPrincipalProfit = totalPrincipalProfit;
      configured.allCost = totalAuxCost + totalPrincipalCost;
      configured.allProfit = totalAuxProfit + totalPrincipalProfit;
      configured.totalGeneralCost = totalGeneralCost;
      configured.totalGeneralProfit = totalGeneralProfit;
      configured.ratioCost = totalGeneralCost / configured.allCost;
      configured.ratioProfit = totalGeneralProfit / configured.allProfit;
      configured.results = totalGeneralProfit + totalGeneralCost;
      configured.resultCredit = (configured.results < 0);
      configured.resultDebit = (configured.results > 0);

  return configured;
}
exports.configuration = configuration;
