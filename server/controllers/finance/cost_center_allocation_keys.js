/**
* Cost Center Allocation Keys
*
* This controller exposes an API to the client for reading allocation keys
*/
const _ = require('lodash');
const db = require('../../lib/db');

async function fetch() {
  const queryCostCenterIndexesList = `
    SELECT 
      ccb.id, 
      ccb.name AS cost_center_allocation_basis_label, 
      ccbv.quantity, fc.label AS cost_center_label,
      fc.step_order 
    FROM cost_center fc 
    JOIN cost_center_allocation_basis_value ccbv ON ccbv.cost_center_id = fc.id 
    JOIN cost_center_allocation_basis ccb ON ccb.id = ccbv.basis_id
    ORDER BY fc.step_order ASC;
  `;
  const costCenterIndexesList = await db.exec(queryCostCenterIndexesList);
  const indexes = _.groupBy(costCenterIndexesList, 'cost_center_allocation_basis_label');
  const costCenterList = [];
  const costCenterIndexes = _.keys(indexes).map((index, i) => {
    const fcIndex = _.sortBy(indexes[index], 'step_order');
    const line = { index, distribution : [] };
    fcIndex.forEach((item) => {
      if (i === 0) { costCenterList.push(item.cost_center_label); }
      line.distribution.push({ cost_center_label : item.cost_center_label, value : item.quantity });
    });
    return line;
  });
  return { costCenterList, costCenterIndexes };
}

async function list(req, res, next) {
  try {
    const allocationKeys = await fetch();
    res.status(200).json(allocationKeys);
  } catch (error) {
    next(error);
  }
}

exports.fetch = fetch;
exports.list = list;
