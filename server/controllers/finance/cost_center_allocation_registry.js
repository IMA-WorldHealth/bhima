/**
* Cost Center Allocation Keys
*
* This controller exposes an API to the client for reading allocation keys
*/
// const _ = require('lodash');
const db = require('../../lib/db');
const stepdown = require('../../lib/stepdown');
const fiscal = require('./fiscal');
const ccAllocationKeys = require('./cost_center_allocation_bases');
// const ccAllocationRegistry = require('./cost_center_allocation_registry');
const constants = require('../../config/constants.js');


async function fetch(session, params) {
  const enterpriseCurrencyId = session.enterprise.currency_id;

  const periods = {
    periodFrom : params.periodFrom,
    periodTo : params.periodTo,
  };

  const range = await fiscal.getDateRangeFromPeriods(periods);
  const query = 'CALL ComputeCostCenterAllocationByIndex(?, ?);';
  let [costCenters] = await db.exec(query, [range.dateFrom, range.dateTo]);

  if (costCenters.length) {
    const [single] = costCenters;
    costCenters = single.error_message ? [] : costCenters;
  }

  const formattedCostCenters = costCenters.map(item => {
    item.principal = !!item.is_principal;
    item.auxiliary = !item.principal;
    item.directCost = item.direct_cost;
    if (item.allocation_basis_id && !item.principal) {
      item.allocation = { method : 'proportional', field : item.allocation_basis_id };
    }
    return item;
  });

  // Get the allocation bases that are computable
  const cabQuery = 'SELECT id, name FROM cost_center_allocation_basis WHERE is_computed = 1';
  const computables = await db.exec(cabQuery);

  // Compute and set each computable allocation basis quantity
  const missingCenters = [];
  /* eslint-disable no-await-in-loop */
  for (let i = 0; i < computables.length; i++) {
    const basis = computables[i];
    const data = await allocationQuantities(basis.id);
    formattedCostCenters.forEach(fcc => {
      // Find the match data item for this cost center
      const newData = data.find(item => item.cost_center_id === fcc.id);
      if (newData) {
        // Update the quantity
        fcc[basis.name] = newData[basis.name];
        // console.log("FOUND Updating ", fcc);
      } else {
        // console.log("MISSING Pushing");
        missingCenters.push({ basis : basis.name, id : fcc.id, name : fcc.cost_center_label });
      }
    });
  }

  // Todo do something useful with the missing centers
  // if (missingCenters) {
  //   console.log("No data for these cost centers: ", missingCenters);
  // }

  const data = stepdown.compute(formattedCostCenters);
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

/**
 * Get cost allocation basis quantities
 *
 * This function returns a set of values for the specified
 * allocation_basis_id for each cost center.
 *
 * @param {Number} allocation_basis_id
 */
function allocationQuantities(allocationBasisId) {
  let query = null;
  if (allocationBasisId === constants.allocationBasis.ALLOCATION_BASIS_NUM_EMPLOYEES) {
    // Set up the query for number of employees
    query = `
      SELECT BUID(service.uuid) AS service_uuid, service.name AS service_name,
        COUNT(employee.uuid) AS ALLOCATION_BASIS_NUM_EMPLOYEES,
        GetCostCenterByServiceUuid(service.uuid) as cost_center_id
      FROM service JOIN employee ON service.uuid = employee.service_uuid
      GROUP BY service.uuid;
  `;
  } else {
    return [];
  }
  return db.exec(query);
}


exports.fetch = fetch;
exports.list = list;
