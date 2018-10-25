/*
  * Return BalanceSheet Elements for Reports
*/
const _ = require('lodash');
const db = require('../../../../lib/db');

function balanceSheetAssetTable() {
  const data = [
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
    { ref : 'BB', is_title : 1 },
    { ref : 'BC', is_title : 0 },
    { ref : 'BD', is_title : 0 },
    { ref : 'BE', is_title : 0 },
    { ref : 'BF', is_title : 0 },
    { ref : 'BG', is_title : 1 },
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

  return data;
}

function balanceSheetLiabilityTable() {
  const data = [
    { ref : 'CA', is_title : 0 },
    { ref : 'CB', is_title : 0 },
    { ref : 'CC', is_title : 1 },
    { ref : 'CD', is_title : 0 },
    { ref : 'CE', is_title : 0 },
    { ref : 'CF', is_title : 0 },
    { ref : 'CG', is_title : 0 },
    { ref : 'CH', is_title : 1 },
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
    { ref : 'DL', is_title : 0 },
    { ref : 'DM', is_title : 0 },
    { ref : 'DN', is_title : 0 },
    { ref : 'DP', is_title : 1 },
    { ref : 'DQ', is_title : 0 },
    { ref : 'DR', is_title : 0 },
    { ref : 'DS', is_title : 0 },
    { ref : 'DT', is_title : 1 },
    { ref : 'DV', is_title : 1 },
    { ref : 'DZ', is_title : 1 },
  ];

  return data;
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

      return bundle.current.previous_fiscal_year_id
        ? db.one(query, [bundle.current.previous_fiscal_year_id, bundle.current.previous_fiscal_year_id]) : {};
    })
    .then(previousFiscalYear => {
      bundle.previous = previousFiscalYear;

      return bundle;
    });
}

function formatReferences(references) {
  const values = {};
  _.forEach(references, (reference, key) => {
    const [brut] = reference.filter(elt => elt.is_amo_dep === 0);
    let [amortissement] = reference.filter(elt => elt.is_amo_dep === 1);

    if (!amortissement) {
      amortissement = { balance : 0 };
    }

    const net = {
      abbr : brut.abbr,
      description : brut.description,
      // reduce amortissement from brut
      // the amortissement is supposed to be < 0
      // that the reason we use brut + amortissement which is implicitly brut - amortissement
      balance : brut.balance + amortissement.balance,
    };

    values[key] = { brut, amortissement, net };
  });
  return values;
}


exports.balanceSheetAssetTable = balanceSheetAssetTable;
exports.balanceSheetLiabilityTable = balanceSheetLiabilityTable;
exports.getFiscalYearDetails = getFiscalYearDetails;
exports.formatReferences = formatReferences;
