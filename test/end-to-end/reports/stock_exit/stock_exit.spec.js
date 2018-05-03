const helpers = require('../../shared/helpers');

const ReportStockExitPage = require('./stock_exit.page');

describe('StockExit Report', () => {
  let Page;
  const key = 'stock_exit';

  const dataset = {
    depot           : 'Depot Principal',
    dateFrom        : '01/01/2018',
    dateTo          : '31/12/2018',
    report_name     : 'StockExit Report',
    renderer        : 'PDF',
  };

  before(() => {
    helpers.navigate(`#!/reports/${key}`);
    Page = new ReportStockExitPage(key);
  });

  it('preview a new StockExit Report', () => {
    Page.showStockExitReportPreview(dataset.depot, dataset.dateFrom, dataset.dateTo);
  });

  it('close the previewed report', () => {
    Page.closeStockExitReportPreview();
  });

  it('save a previewed report', () => {
    Page.saveStockExitReport(
      dataset.dateFrom,
      dataset.dateTo,
      dataset.depot,
      dataset.report_name,
      dataset.renderer
    );
  });

  it('report has been saved into archive', () => {
    Page.checkSavedStockExitReport(dataset.report_name);
  });

  it('print the previewed report', () => {
    Page.printStockExitReport(dataset.depot, dataset.dateFrom, dataset.dateTo);
  });
});
