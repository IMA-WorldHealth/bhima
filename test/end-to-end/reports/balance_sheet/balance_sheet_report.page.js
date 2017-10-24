/* global browser, element, by */

const chai = require('chai');
const helpers = require('../../shared/helpers');

helpers.configure(chai);

const FU = require('../../shared/FormUtils');
const ReportPage = require('../page');
const components = require('../../shared/components');

class BalanceSheetReportPage {
  constructor(key) {
    this.page = new ReportPage(key);
  }

  // preview an balance sheet report
  showBalanceSheetReportPreview(date, showExploitation) {
    components.dateEditor.set(date);
    if (showExploitation) {
      element(by.model('ReportConfigCtrl.reportDetails.showExploitation')).click();
    }
    this.page.preview();
  }

  // save an balanceSheet report
  saveBalanceSheetReport(date, showExploitation, reportName, reportFormat) {
    this.showBalanceSheetReportPreview(date, showExploitation);

    // save report as PDF
    this.page.saveAs();
    FU.input('SaveCtrl.documentOptions.label', reportName);
    FU.select('SaveCtrl.documentOptions.renderer', reportFormat);
    FU.modal.submit();

    // successfully saved notification
    components.notification.hasSuccess();
    this.page.backToConfig();
  }

  // print an balanceSheet report
  printBalanceSheetReport(date, showExploitation) {
    this.showBalanceSheetReportPreview(date, showExploitation);
    this.page.printPreview();
  }

  // check saved report
  checkSavedBalanceSheetReport(reportName) {
    this.page.gotoArchive();
    this.page.lastReportMatching(reportName);
    this.page.backToConfig();
  }

  // close preview
  closeBalanceSheetReportPreview() {
    this.page.closePreview();
  }
}

module.exports = BalanceSheetReportPage;
