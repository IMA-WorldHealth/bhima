const _ = require('lodash');
const db = require('../../../../lib/db');
const Stepdown = require('../../../../lib/stepdown');
const ReportManager = require('../../../../lib/ReportManager');
const fiscal = require('../../fiscal');

const TEMPLATE = './server/controllers/finance/reports/fee_center_step_down/report.handlebars';

// REMOVE ME
require('./mock_data').generate();
// END REMOVE ME

// expose to the API
exports.report = document;

/**
 * @function reporting
 *
 * @description
 * Renders the fee center report
 *
 * @param {*} options the report options
 * @param {*} session the session
 */
async function buildReport(params, session) {
  const options = _.extend(params, {
    filename : 'TREE.FEE_CENTER_STEPDOWN',
    csvKey : 'rows',
    user : session.user,
  });

  const report = new ReportManager(TEMPLATE, session, options);
  const enterpriseCurrencyId = session.enterprise.currency_id;

  const periods = {
    periodFrom : params.periodFrom,
    periodTo : params.periodTo,
  };

  const range = await fiscal.getDateRangeFromPeriods(periods);
  const query = 'CALL FeeCenterCostWithIndexes(?, ?);';
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
  const queryFeeCenterIndexesList = `
    SELECT 
      ccb.id, 
      ccb.name AS cost_center_basis_label, 
      ccbv.quantity, fc.label AS fee_center_label,
      fc.step_order 
    FROM fee_center fc 
    JOIN cost_center_basis_value ccbv ON ccbv.cost_center_id = fc.id 
    JOIN cost_center_basis ccb ON ccb.id = ccbv.basis_id
    ORDER BY fc.step_order ASC;
  `;
  const feeCenterIndexesList = await db.exec(queryFeeCenterIndexesList);
  const indexes = _.groupBy(feeCenterIndexesList, 'cost_center_basis_label');
  const feeCenterList = [];
  const feeCenterIndexes = _.keys(indexes).map((index, i) => {
    const fcIndex = _.sortBy(indexes[index], 'step_order');
    const line = { index, distribution : [] };
    fcIndex.forEach((item) => {
      if (i === 0) { feeCenterList.push(item.fee_center_label); }
      line.distribution.push({ fee_center_label : item.fee_center_label, value : item.quantity });
    });
    return line;
  });
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
      name : ei.fee_center_label,
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

  const context = {
    dateFrom : range.dateFrom,
    dateTo : range.dateTo,
    currencyId : enterpriseCurrencyId,
    data,
    cumulatedAllocatedCosts,
    feeCenterIndexes,
    feeCenterList,
    directCostTotal,
    totalAfterAllocation,
    hView,
  };

  return report.render(context);
}

function document(req, res, next) {
  buildReport(req.query, req.session)
    .then((result) => {
      res.set(result.headers).send(result.report);
    })
    .catch(next);
}
