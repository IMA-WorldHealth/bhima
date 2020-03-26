/* global by */

const FU = require('../shared/FormUtils');
const GU = require('../shared/GridUtils');

const gridId = 'report-grid';

/**
 * @deprecated
 * This page object need to be updated according
 * the new standard of reports
 */
class ReportPage {
  constructor(key) {
    this.url = `/reports/${key}`;
    this.previewAnchor = '[data-id="report-preview"]';
    this.cronEmailReportwAnchor = '[data-element="cron-email-report"]';
    this.configAnchor = '[data-method="report-config"]';
    this.archiveAnchor = '[data-method="archive"]';
  }

  // close the preview
  async closePreview() {
    const anchor = $(this.previewAnchor);
    await anchor.element(by.css('[data-method="close"]')).click();
  }

  // print the preview
  async printPreview() {
    const anchor = $(this.previewAnchor);
    await anchor.element(by.css('[data-method="print"]'));
  }

  // saveAs
  async saveAs() {
    const anchor = $(this.previewAnchor);
    await anchor.element(by.css('[data-method="save"]')).click();
  }

  // save for auto mailing
  async saveAutoMailing() {
    const anchor = $(this.cronEmailReportwAnchor);
    await anchor.element(by.css('[data-method="submit"]')).click();
  }

  // config report
  async backToConfig() {
    await $(this.configAnchor).click();
  }

  // goto archive
  async gotoArchive() {
    await $(this.archiveAnchor).click();
  }

  // preview
  async preview() {
    await FU.buttons.submit();
  }

  // lastReportMatching
  async lastReportMatching(name) {
    await GU.expectCellValueMatch(gridId, 0, 1, name);
  }
}

module.exports = ReportPage;
