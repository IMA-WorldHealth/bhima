const helpers = require('../../shared/helpers');
const BalanceReportPage = require('./balance_report.page');

describe('Balance Report', () => {
  let Page;
  const key = 'balance_report';

  const dataset = {
    month : 'Juin 2018',
    year : '2018',
    reportName : 'Balance Report Saved by E2E',
    renderer : 'PDF',
  };

  const cron = {
    title : 'Balance report 2018',
    group : 'Developers',
    frequency : 'Chaque mois',
  };

  beforeEach(async () => {
    await helpers.navigate(`#!/reports/${key}`);
    Page = new BalanceReportPage(key);
  });

  it('save report for cron task of emailing', async () => {
    await Page.fillReportOptions(dataset.year, dataset.month);
    await Page.saveCronEmailReport(cron.title, cron.group, cron.frequency);
  });

  it('preview a new balance report', async () => {
    await Page.showBalanceReportPreview(dataset.year, dataset.month);
  });

  it('close the previewed report', async () => {
    await Page.closeBalanceReportPreview();
  });

  it('save a previewed report', async () => {
    await Page.saveBalanceReport(dataset.year, dataset.month, dataset.reportName, dataset.renderer);
  });

  it('report has been saved into archive', async () => {
    await Page.checkSavedBalanceReport(dataset.reportName);
  });

  it('print the previewed report', async () => {
    await Page.printBalanceReport(dataset.year, dataset.month);
  });
});
