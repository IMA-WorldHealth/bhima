const TU = require('../../shared/TestUtils');
const components = require('../../shared/components');

const ReportPage = require('../page');

class PatientStandingReportPage {
  constructor(key) {
    this.page = new ReportPage(key);
  }

  // preview a PatientStanding report
  async showPatientStandingReportPreview(patientName) {
    await components.findPatient.findByName(patientName);
    await this.page.preview();
    return true;
  }

  // save a PatientStanding report
  async savePatientStandingReport(dataSet) {
    await this.showPatientStandingReportPreview(dataSet.patient_name);

    // save report as PDF
    await this.page.saveAs();
    await TU.input('SaveCtrl.documentOptions.label', dataSet.report_name);
    await TU.select('SaveCtrl.documentOptions.renderer', dataSet.renderer);
    await TU.modal.submit();

    await components.notification.hasSuccess();

    return this.page.backToConfig();
  }

  // print a Patient report
  async printPatientStandingReport(dataSet) {
    await this.showPatientStandingReportPreview(dataSet.patient_name);
    return this.page.printPreview();
  }

  // check saved report
  async checkSavedPatientStandingReport(reportName) {
    await this.page.gotoArchive();
    await TU.waitForSelector('.ui-grid-canvas .ui-grid-row');
    await this.page.lastReportMatching(reportName);
    return this.page.backToConfig();
  }

  // close preview
  async closePatientStandingReportPreview() {
    return this.page.closePreview();
  }
}

module.exports = PatientStandingReportPage;
