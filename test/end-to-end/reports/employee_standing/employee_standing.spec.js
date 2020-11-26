const helpers = require('../../shared/helpers');
const EmployeeStandingPage = require('./employee_standing.page');

describe('Employee Standing Report', () => {
  let page;
  const key = 'employee_standing';

  const dataset = {
    employee_name : 'Test 2 Patient',
    report_name : 'Employee Standing Report Saved by E2E',
    renderer : 'PDF',
  };

  before(async () => {
    await helpers.navigate(`#!/reports/${key}`);
    page = new EmployeeStandingPage(key);
  });

  it('preview a new Employee Standing Report', async () => {
    await page.showEmployeeReportPreview(dataset.employee_name);
  });

  it('close the previewed report', async () => {
    await page.closeEmployeeStandingReportPreview();
  });

  it('save a previewed report', async () => {
    await page.saveEmployeeStandingReport(dataset);
  });

  it('report has been saved into archive', async () => {
    await page.checkSavedEmployeeStandingReport(dataset.report_name);
  });

  it('print the previewed report', async () => {
    await page.printEmployeeStandingReport(dataset);
  });
});
