const helpers = require('../../shared/helpers');
const ReportCashflowPage = require('./cashflow_by_service.page');

describe('Cashflow By Service Report', () => {
  let Page;
  const key = 'cashflow_by_service';

  const dataset = {
    cashbox : 'Caisse Aux',
    date_range    : 'year',
    date_range2   : 'month',
    dateFrom      : '01/01/2017',
    dateTo        : '01/04/2017',
    report_name   : 'Cashflow Report',
    renderer      : 'PDF',
  };

  before(async () => {
    await helpers.navigate(`#!/reports/${key}`);
    Page = new ReportCashflowPage(key);
  });

  it('preview a new Cashflow By Service Report', async () => {
    await Page.showCashflowByServiceReportPreview(dataset.date_range, null, null, dataset.cashbox);
  });

  it('close the previewed report', async () => {
    await Page.closeCashflowByServiceReportPreview();
  });

  it('save a previewed report', async () => {
    await Page.saveCashflowByServiceReport(
      null,
      dataset.dateFrom,
      dataset.dateTo,
      dataset.cashbox,
      dataset.report_name,
      dataset.renderer
    );
  });

  it('report has been saved into archive', async () => {
    await Page.checkSavedCashflowByServiceReport(dataset.report_name);
  });

  it('print the previewed report', async () => {
    await Page.printCashflowByServiceReport(dataset.date_range2, null, null, dataset.cashbox);
  });
});
