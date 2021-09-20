/**
* Cost Center Allocation Keys
*
* This controller exposes an API to the client for reading allocation keys
*/
// const _ = require('lodash');
const db = require('../../lib/db');
const Stepdown = require('../../lib/stepdown');
const fiscal = require('./fiscal');
const ccAllocationKeys = require('./cost_center_allocation_bases');

async function fetch(session, params) {
  const defaultCurrentYear = new Date();
  const enterpriseCurrencyId = session.enterprise.currency_id;

  const periods = {
    periodFrom : params.periodFrom || `${defaultCurrentYear.getFullYear()}01`,
    periodTo : params.periodTo || `${defaultCurrentYear.getFullYear()}12`,
  };

  const range = await fiscal.getDateRangeFromPeriods(periods);
  const query = 'CALL ComputeCostCenterAllocationByIndex(?, ?);';
  let [feeCenters] = await db.exec(query, [range.dateFrom, range.dateTo]);

  if (feeCenters.length) {
    const [single] = feeCenters;
    feeCenters = single.error_message ? [] : feeCenters;
  }

  const formattedFeeCenters = feeCenters.map(item => {
    item.principal = !!item.is_principal;
    item.auxiliary = !item.principal;
    item.directCost = item.direct_cost;
    if (item.allocation_basis_id && !item.principal) {
      item.allocation = { method : 'proportional', field : item.allocation_basis_id };
    }
    return item;
  });
  const data = Stepdown.compute(formattedFeeCenters);
  const cumulatedAllocatedCosts = data.map((item, index, array) => (item.principal ? 0 : array[index].toDist[index]));
  const auxiliaryIndexes = data.map((item, i) => (item.auxiliary ? i : null)).filter(item => !!item);
  const services = data.map(item => {
    item.distribution = item.toDist.map((value, i) => {
      const ratio = item.ratio ? item.ratio[i] : undefined;
      return { value, ratio };
    });
    item.auxiliaryDistribution = item.distribution.map((value, i) => {
      return auxiliaryIndexes.includes(i) ? value : null;
    }).filter(value => !!value);
    return item;
  });
  const directCostTotal = services.reduce((prev, curr) => { return curr.directCost + prev; }, 0);

  // horizontal view
  const hView = [];
  let totalAfterAllocation = 0;

  for (let i = 0; i < data.length; i++) {
    const ei = data[i];
    const row = {
      name : ei.cost_center_label,
      principal : ei.principal,
      direct : ei.directCost,
      values : [],
      total : 0,
    };
    for (let z = 0; z < data.length; z++) {
      const value = data[z].toDist[i];
      const ratio = data[z].ratio ? data[z].ratio[i] : 0;
      const selfCenter = !!(i === z);
      const selfCenterValue = selfCenter ? value * -1 : null;
      row.total += i !== z ? value : 0;
      row.values.push({
        value,
        ratio,
        selfCenter,
        selfCenterValue,
      });
    }
    // the total is the direct cost plus all allocations
    row.total += ei.directCost;
    // auxiliary cost center distribute all of their value
    row.total = ei.auxiliary ? 0 : row.total;
    // the total after all allocation (this value must be equal to the sum of all direct cost)
    totalAfterAllocation += row.total;
    hView.push(row);
  }

  // cost center allocation keys details
  const { costCenterList, costCenterIndexes } = await ccAllocationKeys.fetch();

  return {
    dateFrom : range.dateFrom,
    dateTo : range.dateTo,
    currencyId : enterpriseCurrencyId,
    data,
    cumulatedAllocatedCosts,
    costCenterIndexes,
    costCenterList,
    directCostTotal,
    totalAfterAllocation,
    hView,
  };
}

async function list(req, res, next) {
  try {
    const allocationRegistry = await fetch(req.session, req.query);
    res.status(200).json(allocationRegistry);
  } catch (error) {
    next(error);
  }
}

exports.fetch = fetch;
exports.list = list;
