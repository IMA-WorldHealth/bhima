/* global browser, protractor, element, by */

const chai = require('chai');
const helpers = require('../shared/helpers');

helpers.configure(chai);

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
    this.configAnchor = '[data-method="report-config"]';
    this.archiveAnchor = '[data-method="archive"]';
  }

  // close the preview
  closePreview() {
    const anchor = $(this.previewAnchor);
    anchor.element(by.css('[data-method="close"]')).click();
  }

  // print the preview
  printPreview() {
    const anchor = $(this.previewAnchor);
    anchor.element(by.css('[data-method="print"]'));
  }

  // saveAs
  saveAs() {
    const anchor = $(this.previewAnchor);
    anchor.element(by.css('[data-method="save"]')).click();
  }

  // config report
  backToConfig() {
    $(this.configAnchor).click();
  }

  // goto archive
  gotoArchive() {
    $(this.archiveAnchor).click();
  }

  // preview
  preview() {
    FU.buttons.submit();
  }

  // lastReportMatching
  lastReportMatching(name) {
    GU.expectCellValueMatch(gridId, 0, 1, name);
  }
}

module.exports = ReportPage;
