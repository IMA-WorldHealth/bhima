/* global browser, protractor, element, by */

const chai = require('chai');
const expect = chai.expect;
const helpers = require('../shared/helpers');
helpers.configure(chai);

const _ = require('lodash');
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

  // "form" is a JSON description of the ngModel mapped to a value
  // @todo - this could be way more generic
  // create(form) {

  //   // click the create button.
  //   $('[data-method="create"]').click();

  //   const modal = $('[uib-modal-window="modal-window"]');

  //   // look through the form JSON description, setting
  //   // ng-model keys to input values
  //   _.forEach(form, (value, key) => {
  //     FU.input(key, value, modal);
  //   });

  //   // click the generate button
  //   FU.modal.submit();
  // }

  // deletes an account from the grid
  // delete(row) {
  //   let cell = GU.getCell(gridId, row, 5);

  //   // open the dropdown menu
  //   cell.$('[uib-dropdown-toggle]').click();

  //   // click the "delete" link
  //   $('[data-action="delete"]').click();
  // }

  // asserts that there are no items in the grid
  // expectPageToBeEmpty() {
  //   expect(GU.getRows(gridId).count()).to.eventually.equal(0);
  // }
}

module.exports = ReportPage;
