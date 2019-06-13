const financeReports = require('./finance/reports');

module.exports = {
  balance_report : financeReports.balance.reporting,
};
