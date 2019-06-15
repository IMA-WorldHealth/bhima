/**
 * Ohada Balance sheet Controller
 *
 * This controller is responsible for processing
 * the ohada balance sheet (bilan) report.
 *
 * @module reports/ohada_balance_sheet
 *
 * @requires lodash
 * @requires lib/ReportManager
 * @requires lib/errors/BadRequest
 */

const Q = require('q');
const _ = require('lodash');
const AccountReference = require('../../accounts/references');
const ReportManager = require('../../../../lib/ReportManager');
const conditionalReferences = require('../../accounts/conditionalReferences');
const balanceSheetElement = require('./balanceSheetElement');

// report template
const TEMPLATE = './server/controllers/finance/reports/ohada_balance_sheet/report.handlebars';

// default report parameters
const DEFAULT_PARAMS = {
  csvKey : 'accounts',
  filename : 'TREE.BALANCE',
  orientation : 'landscape',
  footerRight : '[page] / [toPage]',
  fontSize : 8,
};

const balanceSheetAssetTable = balanceSheetElement.balanceSheetAssetTable();

const balanceSheetLiabilityTable = balanceSheetElement.balanceSheetLiabilityTable();

// expose to the API
exports.document = document;
exports.aggregateReferences = aggregateReferences;
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

  balanceSheetElement.getFiscalYearDetails(params.fiscal_id)
    .then(fiscalYear => {
      _.merge(context, { fiscalYear });
      const currentPeriodReferences = AccountReference.computeAllAccountReference(fiscalYear.current.period_id);
      const currentConditionalReferences = conditionalReferences.compute(fiscalYear.current.period_id);

      const previousPeriodReferences = fiscalYear.previous.period_id
        ? AccountReference.computeAllAccountReference(fiscalYear.previous.period_id) : [];

      const previousConditionalReferences = fiscalYear.previous.period_id
        ? conditionalReferences.compute(fiscalYear.previous.period_id) : [];

      return Q.all([
        currentPeriodReferences,
        previousPeriodReferences,
        currentConditionalReferences,
        previousConditionalReferences]);
    })
    .spread((currentData, previousData, currentConditional, previousConditional) => {
      if (currentConditional.length) {
        currentConditional.forEach(cond => {
          const conditional = cond[0];
          currentData.forEach(current => {
            if (current.abbr === conditional.abbr) {
              if ((parseInt(conditional.credit_balance, 10) === 1) && (conditional.balance > 0)) {
                current.balance -= conditional.balance;
              }

              if ((parseInt(conditional.debit_balance, 10) === 1) && (conditional.balance < 0)) {
                current.balance -= conditional.balance;
              }
            }
          });
        });
      }

      if (previousConditional.length) {
        previousConditional.forEach(cond => {
          const conditional = cond[0];

          previousData.forEach(previous => {
            if (previous.abbr === conditional.abbr) {
              if ((parseInt(conditional.credit_balance, 10) === 1) && (conditional.balance > 0)) {
                previous.balance -= conditional.balance;
              }

              if ((parseInt(conditional.debit_balance, 10) === 1) && (conditional.balance < 0)) {
                previous.balance -= conditional.balance;
              }
            }
          });
        });
      }

      let list = [];
      const currentReferences = balanceSheetElement.formatReferences(_.groupBy(currentData, 'abbr'));
      const previousReferences = balanceSheetElement.formatReferences(_.groupBy(previousData, 'abbr'));

      const assetTable = balanceSheetAssetTable.map(item => {
        item.label = 'REPORT.OHADA.REF_DESCRIPTION.'.concat(item.ref);
        const current = currentReferences[item.ref];
        const previous = previousReferences[item.ref];
        if (current) {
          item.currentBrut = current.brut.balance;
          item.currentAmo = current.amortissement.balance;
          item.currentNet = current.net.balance;
          item.previousNet = previous ? previous.net.balance : 0;
        }

        // process manually totals
        if (item.ref === 'AA') {
          list = ['AX', 'AY', 'AZ'];
          _.extend(item, aggregateReferences(list, currentReferences, previousReferences));
        }

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

        if (item.ref === 'BB') {
          list = ['BC', 'BD', 'BE', 'BF'];
          _.extend(item, aggregateReferences(list, currentReferences, previousReferences));
        }

        if (item.ref === 'BG') {
          list = ['BH', 'BI', 'BJ'];
          _.extend(item, aggregateReferences(list, currentReferences, previousReferences));
        }

        if (item.ref === 'BK') {
          list = ['BA', 'BC', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ'];
          _.extend(item, aggregateReferences(list, currentReferences, previousReferences));
        }

        if (item.ref === 'BT') {
          list = ['BQ', 'BR', 'BS'];
          _.extend(item, aggregateReferences(list, currentReferences, previousReferences));
        }

        if (item.ref === 'BZ') {
          list = ['AE', 'AF', 'AG', 'AH', 'AJ', 'AK', 'AL', 'AM', 'AN', 'AP', 'AR', 'AS']
            .concat(['BA', 'BC', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BQ', 'BR', 'BS']);
          _.extend(item, aggregateReferences(list, currentReferences, previousReferences));
        }
        return item;
      });

      const liabilityTable = balanceSheetLiabilityTable.map(item => {
        item.label = 'REPORT.OHADA.REF_DESCRIPTION.'.concat(item.ref);
        const current = currentReferences[item.ref];
        const previous = previousReferences[item.ref];
        if (current) {
          item.currentBrut = current.brut.balance;
          item.currentAmo = current.amortissement.balance;
          item.currentNet = current.net.balance;
          item.previousNet = previous ? previous.net.balance : 0;
        }

        // process manually totals
        if (item.ref === 'CC') {
          list = ['CD', 'CE', 'CF', 'CG'];
          _.extend(item, aggregateReferences(list, currentReferences, previousReferences));
        }

        if (item.ref === 'CK') {
          list = ['CL', 'CM'];
          _.extend(item, aggregateReferences(list, currentReferences, previousReferences));
        }


        if (item.ref === 'CP') {
          list = ['CA', 'CB', 'CD', 'CE', 'CF', 'CH', 'CI', 'CK', 'CG', 'CL', 'CM'];
          _.extend(item, aggregateReferences(list, currentReferences, previousReferences));
        }

        if (item.ref === 'DF') {
          list = ['DA', 'DB', 'DC', 'DD'];
          _.extend(item, aggregateReferences(list, currentReferences, previousReferences));
        }

        if (item.ref === 'DG') {
          list = ['CA', 'CB', 'CD', 'CE', 'CF', 'CH', 'CI', 'CK', 'CG', 'CL', 'CM', 'DA', 'DB', 'DC', 'DD'];
          _.extend(item, aggregateReferences(list, currentReferences, previousReferences));
        }

        if (item.ref === 'DP') {
          list = ['DH', 'DI', 'DJ', 'DK', 'DM', 'DN'];
          _.extend(item, aggregateReferences(list, currentReferences, previousReferences));
        }

        if (item.ref === 'DT') {
          list = ['DQ', 'DR', 'DS'];
          _.extend(item, aggregateReferences(list, currentReferences, previousReferences));
        }

        if (item.ref === 'DZ') {
          list = ['CA', 'CB', 'CD', 'CE', 'CF', 'CH', 'CI', 'CK', 'CG', 'CL', 'CM', 'DA', 'DB', 'DC', 'DD']
            .concat(['DH', 'DI', 'DJ', 'DK', 'DM', 'DN'])
            .concat(['DQ', 'DR', 'DS']);
          _.extend(item, aggregateReferences(list, currentReferences, previousReferences));
        }
        return item;
      });

      /**
       * displays depreciation in positive values
       */
      assetTable.forEach(item => {
        item.currentAmo *= -1;
      });

      /**
       * liabilities have by default a creditor sold (negative value),
       * in order to present them correctly to users they must be converted into positive
       * values, so for doing that we will multiply them by -1
       */
      liabilityTable.forEach(item => {
        item.currentNet *= -1;
        item.previousNet *= -1;
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
