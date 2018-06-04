/* global element, by */

const FU = require('../../shared/FormUtils');
const ReportPage = require('../page');
const components = require('../../shared/components');

class PatientStandingReportPage {
  constructor(key) {
    this.page = new ReportPage(key);
  }

  // preview a PatientStanding report
  showPatientReportPreview(patientName) {
    components.findPatient.findByName(patientName);

    this.page.preview();
  }

  // save a PatientStanding report
  savePatientStandingReport(dataSet) {
    this.showPatientReportPreview(dataSet.patient_name);

    // save report as PDF
    this.page.saveAs();
    FU.input('SaveCtrl.documentOptions.label', dataSet.report_name);
    FU.select('SaveCtrl.documentOptions.renderer', dataSet.renderer);
    FU.modal.submit();

    // successfully saved notification
    components.notification.hasSuccess();
    this.page.backToConfig();
  }

  // print a Patient report
  printPatientStandingReport(dataSet) {
    this.showPatientReportPreview(dataSet.patient_name);
    this.page.printPreview();
  }

  // check saved report
  checkSavedPatientStandingReport(reportName) {
    this.page.gotoArchive();
    this.page.lastReportMatching(reportName);
    this.page.backToConfig();
  }

  // close preview
  closePatientStandingReportPreview() {
    this.page.closePreview();
  }
}

module.exports = PatientStandingReportPage;
