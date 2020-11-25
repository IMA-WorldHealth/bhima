const financeReports = require('./finance/reports');
const stockReports = require('./stock/reports');

module.exports = {
  balance_report : financeReports.balance.reporting,
  ohada_balance_sheet_report : financeReports.ohadaBalanceSheet.reporting,
  ohada_profit_loss : financeReports.ohadaProfitLoss.reporting,
  operating : financeReports.operating.reporting,
  annual_clients_report : financeReports.annualClientsReporting,
  cashflow : financeReports.cashflow.reporting,
  unpaid_invoice_payments : financeReports.unpaidInvoices.reporting,
  stock_value : stockReports.stockValueReporting,
  invoiceRegistryReport : financeReports.invoices.reporting,
};
