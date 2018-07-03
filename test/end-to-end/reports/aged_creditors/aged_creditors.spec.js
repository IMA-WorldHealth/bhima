const helpers = require('../../shared/helpers');
const ReportCreditorsPage = require('./aged_creditors.page');

describe('Aged Creditors Report', () => {
  let Page;
  const key = 'aged_creditors';

  const dataset = {
    include_zeroes : true,
    report_name : 'Aged Creditors Report Saved by E2E',
    renderer : 'PDF',
    year : '2015',
    month : 'mai ',
    month2 : 'juin',
  };

  before(() => {
    helpers.navigate(`#!/reports/${key}`);
    Page = new ReportCreditorsPage(key);
  });

  it('preview a new Aged Creditors Report', () => {
    Page.showCreditorsReportPreview(dataset.year, dataset.month, dataset.include_zeroes);
  });

  it('close the previewed report', () => {
    Page.closeCreditorsReportPreview();
  });

  it('save a previewed report', () => {
    Page.saveCreditorsReport(dataset.year, dataset.month2, false, dataset.report_name, dataset.renderer);
  });

  it('report has been saved into archive', () => {
    Page.checkSavedCreditorsReport(dataset.report_name);
  });

  it('print the previewed report', () => {
    Page.printCreditorsReport(dataset.year, dataset.month, dataset.include_zeroes);
  });
});
