const FU = require('../../shared/FormUtils');
const ReportPage = require('../page');
const components = require('../../shared/components');

class BalanceReportPage {
  constructor(key) {
    this.page = new ReportPage(key);
  }

  // preview an account report
  async showBalanceReportPreview(year, month) {
    await components.fiscalYearSelect.set(year);
    await components.periodSelection.set(month);
    await components.yesNoRadios.set('yes', 'useSeparateDebitsAndCredits');
    await components.yesNoRadios.set('no', 'includeClosingBalances');
    await components.yesNoRadios.set('yes', 'shouldPruneEmptyRows');
    await components.yesNoRadios.set('yes', 'shouldHideTitleAccounts');
    await this.page.preview();
  }

  // save an account report
  async saveBalanceReport(year, month, reportName, reportFormat) {
    await this.showBalanceReportPreview(year, month);

    // save report as PDF
    await this.page.saveAs();
    await FU.input('SaveCtrl.documentOptions.label', reportName);
    await FU.select('SaveCtrl.documentOptions.renderer', reportFormat);
    await FU.modal.submit();

    // successfully saved notification
    await components.notification.hasSuccess();
    await this.page.backToConfig();
  }

  // print an account report
  async printBalanceReport(year, month) {
    await this.showBalanceReportPreview(year, month);
    await this.page.printPreview();
  }

  // check saved report
  async checkSavedBalanceReport(reportName) {
    await this.page.gotoArchive();
    await this.page.lastReportMatching(reportName);
    await this.page.backToConfig();
  }

  // close preview
  async closeBalanceReportPreview() {
    await this.page.closePreview();
  }

  async fillReportOptions(year, month) {
    await components.fiscalYearSelect.set(year);
    await components.periodSelection.set(month);
    await components.yesNoRadios.set('yes', 'useSeparateDebitsAndCredits');
    await components.yesNoRadios.set('no', 'includeClosingBalances');
    await components.yesNoRadios.set('yes', 'shouldPruneEmptyRows');
    await components.yesNoRadios.set('yes', 'shouldHideTitleAccounts');
  }

  // save for the auto emailing
  async saveCronEmailReport(title, entityGroupName, cronFrequencyName) {
    await components.inpuText.set('label', title);
    await components.entityGroupSelect.set(entityGroupName);
    await components.cronSelect.set(cronFrequencyName);
    await this.page.saveAutoMailing();
  }
}

module.exports = BalanceReportPage;
