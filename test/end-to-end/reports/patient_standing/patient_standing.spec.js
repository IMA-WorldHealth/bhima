const helpers = require('../../shared/helpers');
const PatientStandingPage = require('./patient_standing.page');

describe('Patient Standing Report', () => {
  let Page;
  const key = 'patientStanding';

  const dataset = {
    patient_name : 'Test 2 Patient',
    report_name : 'Patient Standing Report Saved by E2E',
    renderer : 'PDF',
  };

  before(() => {
    helpers.navigate(`#!/reports/${key}`);    
  });

  Page = new PatientStandingPage(key);

  it('save a previewed report', () => {
    Page.savePatientStandingReport(dataset);
  });

  it('report has been saved into archive', () => {
    Page.checkSavedPatientStandingReport(dataset.report_name);
  });

  it('print the previewed report', () => {
    Page.printPatientStandingReport(dataset);
  });

  it('close the previewed report', () => {
    Page.closePatientStandingReportPreview();
  });


});
