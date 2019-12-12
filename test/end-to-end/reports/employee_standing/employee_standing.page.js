const FU = require('../../shared/FormUtils');
const ReportPage = require('../page');
const components = require('../../shared/components');

class EmployeeStandingReportPage {
  constructor(key) {
    this.page = new ReportPage(key);
  }

  // preview a EmployeeStanding report
  async showEmployeeReportPreview(employeeName) {
    await components.employeeSelect.set(employeeName);
    await this.page.preview();
  }

  // save a EmployeeStanding report
  async saveEmployeeStandingReport(dataSet) {
    await this.showEmployeeReportPreview(dataSet.employee_name);

    // save report as PDF
    await this.page.saveAs();
    await FU.input('SaveCtrl.documentOptions.label', dataSet.report_name);
    await FU.select('SaveCtrl.documentOptions.renderer', dataSet.renderer);
    await FU.modal.submit();

    // successfully saved notification
    await components.notification.hasSuccess();
    await this.page.backToConfig();
  }

  // print a Employee report
  async printEmployeeStandingReport(dataSet) {
    await this.showEmployeeReportPreview(dataSet.employee_name);
    await this.page.printPreview();
  }

  // check saved report
  async checkSavedEmployeeStandingReport(reportName) {
    await this.page.gotoArchive();
    await this.page.lastReportMatching(reportName);
    await this.page.backToConfig();
  }

  // close preview
  async closeEmployeeStandingReportPreview() {
    await this.page.closePreview();
  }
}

module.exports = EmployeeStandingReportPage;
