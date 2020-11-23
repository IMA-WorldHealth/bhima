const helpers = require('../../shared/helpers');
const PatientStandingPage = require('./patient_standing.page');

describe('Patient Standing Report', () => {
  const key = 'patient_standing';

  const dataset = {
    patient_name : 'Test 2 Patient',
    report_name : 'Patient Standing Report Saved by E2E',
    renderer : 'PDF',
  };

  before(async () => {
    await helpers.navigate(`#!/reports/${key}`);
  });

  const page = new PatientStandingPage(key);

  it('save a previewed report', async () => {
    await page.savePatientStandingReport(dataset);
  });

  it('report has been saved into archive', async () => {
    await page.checkSavedPatientStandingReport(dataset.report_name);
  });

  it('print the previewed report', async () => {
    await page.printPatientStandingReport(dataset);
  });

  it('close the previewed report', async () => {
    await page.closePatientStandingReportPreview();
  });
});
