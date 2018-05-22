const helpers = require('../../shared/helpers');

const BalanceReportPage = require('./balance_report.page');

describe('Balance Report', () => {
  let Page;
  const key = 'balance_report';

  const dataset = {
    month : 'juin',
    year : '2018',
    reportName : 'Balance Report Saved by E2E',
    renderer : 'PDF',
  };

  before(() => {
    helpers.navigate(`#!/reports/${key}`);
    Page = new BalanceReportPage(key);
  });

  it('preview a new balance report', () => {
    Page.showBalanceReportPreview(dataset.year, dataset.month);
  });

  it('close the previewed report', () => {
    Page.closeBalanceReportPreview();
  });

  it('save a previewed report', () => {
    Page.saveBalanceReport(dataset.year, dataset.month, dataset.reportName, dataset.renderer);
  });

  it('report has been saved into archive', () => {
    Page.checkSavedBalanceReport(dataset.reportName);
  });

  it('print the previewed report', () => {
    Page.printBalanceReport(dataset.year, dataset.month);
  });
});
