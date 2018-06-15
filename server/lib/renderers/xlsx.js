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
exports.extension = '.xlsx';
exports.headers = headers;

/**
 * XLSX Render Method
 * @param {Object} data   { rows : []}
 */

function render(data) {
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
  let { rows } = data;
  rows = rows || [];

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
      setValue(ws, line, index + 1, row[key])
        .style(styleAllBorders)
        .style(normaFontSize);
    });
    line++;
  });
  return wb.writeToBuffer();
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
