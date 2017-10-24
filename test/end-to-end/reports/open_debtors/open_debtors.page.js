/* global element, by */
const chai = require('chai');
const helpers = require('../../shared/helpers');

helpers.configure(chai);

const FU = require('../../shared/FormUtils');
const ReportPage = require('../page');
const components = require('../../shared/components');

class OpenDebtorsReportPage {
  constructor(key) {
    this.page = new ReportPage(key);
  }

  // preview a OpenDebtors report
  showOpenDebtorsReportPreview(order) {
    const select = element(by.model('ReportConfigCtrl.reportDetails.order'));
    select.click();
    const option = select.element(by.cssContainingText('.dropdown-menu [role="option"]', order));
    option.click();

    const showUnverifiedTransactions = $('[name="showUnverifiedTransactions"]');
    const showDetailedView = $('[name="showDetailedView"]');

    // enable the checkboxes
    showUnverifiedTransactions.click();
    showDetailedView.click();

    this.page.preview();
  }

  // save a OpenDebtors report
  saveOpenDebtorsReport(order, reportName, reportFormat) {
    this.showOpenDebtorsReportPreview(order);

    // save report as PDF
    this.page.saveAs();
    FU.input('SaveCtrl.documentOptions.label', reportName);
    FU.select('SaveCtrl.documentOptions.renderer', reportFormat);
    FU.modal.submit();

    // successfully saved notification
    components.notification.hasSuccess();
    this.page.backToConfig();
  }

  // print a debtors report
  printOpenDebtorsReport(order) {
    this.showOpenDebtorsReportPreview(order);
    this.page.printPreview();
  }

  // check saved report
  checkSavedOpenDebtorsReport(reportName) {
    this.page.gotoArchive();
    this.page.lastReportMatching(reportName);
    this.page.backToConfig();
  }

  // close preview
  closeOpenDebtorsReportPreview() {
    this.page.closePreview();
  }
}

module.exports = OpenDebtorsReportPage;
