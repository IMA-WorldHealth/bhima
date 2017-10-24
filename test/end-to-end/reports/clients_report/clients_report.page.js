/* global browser, element, by */

const chai = require('chai');
const helpers = require('../../shared/helpers');

helpers.configure(chai);

const FU = require('../../shared/FormUtils');
const ReportPage = require('../page');
const components = require('../../shared/components');

class ClientsReportPage {
  constructor(key) {
    this.page = new ReportPage(key);
  }

  // preview an clients report
  showClientsReportPreview(start_date, end_date, clients) {
    components.dateInterval.range(start_date, end_date);
    if (clients) {
      components.multipleDebtorGroupSelect.set(clients);
    }    
    this.page.preview();
  }

  // save an clients report
  saveClientsReport(start_date, end_date, reportName, reportFormat) {
    this.showClientsReportPreview(start_date, end_date);

    // save report as PDF
    this.page.saveAs();
    FU.input('SaveCtrl.documentOptions.label', reportName);
    FU.select('SaveCtrl.documentOptions.renderer', reportFormat);
    FU.modal.submit();

    // successfully saved notification
    components.notification.hasSuccess();
    this.page.backToConfig();
  }

  // print an clients report
  printClientsReport(start_date, end_date) {
    this.showClientsReportPreview(start_date, end_date);
    this.page.printPreview();
  }

  // check saved report
  checkSavedClientsReport(reportName) {
    this.page.gotoArchive();
    this.page.lastReportMatching(reportName);
    this.page.backToConfig();
  }

  // close preview
  closeClientsReportPreview() {
    this.page.closePreview();
  }
}

module.exports = ClientsReportPage;
