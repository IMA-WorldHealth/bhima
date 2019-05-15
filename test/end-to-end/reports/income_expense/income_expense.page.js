const FU = require('../../shared/FormUtils');
const ReportPage = require('../page');
const components = require('../../shared/components');

class IncomeExpenseReportPage {
  constructor(key) {
    this.page = new ReportPage(key);
  }

  // preview an income expense report
  // eslint-disable-next-line
  async showIncomeExpenseReportPreview(fiscal_id, periodFrom_id, periodTo_id, type) {
    await components.fiscalPeriodSelect.set(fiscal_id, periodFrom_id, periodTo_id);

    await FU.select('ReportConfigCtrl.reportDetails.type', type);
    await this.page.preview();
  }

  // save an income expense report
  // eslint-disable-next-line
  async saveIncomeExpenseReport(fiscal_id, periodFrom_id, periodTo_id, type, reportName, reportFormat) {
    await this.showIncomeExpenseReportPreview(fiscal_id, periodFrom_id, periodTo_id, type);

    // save report as PDF
    await this.page.saveAs();
    await FU.input('SaveCtrl.documentOptions.label', reportName);
    await FU.select('SaveCtrl.documentOptions.renderer', reportFormat);
    await FU.modal.submit();

    // successfully saved notification
    await components.notification.hasSuccess();
    await this.page.backToConfig();
  }

  // print an income expense report
  // eslint-disable-next-line
  async printIncomeExpenseReport(fiscal_id, periodFrom_id, periodTo_id, type) {
    await this.showIncomeExpenseReportPreview(fiscal_id, periodFrom_id, periodTo_id, type);
    await this.page.printPreview();
  }

  // check saved report
  async checkSavedIncomeExpenseReport(reportName) {
    await this.page.gotoArchive();
    await this.page.lastReportMatching(reportName);
    await this.page.backToConfig();
  }

  // close preview
  async closeIncomeExpenseReportPreview() {
    await this.page.closePreview();
  }
}

module.exports = IncomeExpenseReportPage;
