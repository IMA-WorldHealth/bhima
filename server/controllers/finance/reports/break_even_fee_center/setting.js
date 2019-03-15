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

  // Getting balance of account references associated with auxiliary cost centers

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

    // automatic total is the value that should be distributed to the main center taking into account
    // the distribution keys, from this value is deducted the sum of the distributions carried out manually.
    aux.automaticTotal = includeManual ? aux.balance - total : aux.balance;

    if (aux.automaticTotal) {
      data.distributionKey.forEach(item => {
        if (item.auxiliary_fee_center_id === aux.id) {
          totalDistributedByKey += (aux.automaticTotal * item.rate) / 100;
        }
      });
    }

    if ((total || totalDistributedByKey) && aux.balance) {
      ratio = ((total + totalDistributedByKey) / aux.balance);
    }

    aux.total = total + totalDistributedByKey;
    aux.ratio = ratio;
  });

  // Getting balance of account references associated with auxiliary profit centers
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

    if (aux.total && aux.balance) {
      ratio = (aux.total / aux.balance);
    }
    aux.ratio = ratio;
    // automatic total is the value that should be distributed to the main center taking into account
    // the distribution keys, from this value is deducted the sum of the distributions carried out manually.
    aux.automaticTotal = includeManual ? aux.balance - total : aux.balance;

    if (aux.automaticTotal) {
      data.distributionKey.forEach(item => {
        if (item.auxiliary_fee_center_id === aux.id) {
          totalDistributedByKey += (aux.automaticTotal * item.rate) / 100;
        }
      });
    }
    if ((total || totalDistributedByKey) && aux.balance) {
      ratio = ((total + totalDistributedByKey) / aux.balance);
    }

    aux.total = total + totalDistributedByKey;
    aux.ratio = ratio;
  });
  configured.principal.forEach(pr => {
    // Set a number of case By Fee Center
    pr.numberOfCases = 0;
    data.encounters.forEach(encounter => {
      if (pr.id === encounter.fee_center_id) {
        pr.numberOfCases = encounter.numberOfCases;
      }
    });

    pr.balanceVariableCost = 0;
    pr.balanceFixedCost = 0;
    pr.balanceTurnover = 0;
    pr.balanceOtherRevenue = 0;
    configured.principalFeeCenters.forEach(princ => {
      if (pr.id === princ.id) {
        if (princ.is_cost === 1 && princ.is_variable === 1) {
          pr.balanceVariableCost = princ.balance;
        } else if (princ.is_cost === 1 && princ.is_variable === 0) {
          pr.balanceFixedCost = princ.balance;
        } else if (princ.is_cost === 0 && princ.is_turnover === 1) {
          pr.balanceTurnover = princ.balance;
        } else {
          pr.balanceOtherRevenue = princ.balance;
        }
      }
    });
    configured.auxiliaryCostCenters.forEach(aux => {
      let automaticValue = 0;
      let distributionKey = [];

      if (aux.automaticTotal) {
        distributionKey = data.distributionKey.filter(item => {
          return ((item.auxiliary_fee_center_id === aux.id) && ((item.principal_fee_center_id === pr.id)));
        });

        if (distributionKey.length && distributionKey[0].rate) {
          automaticValue = (aux.automaticTotal * distributionKey[0].rate) / 100;

          if (automaticValue) {
            if (aux.is_cost === 1 && aux.is_variable === 1) {
              pr.balanceVariableCost += automaticValue;
            } else if (aux.is_cost === 1 && aux.is_variable === 0) {
              pr.balanceFixedCost += automaticValue;
            } else if (aux.is_cost === 0 && aux.is_turnover === 1) {
              pr.balanceTurnover += automaticValue;
            } else {
              pr.balanceOtherRevenue += automaticValue;
            }
          }
        }
      }

      if (includeManual) {
        configured.dataCostDistributions.forEach(cost => {
          if ((cost.principal_fee_center_id === pr.id) && (cost.auxiliary_fee_center_id === aux.id)) {
            if (cost.is_cost === 1 && cost.is_variable === 1) {
              pr.balanceVariableCost += (cost.debit - cost.credit);
            } else if (cost.is_cost === 1 && cost.is_variable === 0) {
              pr.balanceFixedCost += (cost.debit - cost.credit);
            }
          }
        });
      }
    });
    configured.auxiliaryProfitCenters.forEach(aux => {
      let automaticValue = 0;
      let distributionKey = [];

      if (aux.automaticTotal) {
        distributionKey = data.distributionKey.filter(item => {
          return ((item.auxiliary_fee_center_id === aux.id) && ((item.principal_fee_center_id === pr.id)));
        });

        if (distributionKey.length && distributionKey[0].rate) {
          automaticValue = (aux.automaticTotal * distributionKey[0].rate) / 100;

          if (automaticValue) {
            if (aux.is_cost === 1 && aux.is_variable === 1) {
              pr.balanceVariableCost += automaticValue;
            } else if (aux.is_cost === 1 && aux.is_variable === 0) {
              pr.balanceFixedCost += automaticValue;
            } else if (aux.is_cost === 0 && aux.is_turnover === 1) {
              pr.balanceTurnover += automaticValue;
            } else if (aux.is_cost === 0 && aux.is_turnover === 0) {
              pr.balanceOtherRevenue += automaticValue;
            }
          }
        }
      }

      if (includeManual) {
        configured.dataProfitDistributions.forEach(profit => {
          if ((profit.principal_fee_center_id === pr.id) && (profit.auxiliary_fee_center_id === aux.id)) {
            if (profit.is_cost === 0 && profit.is_turnover === 1) {
              pr.balanceTurnover += (profit.debit - profit.credit);
            } else if (profit.is_cost === 0 && profit.is_turnover === 0) {
              pr.balanceOtherRevenue += (profit.debit - profit.credit);
            }
          }
        });
      }
    });
    pr.totalCost = pr.balanceVariableCost + pr.balanceFixedCost;
    pr.totalProduct = pr.balanceTurnover + pr.balanceOtherRevenue;
    pr.marginVariableLoads = pr.balanceTurnover - pr.balanceVariableCost;
    pr.calculateBreakEven = (pr.marginVariableLoads > 0) ? 1 : 0;
    pr.cantCalculateBreakEven = (pr.marginVariableLoads <= 0) ? 1 : 0;

    pr.resultsTurnOver = pr.marginVariableLoads - pr.balanceFixedCost;
    pr.ratioMarginVariableLoads = pr.balanceTurnover
      ? pr.marginVariableLoads / pr.balanceTurnover : 0;
    // BreakEven Value
    pr.breakEvenValue = pr.ratioMarginVariableLoads
      ? pr.balanceFixedCost / pr.ratioMarginVariableLoads : 0;
    // Break Even Point By Days
    pr.breakEvenPoint = pr.balanceTurnover
      ? pr.breakEvenValue / (pr.balanceTurnover / 360) : 0;
    pr.breakEvenPoint = parseInt(pr.breakEvenPoint, 10);
    // Break Even Point By Cases
    pr.breakEventPointByCase = pr.balanceTurnover
      ? pr.breakEvenValue / (pr.balanceTurnover / pr.numberOfCases) : 0;
    pr.breakEventPointByCase = parseInt(pr.breakEventPointByCase, 10);
    // Margin Variable load for All Products
    pr.marginVariableLoadsP = pr.totalProduct - pr.balanceVariableCost;
    pr.calculateBreakEvenP = (pr.marginVariableLoadsP > 0) ? 1 : 0;
    pr.cantCalculateBreakEvenP = (pr.marginVariableLoadsP <= 0) ? 1 : 0;
    // Results TurnOver Products
    pr.resultsTurnOverP = pr.marginVariableLoadsP - pr.balanceFixedCost;
    pr.ratioMarginVariableLoadsP = pr.totalProduct
      ? pr.marginVariableLoadsP / pr.totalProduct : 0;
    pr.breakEvenValueP = pr.ratioMarginVariableLoadsP
      ? pr.balanceFixedCost / pr.ratioMarginVariableLoadsP : 0;
    // Break Even Point By Days for All Products
    pr.breakEvenPointP = pr.totalProduct
      ? pr.breakEvenValueP / (pr.totalProduct / 360) : 0;
    pr.breakEvenPointP = parseInt(pr.breakEvenPointP, 10);
    // Break Even Point By Cases for All Products
    pr.breakEvenPointCaseP = pr.totalProduct
      ? pr.breakEvenValueP / (pr.totalProduct / pr.numberOfCases) : 0;
    pr.breakEvenPointCaseP = parseInt(pr.breakEvenPointCaseP, 10);
  });

  return configured;
}
exports.configuration = configuration;
