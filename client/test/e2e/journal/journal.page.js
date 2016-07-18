/* global element, by, browser, protractor */

const chai = require('chai');
const expect = chai.expect;

const helpers = require('../shared/helpers');
helpers.configure(chai);

const FU = require('../shared/FormUtils');

function JournalCorePage() {
  const page = this;

  const grid = element(by.id('journal-grid'));
  const gridRows = grid.element( by.css('.ui-grid-render-container-body')).all( by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index') );
  const gridColumns = grid.element( by.css('.ui-grid-render-container-body')).element( by.css('.ui-grid-header') ).all( by.repeater('col in colContainer.renderedColumns track by col.uid') );

  function openGridConfigurationModal() {
    return $('[data-method="configure"]').click();
  }

  // assert that the journal's column count is the number passed in
  function expectColumnCount(number) {
    expect(gridColumns.count()).to.eventually.equal(number);
  }

  // assert that the row count is the number provided
  function expectRowCount(number) {
    expect(gridRows.count()).to.eventually.equal(number);
  }

  // takes in an array of column texts and asserts they are the column headers
  // @todo - migrate this to GridUtils
  function expectHeaderColumns(expectedColumns) {
    const headerColumns = grid
      .element(by.css('.ui-grid-render-container-body'))
      .element(by.css('.ui-grid-header'))
      .all(by.repeater('col in colContainer.renderedColumns track by col.uid'))
      .all(by.css('.ui-grid-header-cell-label'));

    expect(headerColumns.count()).to.eventually.equal(expectedColumns.length);

    headerColumns.getText().then(columnTexts => {
      columnTexts = columnTexts.map(function trimText (text) {
        return text.replace(/^\s+/, '').replace(/\s+$/, '');
      });

      expect(columnTexts).to.deep.equal(expectedColumns);
    });
  }

  // polyfill for array.includes on lower node versions
  const includes = (array, value) => array.indexOf(value) > -1;

  // toggle the column checkboxes to the following values
  // NOTE - these values come from the database column names, not the i18n text
  // names
  function setColumnCheckboxes(array) {
    const inputs = $('.modal-body').all(by.css('input[type="checkbox"]'));

    // deselect inputs that are selected and shouldn't be
    const deselects = inputs
      .filter(element => element.isSelected())
      .filter(element => {
        return element.getAttribute('data-column')
          .then(field => !includes(array, field));
      })
      .map(element => element.click());

    // select inputs that are not selected and should be
    const selects = inputs
      .filter(element => element.isSelected().then(bool => !bool))
      .filter(element => {
        return element.getAttribute('data-column')
          .then(field => includes(array, field));
      })
      .map(element => element.click());
  }

  // reset the default column selection
  function setDefaultColumnCheckboxes() {
    FU.buttons.reset();
  }

  // expose methods
  page.openGridConfigurationModal = openGridConfigurationModal;

  page.expectColumnCount = expectColumnCount;
  page.expectRowCount = expectRowCount;
  page.expectHeaderColumns = expectHeaderColumns;

  page.setColumnCheckboxes = setColumnCheckboxes;
  page.setDefaultColumnCheckboxes = setDefaultColumnCheckboxes;
}

module.exports = JournalCorePage;
