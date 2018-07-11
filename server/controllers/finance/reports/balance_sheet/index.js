const q = require('q');
const _ = require('lodash');
const db = require('../../../../lib/db');
const util = require('../../../../lib/util');
const Tree = require('../../../../lib/Tree');
const ReportManager = require('../../../../lib/ReportManager');

const fiscal = require('../../fiscal');

const TEMPLATE = './server/controllers/finance/reports/balance_sheet/report.handlebars';

exports.document = document;
exports.formatData = formatData;


const ASSET_ACCOUNT_TYPE = 1;
const LIABILITY_ACCOUNT_TYPE = 2;
const EQUITY_ACCOUNT_TYPE = 3;

const DECIMAL_PRECISION = 2; // ex: 12.4567 => 12.46

function document(req, res, next) {
  const params = req.query;

  let docReport;
  const options = _.extend(req.query, {
    filename : 'TREE.OPERATING_ACCOUNT',
    csvKey : 'rows',
    user : req.session.user,
  });

  try {
    docReport = new ReportManager(TEMPLATE, req.session, options);
  } catch (e) {
    next(e);
    return;
  }

  let queries;
  let range;

  const getQuery = fiscal.accountBanlanceByTypeId;

  const periods = {
    periodFrom : params.periodFrom,
    periodTo : params.periodTo,
  };

  fiscal.getDateRangeFromPeriods(periods).then(dateRange => {
    range = dateRange;

    const totalSql = `SELECT SUM(r.amount) as total FROM (${getQuery()}) as r`;

    const liabilityParams = [
      params.fiscal,
      range.dateFrom,
      range.dateTo,
      LIABILITY_ACCOUNT_TYPE,
    ];

    const assetParams = [
      params.fiscal,
      range.dateFrom,
      range.dateTo,
      ASSET_ACCOUNT_TYPE,
    ];

    const equityParams = [
      params.fiscal,
      range.dateFrom,
      range.dateTo,
      EQUITY_ACCOUNT_TYPE,
    ];

    queries = [
      db.exec(getQuery(), assetParams),
      db.exec(getQuery(), liabilityParams),
      db.exec(getQuery(), equityParams),
      db.one(totalSql, assetParams),
      db.one(totalSql, liabilityParams),
      db.one(totalSql, equityParams),
    ];

    return q.all(queries);
  })
    .spread((asset, liability, equity, totalAsset, totalLiability, totalEquity) => {
      const props = [LIABILITY_ACCOUNT_TYPE, EQUITY_ACCOUNT_TYPE];
      const context = {
        liability : gatherTrees([liability, equity], props, 'type_id', 'amount'),
        asset : prepareTree(asset, 'type_id', ASSET_ACCOUNT_TYPE, 'amount'),
        totalLiability :  (totalLiability.total + totalEquity.total),
        totalAsset : totalAsset.total,
        dateFrom : range.dateFrom,
        dateTo : range.dateTo,
      };

      formatData(context.asset, context.totalAsset, DECIMAL_PRECISION);
      formatData(context.liability, context.totalLiability, DECIMAL_PRECISION);

      return docReport.render(context);
    })
    .then((result) => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();
}

// create the tree structure, filter by property and sum nodes' summableProp
function prepareTree(data, prop, value, summableProp) {
  const tree = new Tree(data);
  try {
    tree.filterByLeaf(prop, value);
    tree.walk(Tree.common.sumOnProperty(summableProp), false);
    tree.walk(Tree.common.computeNodeDepth);
    return tree.toArray();
  } catch (error) {
    return [];
  }
}

// combines two differents trees of accounts
function gatherTrees(trees, keys, prop, summableProp) {
  const container = [];
  trees.forEach((t, index) => {
    const tree = new Tree(t);
    tree.filterByLeaf(prop, keys[index]);
    container.push(...tree.toArray());
  });

  const containerTree = new Tree(container);
  try {
    containerTree.walk(Tree.common.sumOnProperty(summableProp), false);
    containerTree.walk(Tree.common.computeNodeDepth);
    return containerTree.toArray();
  } catch (error) {
    return [];
  }
}

// set the percentage of each amoun's row,
// round amounts
function formatData(result, total, decimalPrecision) {
  const _total = (total === 0) ? 1 : total;
  return result.forEach(row => {
    row.title = (row.depth < 3);

    if (row.title) {
      row.percent = util.roundDecimal(Math.abs((row.amount / _total) * 100), decimalPrecision);
    }
    row.amount = util.roundDecimal(row.amount, decimalPrecision);
  });
}
