const helpers = require('../../shared/helpers');
const ReportDebtorsPage = require('./aged_debtors.page');

describe('Aged Debtors Report', () => {
  let Page;
  const key = 'aged_debtors';

  const dataset = {
    include_zeroes : true,
    report_name : 'Aged Debtors Report Saved by E2E',
    renderer : 'PDF',
    year : '2015',
    month : 'mai ',
    month2 : 'juin',
  };

  before(() => {
    helpers.navigate(`#!/reports/${key}`);
    Page = new ReportDebtorsPage(key);
  });


  it('preview a new Aged Debtors Report', () => {
    Page.showDebtorsReportPreview(dataset.year, dataset.month, dataset.include_zeroes);
  });

  it('close the previewed report', () => {
    Page.closeDebtorsReportPreview();
  });

  it('save a previewed report', () => {
    Page.saveDebtorsReport(dataset.year, dataset.month2, false, dataset.report_name, dataset.renderer);
  });

  it('report has been saved into archive', () => {
    Page.checkSavedDebtorsReport(dataset.report_name);
  });

  it('print the previewed report', () => {
    Page.printDebtorsReport(dataset.year, dataset.month, dataset.include_zeroes);
  });
});
