/* global element, by, browser */
const chai = require('chai');
const helpers = require('./helpers');

const expect = chai.expect;
helpers.configure(chai);

function getGrid(gridId) {
  return element(by.id(gridId));
}

function getColumns(gridId) {
  return getGrid(gridId)
    .element(by.css('.ui-grid-render-container-body'))
    .element(by.css('.ui-grid-header'))
    .all(by.repeater('col in colContainer.renderedColumns track by col.uid'));
}

function getRows(gridId) {
  return getGrid(gridId)
    .element(by.css('.ui-grid-render-container-body'))
    .all(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'));
}

function getCell(gridId, row, col) {
  return getGrid(gridId)
    .element(by.css('.ui-grid-render-container-body'))
    .element(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index').row(row))
    .element(by.repeater('(colRenderIndex, col) in colContainer.renderedColumns track by col.uid').row(col));
}

function getCellName(gridId, row, col) {
  return getGrid(gridId)
    .element(by.css('.ui-grid-render-container-body'))
    .element(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index').row(row))
    .element(by.repeater('(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name').row(col));
}

function expectRowCount(gridId, number, message) {
  const rows = getRows(gridId);
  expect(rows.count(), message).to.eventually.equal(number);
}

function expectRowCountAbove(gridId, number) {
  const rows = getRows(gridId);
  expect(rows.count()).to.eventually.be.above(number);
}

// assert that the journal's column count is the number passed in
function expectColumnCount(gridId, number) {
  const columns = getColumns(gridId);
  expect(columns.count()).to.eventually.equal(number);
}

/**
 * Helper function for returning a row.
 *
 * @param gridId {string}
 * @param rowNum {integer}
 *
 * @returns {ElementFinder|*}
 *
 * @example
 * <pre>
 *   const row = gridUtils.getRow( 'myGrid', 0); //or internally
 *   const row = this.getRow( gridId, rowNum );
 * </pre>
 */
function getRow(gridId, rowNum) {
  return getGrid(gridId)
    .element(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index').row(rowNum));
}

// takes in an array of column texts and asserts they are the column headers
// @todo - migrate this to GridUtils
function expectHeaderColumns(gridId, expectedColumns) {
  const columns = getColumns(gridId);
  const headerColumns = columns
    .all(by.css('.ui-grid-header-cell-label'));

  expect(
    headerColumns.count()
  ).to.eventually.equal(expectedColumns.length);

  headerColumns.getText().then(columnTexts => {
    columnTexts = columnTexts.map(function trimText(text) {
      return text.replace(/^\s+/, '').replace(/\s+$/, '');
    });

    expect(columnTexts).to.deep.equal(expectedColumns);
  });
}

/**
 * Helper function to select a row.
 *
 * @param gridId {string}
 * @param rowNum {integer}
 *
 *
 * @example
 * <pre>
 *   const row = gridUtils.selectRow( 'myGrid', 0 );
 * </pre>
 */
function selectRow(gridId, rowNum) {
  // NOTE: Can't do .click() as it doesn't work when webdriving Firefox
  const row = getRow(gridId, rowNum);
  const btn = row.element(by.css('.ui-grid-selection-row-header-buttons'));
  return browser.actions().mouseMove(btn).mouseDown(btn).mouseUp()
    .perform();
}

exports.getGrid = getGrid;
exports.getRows = getRows;
exports.getRow = getRow;
exports.getColumns = getColumns;
exports.getCell = getCell;
exports.getCellName = getCellName;
exports.expectRowCount = expectRowCount;
exports.expectRowCountAbove = expectRowCountAbove;
exports.expectColumnCount = expectColumnCount;
exports.expectHeaderColumns = expectHeaderColumns;
exports.selectRow = selectRow;
