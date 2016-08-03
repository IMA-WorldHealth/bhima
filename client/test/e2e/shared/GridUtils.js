/* global element, by, browser */

const chai = require('chai');
const expect = chai.expect;

const helpers = require('./helpers');
helpers.configure(chai);

function getGrid(gridId) {
  return element(by.id(gridId));
}

function getColumns(gridId) {
  return getGrid(gridId)
    .element(by.css('.ui-grid-render-container-body'))
    .element( by.css('.ui-grid-header'))
    .all(by.repeater('col in colContainer.renderedColumns track by col.uid'));
}

function getRows(gridId) {
  return getGrid(gridId)
    .element(by.css('.ui-grid-render-container-body'))
    .all(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'));
}

function expectRowCount(gridId, number) {
  var rows = getRows(gridId);
  expect(rows.count()).to.eventually.equal(number);
}

// assert that the journal's column count is the number passed in
function expectColumnCount(gridId, number) {
  var columns = getColumns(gridId);
  expect(columns.count()).to.eventually.equal(number);
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
    columnTexts = columnTexts.map(function trimText (text) {
      return text.replace(/^\s+/, '').replace(/\s+$/, '');
    });

    expect(columnTexts).to.deep.equal(expectedColumns);
  });
}

exports.getRows = getRows;
exports.getColumns = getColumns;
exports.expectRowCount = expectRowCount;
exports.expectColumnCount = expectColumnCount;
exports.expectHeaderColumns = expectHeaderColumns;
