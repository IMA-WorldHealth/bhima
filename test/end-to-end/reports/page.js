const { expect } = require('@playwright/test');
const TU = require('../shared/TestUtils');
const { by } = require('../shared/TestUtils');
const GU = require('../shared/GridUtils');

const gridId = 'report-grid';

class ReportPage {

  constructor(key) {
    this.url = `/reports/${key}`;
    this.previewAnchor = '[data-id="report-preview"]';
    this.cronEmailReportAnchor = '[data-element="cron-email-report"]';
    this.configAnchor = '[data-method="report-config"]';
    this.archiveAnchor = '[data-method="archive"]';
  }

  // preview
  async preview() {
    const button = await TU.locator('[data-method="submit"]').locator(by.containsText('Preview'));
    return button.click();
  }

  // close the preview
  async closePreview() {
    const anchor = await TU.locator(this.previewAnchor);
    await anchor.locator('[data-method="close"]').click();

    // Verify the preview closed
    const preview = await TU.locator('.panel-heading').locator(by.containsText('Document Preview'));
    expect(await preview.count()).toBe(0);
    return true;
  }

  // print the preview
  async printPreview() {
    const anchor = await TU.locator(this.previewAnchor);
    return anchor.locator('[data-method="print"]');
  }

  // saveAs
  async saveAs() {
    const anchor = await TU.locator(this.previewAnchor);
    return anchor.locator('[data-method="save"]').click();
  }

  // save for auto mailing
  async saveAutoMailing() {
    const anchor = await TU.locator(this.cronEmailReportAnchor);
    return anchor.locator('[data-method="submit"]').click();
  }

  // config report
  async backToConfig() {
    return TU.locator(this.configAnchor).click();
  }

  // goto archive
  async gotoArchive() {
    return TU.locator(this.archiveAnchor).click();
  }

  // lastReportMatching
  async lastReportMatching(name) {
    return GU.expectCellValueMatch(gridId, 0, 1, name);
  }
}

module.exports = ReportPage;
