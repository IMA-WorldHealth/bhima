/* global element, by, browser */
const chai = require('chai');
const helpers = require('./helpers');

const { expect } = chai;
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

// assert that the grids's column count is the number passed in
function expectColumnCount(gridId, number) {
  const columns = getColumns(gridId);
  expect(columns.count()).to.eventually.equal(number);
}

// Provide a text in a cell and this will give the grid indexes for where to find that text
function getGridIndexesMatchingText(gridId, text) {
  let rowIdx;
  let colIdx;

  console.warn('Warning: You called GU.getGridIndexesMatchingText() which is extremely inefficient.');

  // loop through every single cell and check that the grid's value contains this provided value
  return this.getGrid(gridId)
    .element(by.css('.ui-grid-render-container-body'))
    .all(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'))
    .each((row, rowIndex) =>
      row.all(by.repeater('(colRenderIndex, col) in colContainer.renderedColumns track by col.uid'))
        .each((column, columnIndex) =>
          column.getText()
            .then(elementText => {
              if (elementText.includes(text)) {
                rowIdx = rowIndex;
                colIdx = columnIndex;
              }
            })))
    .then(() => ({ rowIndex : rowIdx, columnIndex : colIdx }));
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

  headerColumns.getText().then(colTexts => {
    const columnTexts = colTexts.map(function trimText(text) {
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

/**
  * @name expectCellValueMatch
  * @description Checks that a cell matches the specified value,
  * takes a regEx or a simple string.
  * @param {string} gridId the id of the grid that you want to inspect
  * @param {integer} row the number of the row (within the visible rows)
  * that you want to check the value of
  * @param {integer} col the number of the column (within the visible columns)
  * that you want to check the value of
  * @param {string} value a regex or string of the value you expect in that cell
  *
  * @example
  * <pre>
  *   gridTestUtils.expectCellValueMatch('myGrid', 0, 2, 'CellValue');
  * </pre>
  *
  */
function expectCellValueMatch(gridId, row, col, value) {
  var dataCell = getCell(gridId, row, col);
  expect(dataCell.getText()).to.eventually.equal(value);
}

exports.getGrid = getGrid;
exports.getRows = getRows;
exports.getRow = getRow;
exports.getColumns = getColumns;
exports.getCell = getCell;
exports.getGridIndexesMatchingText = getGridIndexesMatchingText;
exports.getCellName = getCellName;
exports.expectRowCount = expectRowCount;
exports.expectRowCountAbove = expectRowCountAbove;
exports.expectColumnCount = expectColumnCount;
exports.expectHeaderColumns = expectHeaderColumns;
exports.selectRow = selectRow;
exports.expectCellValueMatch = expectCellValueMatch;
