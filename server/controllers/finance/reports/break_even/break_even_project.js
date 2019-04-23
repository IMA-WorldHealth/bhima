/**
 * configuration
 *
 * @method configuration
 *
 * @description
 *
 * The configuration function has only one parameter data,
 * data is a large object that has the following elements:
 *
 *  feeCenter,
 *  references,
 *  accountReferences,
 *  dataDistributions,
 *  distributionKey,
 *  includeManual,
 * The fees Center, the account references, the values of the account references,
 * the different types of distribution key of the auxiliary centers to the main centers,
 * as well as the option to include manually made reparations,
 * This function allows to link expense centers to account references, then,
 * if the option to include manual reparations is enabled, the data contained in dataDistrutions
 * was used to add this data to the main centers, and the manual undistributed data was it via
 * the distribution keys The different references of the accounts are categorized
 * for the charges there are the fixed and variable charges and for the profits
 * there are the turnover and the other products,
 * The configuration function returns each main center with the different
 * values for each main center is linked to the projects
 *
 */

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
  });

  return configured;
}

function breakEvenCalcul(project) {
  const breakEven = {};

  breakEven.totalCost = project.balanceVariableCost + project.balanceFixedCost;
  breakEven.totalProduct = project.balanceTurnover + project.balanceOtherRevenue;
  breakEven.marginVariableLoads = project.balanceTurnover - project.balanceVariableCost;
  breakEven.calculateBreakEven = (breakEven.marginVariableLoads > 0) ? 1 : 0;
  breakEven.cantCalculateBreakEven = (breakEven.marginVariableLoads <= 0) ? 1 : 0;
  breakEven.resultsTurnOver = breakEven.marginVariableLoads - project.balanceFixedCost;
  breakEven.ratioMarginVariableLoads = project.balanceTurnover
    ? breakEven.marginVariableLoads / project.balanceTurnover : 0;
  // BreakEven Value
  breakEven.breakEvenValue = breakEven.ratioMarginVariableLoads
    ? project.balanceFixedCost / breakEven.ratioMarginVariableLoads : 0;
  // Break Even Point By Days
  breakEven.breakEvenPoint = project.balanceTurnover
    ? breakEven.breakEvenValue / (project.balanceTurnover / 360) : 0;
  breakEven.breakEvenPoint = parseInt(breakEven.breakEvenPoint, 10);
  // Break Even Point By Cases
  breakEven.breakEventPointByCase = project.balanceTurnover
    ? breakEven.breakEvenValue / (project.balanceTurnover / project.numberOfCases) : 0;
  breakEven.breakEventPointByCase = parseInt(breakEven.breakEventPointByCase, 10);
  // Margin Variable load for All Products
  breakEven.marginVariableLoadsP = breakEven.totalProduct - project.balanceVariableCost;
  breakEven.calculateBreakEvenP = (breakEven.marginVariableLoadsP > 0) ? 1 : 0;
  breakEven.cantCalculateBreakEvenP = (breakEven.marginVariableLoadsP <= 0) ? 1 : 0;
  // Results TurnOver Products
  breakEven.resultsTurnOverP = breakEven.marginVariableLoadsP - project.balanceFixedCost;
  breakEven.ratioMarginVariableLoadsP = breakEven.totalProduct
    ? breakEven.marginVariableLoadsP / breakEven.totalProduct : 0;
  breakEven.breakEvenValueP = breakEven.ratioMarginVariableLoadsP
    ? project.balanceFixedCost / breakEven.ratioMarginVariableLoadsP : 0;
  // Break Even Point By Days for All Products
  breakEven.breakEvenPointP = breakEven.totalProduct
    ? breakEven.breakEvenValueP / (breakEven.totalProduct / 360) : 0;
  breakEven.breakEvenPointP = parseInt(breakEven.breakEvenPointP, 10);
  // Break Even Point By Cases for All Products
  breakEven.breakEvenPointCaseP = breakEven.totalProduct
    ? breakEven.breakEvenValueP / (breakEven.totalProduct / project.numberOfCases) : 0;
  breakEven.breakEvenPointCaseP = parseInt(breakEven.breakEvenPointCaseP, 10);
  return breakEven;
}

exports.configuration = configuration;
exports.breakEvenCalcul = breakEvenCalcul;
