/**
 * @overview lib/renderers/xlsx
 *
 * @description
 * This library is just a shim to ensure API uniformity with other renderers.
 * it renders an Excel report(from data.rows that we pass as render function param).
 * Having the same data structure will help to have less xlsx renderers
 * @module lib/renderers/xlsx
 *
 * @requires excel4node
 * @requires lodash
 */
const xl = require('excel4node');
const _ = require('lodash');

const headers = {
  'Content-Type' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

exports.render = render;
exports.find = find;
exports.extension = '.xlsx';
exports.headers = headers;

/**
 * XLSX Render Method
 * @param {Object} data   { rows : []}
 */

function render(data, template, options) {
  // Create a new instance of a Workbook class
  const wb = new xl.Workbook();

  // style applied to cells
  const headerStyle = wb.createStyle({
    font : {
      color : '#ffffff',
      size : 12,
      bold : true,
    },
    fill : {
      type : 'pattern',
      patternType : 'solid',
      fgColor : '2384F5',
    },
  });

  const normaFontSize = {
    font : {
      size : 10,
    },
  };
  const borderInfo = {
    style : 'thin',
    color : '#000000',
  };

  const styleAllBorders = {
    border : {
      bottom : borderInfo,
      left : borderInfo,
      top : borderInfo,
      right : borderInfo,
    },
  };

  // Add Worksheets to the workbook
  const ws = wb.addWorksheet('Sheet 1');
  const rows = find(data, options); // get all rows to set in the sheet
  const firstObject = rows[0] || {};

  // writing columns
  const firstLineCols = Object.keys(firstObject);
  let line = 1;
  firstLineCols.forEach((key, index) => {
    ws.cell(line, index + 1)
      .string(key)
      .style(headerStyle)
      .style(styleAllBorders);
  });
  line++;

  // writing rows
  rows.forEach((row) => {
    firstLineCols.forEach((key, index) => {
      setValue(ws, line, index + 1, row[key] || '')
        .style(styleAllBorders)
        .style(normaFontSize);
    });
    line++;
  });
  return wb.writeToBuffer();
}


/*
 find available data to write in the excel file
 rows is the default key, if nothing found, this function get look at rowsDataKey
 it return an empty array if no data found
*/
function find(data, _options) {
  let IGNORED_COLUMNS = [
    'uuid', 'invoice_uuid', 'entity_uuid',
    'reference_uuid', 'record_uuid', 'debtor_uuid',
  ];
  const options = _options || {};
  const result = data.rows || data[options.rowsDataKey] || [];
  // check if it's important to remove some unseful columns for the user
  if (options.ignoredColumns) {
    IGNORED_COLUMNS = IGNORED_COLUMNS.concat(options.ignoredColumns);
  }
  result.forEach(row => {
    IGNORED_COLUMNS.forEach(col => {
      delete row[col];
    });
  });
  return result;
}
// set value to a paticular cell
function setValue(ws, x, y, value) {
  if (_.isNumber(value)) {
    return ws.cell(x, y).number(value);
  }

  if (_.isDate(value)) {
    return ws.cell(x, y).date(value).style({
      numberFormat : 'yyyy-mm-dd hh:mm:ss',
    });
  }
  return ws.cell(x, y).string(value || '');
}
