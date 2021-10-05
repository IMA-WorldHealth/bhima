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
      cc.id, 
      ccb.name AS cost_center_allocation_basis_label, 
      ccbv.quantity,
      cc.label AS cost_center_label,
      cc.step_order 
    FROM cost_center cc 
      JOIN cost_center_allocation_basis_value ccbv ON ccbv.cost_center_id = cc.id 
      JOIN cost_center_allocation_basis ccb ON ccb.id = ccbv.basis_id
    ORDER BY cc.step_order ASC;
  `;
  const costCenterIndexesList = await db.exec(queryCostCenterIndexesList);

  const indexes = _.groupBy(costCenterIndexesList, 'cost_center_allocation_basis_label');

  const costCenterList = costCenterIndexesList
    .map(row => row.cost_center_label)
    .filter((row, index, array) => (array.indexOf(row) === index));

  const costCenterIndexes = _.keys(indexes)
    .map((index) => {
      const ccIndex = _.sortBy(indexes[index], 'step_order');

      const line = { index, distribution : [] };

      ccIndex.forEach((item) => {
        line.distribution.push({ id : item.id, cost_center_label : item.cost_center_label, value : item.quantity });
      });

      return line;
    });

  return { costCenterList, costCenterIndexes };
}

async function list(req, res, next) {
  try {
    const allocationKeys = await fetch();
    console.log('keys:', allocationKeys);
    res.status(200).json(allocationKeys);
  } catch (error) {
    next(error);
  }
}

exports.fetch = fetch;
exports.list = list;
