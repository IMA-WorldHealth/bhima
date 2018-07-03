const helpers = require('../../shared/helpers');
const EmployeeStandingPage = require('./employee_standing.page');

describe('Employee Standing Report', () => {
  let Page;
  const key = 'employeeStanding';

  const dataset = {
    employee_name : 'Test 2 Patient',
    report_name : 'Employee Standing Report Saved by E2E',
    renderer : 'PDF',
  };

  before(() => {
    helpers.navigate(`#!/reports/${key}`);
    Page = new EmployeeStandingPage(key);
  });

  it('preview a new Employee Standing Report', () => {
    Page.showEmployeeReportPreview(dataset.employee_name);
  });

  it('close the previewed report', () => {
    Page.closeEmployeeStandingReportPreview();
  });

  it('save a previewed report', () => {
    Page.saveEmployeeStandingReport(dataset);
  });

  it('report has been saved into archive', () => {
    Page.checkSavedEmployeeStandingReport(dataset.report_name);
  });

  it('print the previewed report', () => {
    Page.printEmployeeStandingReport(dataset);
  });
});
