const financeReports = require('./finance/reports');

module.exports = {
  balance_report : financeReports.balance.reporting,
  ohada_balance_sheet_report : financeReports.ohadaBalanceSheet.reporting,
  ohada_profit_loss : financeReports.ohadaProfitLoss.reporting,
  operating : financeReports.operating.reporting,
};
