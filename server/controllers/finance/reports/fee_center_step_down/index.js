const _ = require('lodash');
const db = require('../../../../lib/db');
const Stepdown = require('../../../../lib/stepdown');
const ReportManager = require('../../../../lib/ReportManager');
const Exchange = require('../../exchange');
const fiscal = require('../../fiscal');

const TEMPLATE = './server/controllers/finance/reports/fee_center_step_down/report.handlebars';

// expose to the API
exports.report = document;

/**
 * @function reporting
 *
 * @description
 * Renders the Compte d'Exploitation
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
  const enterpriseId = session.enterprise.id;
  const enterpriseCurrencyId = session.enterprise.currency_id;

  const periods = {
    periodFrom : params.periodFrom,
    periodTo : params.periodTo,
  };

  const range = await fiscal.getDateRangeFromPeriods(periods);
  const exchangeRate = await Exchange.getExchangeRate(enterpriseId, params.currency_id, range.dateTo);

  let lastRateUsed;
  let firstCurrency;
  let secondCurrency;

  firstCurrency = enterpriseCurrencyId;
  secondCurrency = params.currency_id;
  lastRateUsed = exchangeRate.rate;

  if (lastRateUsed && lastRateUsed < 1) {
    lastRateUsed = (1 / lastRateUsed);
    firstCurrency = params.currency_id;
    secondCurrency = enterpriseCurrencyId;
  }

  const query = 'CALL FeeCenterCostWithIndexes(?, ?);';
  const [feeCenters] = await db.exec(query, [range.dateFrom, range.dateTo]);

  const formattedFeeCenters = feeCenters.map(item => {
    item.principal = !!item.is_principal;
    item.directCost = item.direct_cost;
    if (item.default_fee_center_index_id && !item.principal) {
      item.allocation = { method : 'proportion', field : item.default_fee_center_index_id };
    }
    return item;
  });

  const data = Stepdown.compute(formattedFeeCenters);

  const cumulatedAllocatedCosts = Array(data.length).fill(0);
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[i].toDist.length; j++) {
      cumulatedAllocatedCosts[j] += data[i].toDist[j];
    }
  }

  const afterAllocations = cumulatedAllocatedCosts.map((value, index) => {
    return data[index].principal ? value : 0;
  });

  const context = {
    dateFrom : range.dateFrom,
    dateTo : range.dateTo,
    currencyId : params.currency_id,
    firstCurrency,
    secondCurrency,
    rate : lastRateUsed,
    data,
    cumulatedAllocatedCosts,
    afterAllocations,
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
