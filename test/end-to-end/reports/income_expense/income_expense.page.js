/* global browser, element, by */

const chai = require('chai');
const helpers = require('../../shared/helpers');

helpers.configure(chai);

const FU = require('../../shared/FormUtils');
const ReportPage = require('../page');
const components = require('../../shared/components');

class IncomeExpenseReportPage {
  constructor(key) {
    this.page = new ReportPage(key);
  }

  // preview an income expense report
  showIncomeExpenseReportPreview(fiscal_id, periodFrom_id, periodTo_id, type) {
    components.fiscalPeriodSelect.set(fiscal_id, periodFrom_id, periodTo_id);

    FU.select('ReportConfigCtrl.reportDetails.type', type);
    this.page.preview();
  }

  // save an income expense report
  saveIncomeExpenseReport(fiscal_id, periodFrom_id, periodTo_id, type, reportName, reportFormat) {
    this.showIncomeExpenseReportPreview(fiscal_id, periodFrom_id, periodTo_id, type);

    // save report as PDF
    this.page.saveAs();
    FU.input('SaveCtrl.documentOptions.label', reportName);
    FU.select('SaveCtrl.documentOptions.renderer', reportFormat);
    FU.modal.submit();

    // successfully saved notification
    components.notification.hasSuccess();
    this.page.backToConfig();
  }

  // print an income expense report
  printIncomeExpenseReport(fiscal_id, periodFrom_id, periodTo_id, type) {
    this.showIncomeExpenseReportPreview(fiscal_id, periodFrom_id, periodTo_id, type);
    this.page.printPreview();
  }

  // check saved report
  checkSavedIncomeExpenseReport(reportName) {
    this.page.gotoArchive();
    this.page.lastReportMatching(reportName);
    this.page.backToConfig();
  }

  // close preview
  closeIncomeExpenseReportPreview() {
    this.page.closePreview();
  }
}

module.exports = IncomeExpenseReportPage;
