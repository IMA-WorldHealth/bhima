const FU = require('../../shared/FormUtils');
const ReportPage = require('../page');
const components = require('../../shared/components');

class PatientStandingReportPage {
  constructor(key) {
    this.page = new ReportPage(key);
  }

  // preview a PatientStanding report
  async showPatientReportPreview(patientName) {
    await components.findPatient.findByName(patientName);
    await this.page.preview();
  }

  // save a PatientStanding report
  async savePatientStandingReport(dataSet) {
    await this.showPatientReportPreview(dataSet.patient_name);

    // save report as PDF
    await this.page.saveAs();
    await FU.input('SaveCtrl.documentOptions.label', dataSet.report_name);
    await FU.select('SaveCtrl.documentOptions.renderer', dataSet.renderer);
    await FU.modal.submit();

    // successfully saved notification
    await components.notification.hasSuccess();
    await this.page.backToConfig();
  }

  // print a Patient report
  async printPatientStandingReport(dataSet) {
    await this.showPatientReportPreview(dataSet.patient_name);
    await this.page.printPreview();
  }

  // check saved report
  async checkSavedPatientStandingReport(reportName) {
    await this.page.gotoArchive();
    await this.page.lastReportMatching(reportName);
    await this.page.backToConfig();
  }

  // close preview
  async closePatientStandingReportPreview() {
    await this.page.closePreview();
  }
}

module.exports = PatientStandingReportPage;
