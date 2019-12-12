const helpers = require('../../shared/helpers');
const ReportOpenDebtorsPage = require('./open_debtors.page');

describe('Open Debtors Report', () => {
  let page;
  const key = 'open_debtors';

  const dataset = {
    order : 'Total',
    report_name : 'Open Debtors Report, Order by Debts',
    renderer : 'PDF',
  };

  before(async () => {
    await helpers.navigate(`#!/reports/${key}`);
    page = new ReportOpenDebtorsPage(key);
  });

  it(`preview a new Open Debtors report - order by ${dataset.order}`, async () => {
    await page.showOpenDebtorsReportPreview(dataset.order);
  });

  it('close the previewed report', async () => {
    await page.closeOpenDebtorsReportPreview();
  });

  it('save a previewed report', async () => {
    await page.saveOpenDebtorsReport(dataset.order, dataset.report_name, dataset.renderer);
  });

  it('report has been saved into archive', async () => {
    await page.checkSavedOpenDebtorsReport(dataset.report_name);
  });

  it('print the previewed report', async () => {
    await page.printOpenDebtorsReport(dataset.order);
  });
});
