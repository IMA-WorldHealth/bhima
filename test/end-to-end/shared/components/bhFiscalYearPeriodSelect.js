const bhFiscalYearSelect = require('./bhFiscalYearSelect');
const bhPeriodSelection = require('./bhPeriodSelection');

async function set(fiscalYear, period) {
  await bhFiscalYearSelect.set(fiscalYear);
  await bhPeriodSelection.set(period);
}

module.exports = { set };
