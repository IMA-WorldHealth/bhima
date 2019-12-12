const helpers = require('../../shared/helpers');
const components = require('../../shared/components');
const ReportPage = require('../page.js');

describe.skip('Chart of Accounts Report Generation', () => {
  let page;
  const key = 'accounts_chart';

  before(async () => {
    await helpers.navigate(`#!/reports/${key}`);
    page = new ReportPage(key);
  });

  it('should be empty on start ', async () => {
    await page.expectPageToBeEmpty();
  });

  it('generates a new Chart of Accounts PDF report', async () => {
    await page.create({
      'ReportConfigCtrl.label' : 'Generated Chart of Accounts',
    });

    await components.notification.hasSuccess();
  });

  it('deletes the old Chart of Accounts PDF report', async () => {
    await page.delete(0);
    await components.notification.hasSuccess();
  });
});
