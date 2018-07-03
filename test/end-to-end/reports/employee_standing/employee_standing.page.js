/* global element, by */

const FU = require('../../shared/FormUtils');
const ReportPage = require('../page');
const components = require('../../shared/components');

class EmployeeStandingReportPage {
  constructor(key) {
    this.page = new ReportPage(key);
  }

  // preview a EmployeeStanding report
  showEmployeeReportPreview(employeeName) {
    components.employeeSelect.set(employeeName);

    this.page.preview();
  }

  // save a EmployeeStanding report
  saveEmployeeStandingReport(dataSet) {
    this.showEmployeeReportPreview(dataSet.employee_name);

    // save report as PDF
    this.page.saveAs();
    FU.input('SaveCtrl.documentOptions.label', dataSet.report_name);
    FU.select('SaveCtrl.documentOptions.renderer', dataSet.renderer);
    FU.modal.submit();

    // successfully saved notification
    components.notification.hasSuccess();
    this.page.backToConfig();
  }

  // print a Employee report
  printEmployeeStandingReport(dataSet) {
    this.showEmployeeReportPreview(dataSet.employee_name);
    this.page.printPreview();
  }

  // check saved report
  checkSavedEmployeeStandingReport(reportName) {
    this.page.gotoArchive();
    this.page.lastReportMatching(reportName);
    this.page.backToConfig();
  }

  // close preview
  closeEmployeeStandingReportPreview() {
    this.page.closePreview();
  }
}

module.exports = EmployeeStandingReportPage;
