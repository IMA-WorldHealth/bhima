/**
 * Ohada Balance sheet Controller
 *
 * This controller is responsible for processing
 * the ohada balance sheet (bilan) report.
 *
 * @module reports/ohada_balance_sheet
 *
 * @requires lodash
 * @requires lib/db
 * @requires lib/ReportManager
 * @requires lib/errors/BadRequest
 */

const Q = require('q');
const _ = require('lodash');
const db = require('../../../../lib/db');
const AccountReference = require('../../accounts/references');
const ReportManager = require('../../../../lib/ReportManager');

// report template
const TEMPLATE = './server/controllers/finance/reports/ohada_balance_sheet/report.handlebars';

// default report parameters
const DEFAULT_PARAMS = {
  csvKey : 'accounts',
  filename : 'TREE.BALANCE',
  orientation : 'landscape',
  footerRight : '[page] / [toPage]',
};

const balanceSheetAssetTable = [
  { ref : 'AD', is_title : 1 },
  { ref : 'AE', is_title : 0 },
  { ref : 'AF', is_title : 0 },
  { ref : 'AG', is_title : 0 },
  { ref : 'AH', is_title : 0 },
  { ref : 'AI', is_title : 1 },
  { ref : 'AJ', is_title : 0 },
  { ref : 'AK', is_title : 0 },
  { ref : 'AL', is_title : 0 },
  { ref : 'AM', is_title : 0 },
  { ref : 'AN', is_title : 0 },
  { ref : 'AP', is_title : 0 },
  { ref : 'AQ', is_title : 1 },
  { ref : 'AR', is_title : 0 },
  { ref : 'AS', is_title : 0 },
  { ref : 'AZ', is_title : 1 },
  { ref : 'BA', is_title : 0 },
  { ref : 'BB', is_title : 0 },
  { ref : 'BG', is_title : 0 },
  { ref : 'BH', is_title : 0 },
  { ref : 'BI', is_title : 0 },
  { ref : 'BJ', is_title : 0 },
  { ref : 'BK', is_title : 1 },
  { ref : 'BQ', is_title : 0 },
  { ref : 'BR', is_title : 0 },
  { ref : 'BS', is_title : 0 },
  { ref : 'BT', is_title : 1 },
  { ref : 'BU', is_title : 0 },
  { ref : 'BZ', is_title : 1 },
];

const balanceSheetLiabilityTable = [
  { ref : 'CA', is_title : 1 },
  { ref : 'CB', is_title : 0 },
  { ref : 'CC', is_title : 0 },
  { ref : 'CD', is_title : 0 },
  { ref : 'CE', is_title : 0 },
  { ref : 'CF', is_title : 0 },
  { ref : 'CG', is_title : 0 },
  { ref : 'CH', is_title : 0 },
  { ref : 'CI', is_title : 1 },
  { ref : 'CK', is_title : 1 },
  { ref : 'CL', is_title : 0 },
  { ref : 'CM', is_title : 0 },
  { ref : 'CP', is_title : 1 },
  { ref : 'DA', is_title : 0 },
  { ref : 'DB', is_title : 0 },
  { ref : 'DC', is_title : 0 },
  { ref : 'DD', is_title : 0 },
  { ref : 'DF', is_title : 1 },
  { ref : 'DG', is_title : 1 },
  { ref : 'DH', is_title : 0 },
  { ref : 'DI', is_title : 0 },
  { ref : 'DJ', is_title : 0 },
  { ref : 'DK', is_title : 0 },
  { ref : 'DM', is_title : 0 },
  { ref : 'DN', is_title : 0 },
  { ref : 'DP', is_title : 0 },
  { ref : 'DQ', is_title : 0 },
  { ref : 'DR', is_title : 0 },
  { ref : 'DS', is_title : 0 },
  { ref : 'DT', is_title : 1 },
  { ref : 'DV', is_title : 1 },
  { ref : 'DZ', is_title : 1 },
];

// expose to the API
exports.document = document;

/**
 * @function document
 * @description process and render the balance report document
 */
function document(req, res, next) {
  const params = req.query;
  const context = {};
  let report;

  _.defaults(params, DEFAULT_PARAMS);

  try {
    report = new ReportManager(TEMPLATE, req.session, params);
  } catch (e) {
    next(e);
    return;
  }

  getFiscalYearDetails(params.fiscal_id)
    .then(fiscalYear => {
      _.merge(context, { fiscalYear });

      const currentPeriodReferences = AccountReference.computeAllAccountReference(fiscalYear.current.period_id);
      const previousPeriodReferences = fiscalYear.previous.period_id ?
        AccountReference.computeAllAccountReference(fiscalYear.previous.period_id) : [];
      return Q.all([currentPeriodReferences, previousPeriodReferences]);
    })
    .spread((current, previous) => {
      let list = [];
      const currentReferences = formatReferences(_.groupBy(current, 'abbr'));
      const previousReferences = formatReferences(_.groupBy(previous, 'abbr'));

      const assetTable = balanceSheetAssetTable.map(item => {
        item.label = 'REPORT.OHADA.REF_DESCRIPTION.'.concat(item.ref);
        if (currentReferences[item.ref]) {
          item.currentBrut = currentReferences[item.ref].brut.balance;
          item.currentAmo = currentReferences[item.ref].amortissement.balance;
          item.currentNet = currentReferences[item.ref].net.balance;
          item.previousNet = previousReferences[item.ref] ? previousReferences[item.ref].net.balance : 0;
        }

        // process manually totals
        if (item.ref === 'AD') {
          list = ['AE', 'AF', 'AG', 'AH'];
          _.extend(item, aggregateReferences(list, currentReferences, previousReferences));
        }

        if (item.ref === 'AI') {
          list = ['AJ', 'AK', 'AL', 'AM', 'AN', 'AP'];
          _.extend(item, aggregateReferences(list, currentReferences, previousReferences));
        }

        if (item.ref === 'AQ') {
          list = ['AR', 'AS'];
          _.extend(item, aggregateReferences(list, currentReferences, previousReferences));
        }

        if (item.ref === 'AZ') {
          list = ['AE', 'AF', 'AG', 'AH', 'AJ', 'AK', 'AL', 'AM', 'AN', 'AP', 'AR', 'AS'];
          _.extend(item, aggregateReferences(list, currentReferences, previousReferences));
        }

        if (item.ref === 'BK') {
          list = ['BA', 'BB', 'BG', 'BH', 'BI', 'BJ'];
          _.extend(item, aggregateReferences(list, currentReferences, previousReferences));
        }

        if (item.ref === 'BT') {
          list = ['BQ', 'BR', 'BS'];
          _.extend(item, aggregateReferences(list, currentReferences, previousReferences));
        }

        if (item.ref === 'BZ') {
          list = ['AE', 'AF', 'AG', 'AH', 'AJ', 'AK', 'AL', 'AM', 'AN', 'AP', 'AR', 'AS']
            .concat(['BA', 'BB', 'BG', 'BH', 'BI', 'BJ', 'BQ', 'BR', 'BS', 'BU']);
          _.extend(item, aggregateReferences(list, currentReferences, previousReferences));
        }
        return item;
      });

      const liabilityTable = balanceSheetLiabilityTable.map(item => {
        item.label = 'REPORT.OHADA.REF_DESCRIPTION.'.concat(item.ref);
        if (currentReferences[item.ref]) {
          item.currentBrut = currentReferences[item.ref].brut.balance;
          item.currentAmo = currentReferences[item.ref].amortissement.balance;
          item.currentNet = currentReferences[item.ref].net.balance;
          item.previousNet = previousReferences[item.ref] ? previousReferences[item.ref].net.balance : 0;
        }

        // process manually totals
        if (item.ref === 'CP') {
          list = ['CL', 'CM'];
          _.extend(item, aggregateReferences(list, currentReferences, previousReferences));
        }

        if (item.ref === 'DF') {
          list = ['DA', 'DB', 'DC', 'DD'];
          _.extend(item, aggregateReferences(list, currentReferences, previousReferences));
        }

        if (item.ref === 'DG') {
          list = ['CL', 'CM', 'DA', 'DB', 'DC', 'DD'];
          _.extend(item, aggregateReferences(list, currentReferences, previousReferences));
        }

        if (item.ref === 'DP') {
          list = ['DH', 'DI', 'DJ', 'DK', 'DL', 'DM', 'DN'];
          _.extend(item, aggregateReferences(list, currentReferences, previousReferences));
        }

        if (item.ref === 'DT') {
          list = ['DQ', 'DR', 'DS'];
          _.extend(item, aggregateReferences(list, currentReferences, previousReferences));
        }

        if (item.ref === 'DZ') {
          list = ['CL', 'CM', 'DA', 'DB', 'DC', 'DD']
            .concat(['DH', 'DI', 'DJ', 'DK', 'DL', 'DM', 'DN'])
            .concat(['DQ', 'DR', 'DS'])
            .concat(['DV']);
          _.extend(item, aggregateReferences(list, currentReferences, previousReferences));
        }
        return item;
      });

      _.merge(context, { assetTable, liabilityTable });
      return report.render(context);
    })
    .then(result => {
      res.set(result.header).send(result.report);
    })
    .catch(next);
}

function aggregateReferences(references, currentDb, previousDb) {
  const item = {
    currentBrut : 0, currentAmo : 0, currentNet : 0, previousNet : 0,
  };

  references.forEach(ref => {
    item.currentBrut += currentDb[ref] ? currentDb[ref].brut.balance : 0;
    item.currentAmo += currentDb[ref] ? currentDb[ref].amortissement.balance : 0;
    item.currentNet += currentDb[ref] ? currentDb[ref].net.balance : 0;
    item.previousNet += previousDb[ref] ? previousDb[ref].net.balance : 0;
  });

  return item;
}

function formatReferences(references) {
  const values = {};
  _.forEach(references, (value, key) => {
    const [brut] = references[key].filter(elt => elt.is_amo_dep === 0);
    let [amortissement] = references[key].filter(elt => elt.is_amo_dep === 1);

    if (!amortissement) {
      amortissement = { balance : 0 };
    }

    const net = {
      abbr : brut.abbr,
      description : brut.description,
      balance : brut.balance - amortissement.balance,
    };

    values[key] = { brut, amortissement, net };
  });
  // Object.keys(references).forEach(key => {
  //   const [brut] = references[key].filter(elt => elt.is_amo_dep === 0);
  //   let [amortissement] = references[key].filter(elt => elt.is_amo_dep === 1);

  //   if (!amortissement) {
  //     amortissement = { balance : 0 };
  //   }

  //   const net = {
  //     abbr : brut.abbr,
  //     description : brut.description,
  //     balance : brut.balance - amortissement.balance,
  //   };

  //   values[key] = { brut, amortissement, net };
  // });
  return values;
}

function getFiscalYearDetails(fiscalYearId) {
  const bundle = {};
  // get fiscal year details and the last period id of the fiscal year
  const query = `
    SELECT 
      p.id AS period_id, p.end_date,
      fy.id, fy.label, fy.previous_fiscal_year_id 
    FROM fiscal_year fy 
    JOIN period p ON p.fiscal_year_id = fy.id 
      AND p.number = (SELECT MAX(period.number) FROM period WHERE period.fiscal_year_id = ?)
    WHERE fy.id = ?;
  `;
  return db.one(query, [fiscalYearId, fiscalYearId])
    .then(fiscalYear => {
      bundle.current = fiscalYear;

      return bundle.current.previous_fiscal_year_id ?
        db.one(query, [bundle.current.previous_fiscal_year_id, bundle.current.previous_fiscal_year_id]) : {};
    })
    .then(previousFiscalYear => {
      bundle.previous = previousFiscalYear;

      return bundle;
    });
}
