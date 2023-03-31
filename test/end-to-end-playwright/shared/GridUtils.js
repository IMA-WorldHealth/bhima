const { expect } = require('@playwright/test');
const TU = require('./TestUtils');

/**
 * Get the element with gridId
 *
 * @param {string} gridId - the html ID for the desired element
 * @returns {Promise} of the locator for element with gridId
 */
async function getGrid(gridId) {
  return TU.locator(`#${gridId}`);

  // ADAPTED FROM PROTRACTOR CODE:
  // return element(by.id(gridId));
}

/**
 * Get an array of the column header cells
 *
 * @param {string} gridId - the id of the grid
 * @returns {Array} an array of locators for all the column header cells in the grid
 */
async function getColumnHeaders(gridId) {
  const grid = await getGrid(gridId);
  const repeater = '[ng-repeat="col in colContainer.renderedColumns track by col.uid"]';
  const header = await grid.locator(`.ui-grid-render-container-body .ui-grid-header ${repeater}`);
  return header.all();

  // ADAPTED FROM PROTRACTOR CODE:
  // return getGrid(gridId)
  //   .element(by.css('.ui-grid-render-container-body'))
  //   .element(by.css('.ui-grid-header'))
  //   .all(by.repeater('col in colContainer.renderedColumns track by col.uid'));
}

/**
 * Return an array of locators for the all the rows in the grid
 *
 * @param {string} gridId - the id of the grid
 * @returns {Array} - the array of locators for the rows
 */
async function getRows(gridId) {
  const grid = await getGrid(gridId);
  const repeater = '[ng-repeat="(rowRenderIndex, row) in rowContainer.renderedRows track by $index"]';
  const rows = await grid.locator(`.ui-grid-render-container-body ${repeater}`);
  return rows.all();

  // ADAPTED FROM PROTRACTOR CODE:
  // return getGrid(gridId)
  //   .element(by.css('.ui-grid-render-container-body'))
  //   .all(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'));
}

/**
 * Helper function for returning a row.
 *
 * @param {string} gridId - Id of the grid
 * @param {number} rowNum - row number
 * @returns {Promise} - promise of for the desired row
 * @example
 * <pre>
 *   const row = await gridUtils.getRow( 'myGrid', 0); //or internally
 * </pre>
 */
async function getRow(gridId, rowNum) {
  const rows = await getRows(gridId);
  return rows[rowNum];

  // ADAPTED FROM PROTRACTOR CODE:
  // return getGrid(gridId)
  //   .element(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index').row(rowNum));
}

/**
 * Get a locator for a specific cell in a grid
 *
 * @param {string} gridId - the grid id
 * @param {number} rowNum - the row (starts with 0)
 * @param {number} colNum - the row (starts with 0)
 * @returns {object} the locator for the cell
 */
async function getCell(gridId, rowNum, colNum) {
  const rows = await getRows(gridId);
  const row = rows[rowNum];
  const repeater = '[ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.uid"]';
  const cols = await row.locator(repeater);
  return cols.nth(colNum);

  // ADAPTED FROM PROTRACTOR CODE:
  // return getGrid(gridId)
  //   .element(by.css('.ui-grid-render-container-body'))
  //   .element(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index').row(row))
  //   .element(by.repeater('(colRenderIndex, col) in colContainer.renderedColumns track by col.uid').row(col));
}

async function getCellName(gridId, rowNum, colNum) {
  throw Error('GridUtils getCellName is not implemented');

  // ADAPTED FROM PROTRACTOR CODE:
  // return getGrid(gridId)
  //   .element(by.css('.ui-grid-render-container-body'))
  //   .element(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index').row(row))
  //   .element(by.repeater('(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name').row(col));
}

/**
 * Check to make sure that the grid has the specified number of rows
 *
 * @param {string} gridId - the id of the grid
 * @param {number} number - expected number of rows
 * @param {string} message - error message
 */
async function expectRowCount(gridId, number, message) {
  const rows = await getRows(gridId);
  expect(rows.length, message).toBe(number);

  // ADAPTED FROM PROTRACTOR CODE:
  // const rows = getRows(gridId);
  // expect(await rows.count(), message).to.equal(number);
}

/**
 * Make sure the number of columns is greater than a specified number
 *
 * @param {string} gridId - the id of the grid
 * @param {number} number - expect the number of columns to be greater than this
 */
async function expectRowCountAbove(gridId, number) {
  const rows = await getRows(gridId);
  expect(rows.length).toBeGreaterThan(number);

  // ADAPTED FROM PROTRACTOR CODE:
  // const rows = getRows(gridId);
  // expect(await rows.count()).to.be.above(number);
}

/**
 * assert that the grids's column count is the number passed in
 *
 * @param {string} gridId - Id of the grid
 * @param {number} number - expected number of columns
 * @param {string} message - error message
 */
async function expectColumnCount(gridId, number, message) {
  const cols = await getColumnHeaders(gridId);
  expect(cols.length, message).toBe(number);

  // ADAPTED FROM PROTRACTOR CODE:
  // const columns = getColumns(gridId);
  // expect(await columns.count()).to.equal(number);
}

// Provide a text in a cell and this will give the grid indexes for where to find that text
async function getGridIndexesMatchingText(gridId, text) {
  throw Error('GridUtils getGridIndexesMatchingText is not implemented');

  // let rowIdx;
  // let colIdx;

  // console.warn('Warning: You called GU.getGridIndexesMatchingText() which is extremely inefficient.');

  // // loop through every single cell and check that the grid's value contains this provided value
  // return this.getGrid(gridId)
  //   .element(by.css('.ui-grid-render-container-body'))
  //   .all(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'))
  //   .each((row, rowIndex) => row.all(by.repeater('(colRenderIndex, col) in colContainer.renderedColumns track by col.uid'))
  //     .each((column, columnIndex) => column.getText()
  //       .then(elementText => {
  //         if (elementText.includes(text)) {
  //           rowIdx = rowIndex;
  //           colIdx = columnIndex;
  //         }
  //       })))
  //   .then(() => ({ rowIndex : rowIdx, columnIndex : colIdx }));
}


// takes in an array of column texts and asserts they are the column headers
// @todo - migrate this to GridUtils
async function expectHeaderColumns(gridId, expectedColumns) {
  throw Error('GridUtils expectColumnCount is not implemented');
  // const columns = getColumns(gridId);
  // const headerColumns = columns
  //   .all(by.css('.ui-grid-header-cell-label'));

  // expect(
  //   await headerColumns.count()
  // ).to.equal(expectedColumns.length);

  // const colTexts = await headerColumns.getText();

  // const columnTexts = Promise.all(colTexts.map((text) => {
  //   return text.replace(/^\s+/, '').replace(/\s+$/, '');
  // }));

  // expect(await columnTexts).to.deep.equal(expectedColumns);
}

/**
 * Helper function to select a row.
 *
 * @param {string} gridId - the id of the grid
 * @param {number} rowNum - number of the desired row
 * @returns {Promise} promise of the result of clicking on the row to select it
 * @example
 * <pre>
 *   const row = await gridUtils.selectRow( 'myGrid', 0 );
 * </pre>
 */
async function selectRow(gridId, rowNum) {

  const grid = await getGrid(gridId);
  const ports = await grid.locator('[ui-grid-viewport]');
  const selPort = await ports.nth(0);
  const selBtns = await selPort.locator('.ui-grid-selection-row-header-buttons');
  const selBtn = selBtns.nth(rowNum);
  return selBtn.click();

  // ADAPTED FROM PROTRACTOR CODE:
  // const row = getRow(gridId, rowNum);
  // const btn = row.element(by.css('.ui-grid-selection-row-header-buttons'));
  // return btn.click();
}

/**
 * Selects all rows in the grid.
 *
 * @param {string} gridId - the id of the grid that you want to select
 * @return {Promise} for the selecting click
 */
function selectAll(gridId) {
  throw Error('GridUtils expectColumnCount is not implemented');

  // ADAPTED FROM PROTRACTOR CODE:
  // const row = getGrid(gridId).$('ui-grid-header');
  // const btn = row.$('.ui-grid-selection-row-header-buttons');
  // return btn.click();
}

/**
 * Checks that a cell matches the specified value,
 * takes a regEx or a simple string.
 *
 * @param {string} gridId - the id of the grid that you want to inspect
 * @param {number} row - the number of the row (within the visible rows)
 * that you want to check the value of
 * @param {number} col - the number of the column (within the visible columns)
 * that you want to check the value of
 * @param {string} value - a regex or string of the value you expect in that cell
 * @example
 * <pre>
 *   gridTestUtils.expectCellValueMatch('myGrid', 0, 2, 'CellValue');
 * </pre>
 */
async function expectCellValueMatch(gridId, row, col, value) {
  const dataCell = await getCell(gridId, row, col);
  expect(await dataCell.innerText()).toBe(value);

  // ADAPTED FROM PROTRACTOR CODE:
  // const dataCell = getCell(gridId, row, col);
  // expect(await dataCell.getText()).to.equal(value);
}

exports.getGrid = getGrid;
exports.getRows = getRows;
exports.getRow = getRow;
exports.getColumnHeaders = getColumnHeaders;
exports.getCell = getCell;
exports.getGridIndexesMatchingText = getGridIndexesMatchingText;
exports.getCellName = getCellName;
exports.expectRowCount = expectRowCount;
exports.expectRowCountAbove = expectRowCountAbove;
exports.expectColumnCount = expectColumnCount;
exports.expectHeaderColumns = expectHeaderColumns;
exports.selectRow = selectRow;
exports.selectAll = selectAll;
exports.expectCellValueMatch = expectCellValueMatch;
