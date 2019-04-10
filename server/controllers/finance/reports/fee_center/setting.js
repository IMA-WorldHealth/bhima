function configuration(data) {
  const configured = {};
  // If the manual repartition is included, the automatic repair is done only after
  // the deduction of the manually distributed values
  const includeManual = parseInt(data.includeManual, 10);

  data.references.forEach(reference => {
    data.accountReferences.forEach(accountRef => {
      if (reference.abbr === accountRef.abbr) {
        reference.debit = reference.is_cost ? accountRef.debit : accountRef.debit * (-1);
        reference.credit = reference.is_cost ? accountRef.credit : accountRef.credit * (-1);
        reference.balance = reference.is_cost ? accountRef.balance : accountRef.balance * (-1);
      }
    });
  });

  data.feeCenter.forEach(center => {
    center.cost_debit = 0;
    center.cost_credit = 0;
    center.cost_balance = 0;

    center.profit_debit = 0;
    center.profit_credit = 0;
    center.profit_balance = 0;

    data.references.forEach(reference => {
      if (center.id === reference.fee_center_id) {
        if (reference.is_cost) {
          center.hasCostReference = 1;
          center.cost_debit += reference.debit;
          center.cost_credit += reference.credit;
          center.cost_balance += reference.balance;
        } else {
          center.hasProfitReference = 1;
          center.profit_debit += reference.debit;
          center.profit_credit += reference.credit;
          center.profit_balance += reference.balance;
        }
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

  configured.dataProfitDistributions.forEach(item => {
    item.debit *= (-1);
    item.credit *= (-1);
  });

  configured.principalFeeCenters = data.feeCenter.filter(item => {
    return item.is_principal && (item.hasProfitReference || item.hasCostReference);
  });

  configured.principalCostCenters = data.feeCenter.filter(item => {
    return item.is_principal && item.hasCostReference;
  });

  configured.principalProfitCenters = data.feeCenter.filter(item => {
    return item.is_principal && item.hasProfitReference;
  });

  configured.auxiliaryFeeCenters = data.feeCenter.filter(item => {
    return !item.is_principal && (item.hasProfitReference || item.hasCostReference);
  });

  configured.auxiliaryCostCenters = data.feeCenter.filter(item => {
    return !item.is_principal && item.hasCostReference;
  });

  configured.colspanAuxCost = configured.auxiliaryCostCenters.length + 3;

  configured.auxiliaryProfitCenters = data.feeCenter.filter(item => {
    return !item.is_principal && item.hasProfitReference;
  });

  configured.colspanAuxProfit = configured.auxiliaryProfitCenters.length + 3;

  let totalPrincipalCost = 0;
  let totalPrincipalProfit = 0;

  // Getting balance of account references associated with auxiliary cost centers
  let totalAuxCost = 0;
  configured.auxiliaryCostCenters.forEach(aux => {

    let total = 0;
    let totalDistributedByKey = 0;
    let ratio = 0;

    // Retrieving Evaluated Auxiliary Cost Center Distributions to Main Cost Centers to Find the Distribution Rate
    if (includeManual) {
      configured.dataCostDistributions.forEach(cost => {
        if ((cost.auxiliary_fee_center_id === aux.id)) {
          total += (cost.debit - cost.credit);
        }
      });
    }

    totalAuxCost += aux.cost_balance;

    // automatic total is the value that should be distributed to the main center taking into account
    // the distribution keys, from this value is deducted the sum of the distributions carried out manually.
    aux.automaticTotal = includeManual ? aux.cost_balance - total : aux.cost_balance;

    if (aux.automaticTotal) {
      data.distributionKey.forEach(item => {
        if (item.auxiliary_fee_center_id === aux.id) {
          totalDistributedByKey += (aux.automaticTotal * item.rate) / 100;
        }
      });
    }

    if ((total || totalDistributedByKey) && aux.cost_balance) {
      ratio = ((total + totalDistributedByKey) / aux.cost_balance);
    }

    aux.total = total + totalDistributedByKey;
    aux.ratio = ratio;
  });

  // Getting balance of account references associated with auxiliary profit centers
  let totalAuxProfit = 0;
  configured.auxiliaryProfitCenters.forEach(aux => {
    let total = 0;
    let totalDistributedByKey = 0;
    let ratio = 0;

    // Retrieving Evaluated Auxiliary Profit Center Distributions to Main Profit Centers to Find the Distribution Rate
    if (includeManual) {
      configured.dataProfitDistributions.forEach(profit => {
        if ((profit.auxiliary_fee_center_id === aux.id)) {
          total += (profit.debit - profit.credit);
        }
      });
    }

    totalAuxProfit += aux.profit_balance;

    if (aux.total && aux.profit_balance) {
      ratio = (aux.total / aux.profit_balance);
    }
    aux.ratio = ratio;
    // automatic total is the value that should be distributed to the main center taking into account
    // the distribution keys, from this value is deducted the sum of the distributions carried out manually.
    aux.automaticTotal = includeManual ? aux.profit_balance - total : aux.profit_balance;

    if (aux.automaticTotal) {
      data.distributionKey.forEach(item => {
        if (item.auxiliary_fee_center_id === aux.id) {
          totalDistributedByKey += (aux.automaticTotal * item.rate) / 100;
        }
      });
    }
    if ((total || totalDistributedByKey) && aux.profit_balance) {
      ratio = ((total + totalDistributedByKey) / aux.profit_balance);
    }
    aux.total = total + totalDistributedByKey;
    aux.ratio = ratio;
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
        totalCost += dPrincCost.cost_balance;
        totalPrincipalCost += dPrincCost.cost_balance;
        pr.balanceCost = dPrincCost.cost_balance;
      }
    });

    configured.principalProfitCenters.forEach(dPrincProfit => {
      if (pr.id === dPrincProfit.id) {
        totalProfit += dPrincProfit.profit_balance;
        totalPrincipalProfit += dPrincProfit.profit_balance;
        pr.balanceProfit = dPrincProfit.profit_balance;
      }
    });

    configured.auxiliaryCostCenters.forEach(aux => {
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

      if (includeManual) {
        configured.dataCostDistributions.forEach(cost => {
          if ((cost.principal_fee_center_id === pr.id) && (cost.auxiliary_fee_center_id === aux.id)) {
            balance = cost.debit - cost.credit;
          }
        });
      }
      const valuePrinCAux = includeManual ? (automaticValue + balance) : automaticValue;

      totalCost += valuePrinCAux;
      pr.costValues.push({ value : valuePrinCAux });
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

      if (includeManual) {
        configured.dataProfitDistributions.forEach(profit => {
          if ((profit.principal_fee_center_id === pr.id) && (profit.auxiliary_fee_center_id === aux.id)) {
            balance = profit.debit - profit.credit;
          }
        });
      }
      const valuePrinCAux = includeManual ? (automaticValue + balance) : automaticValue;

      totalProfit += valuePrinCAux;
      pr.profitValues.push({ value : valuePrinCAux });
    });

    pr.totalProfit = totalProfit;
    pr.totalCost = totalCost;

    totalGeneralCost += totalCost;
    totalGeneralProfit += totalProfit;
    pr.results = totalProfit - totalCost;
    pr.resultCredit = (pr.results > 0);
  });

  configured.totalPrincipalCost = totalPrincipalCost;
  configured.totalPrincipalProfit = totalPrincipalProfit;
  configured.allCost = totalAuxCost + totalPrincipalCost;
  configured.allProfit = totalAuxProfit + totalPrincipalProfit;
  configured.totalGeneralCost = totalGeneralCost;
  configured.totalGeneralProfit = totalGeneralProfit;
  configured.ratioCost = totalGeneralCost / configured.allCost;
  configured.unDistributedCost = configured.allCost - totalGeneralCost;
  configured.ratioProfit = totalGeneralProfit / configured.allProfit;
  configured.unDistributedProfit = configured.allProfit - totalGeneralProfit;
  configured.results = totalGeneralProfit - totalGeneralCost;
  configured.resultCredit = (configured.results > 0);
  configured.resultDebit = (configured.results < 0);

  return configured;
}
exports.configuration = configuration;
