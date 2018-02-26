// Require library
const xl = require('excel4node');
const q = require('q');

const translate = require('../../../../lib/helpers/translate');
const math = require('../../../../lib/template/helpers/math');
const numberToText = require('../../../../lib/NumberToText');

module.exports.render = render;

function render(data) {


  // Create a new instance of a Workbook class
  const wb = new xl.Workbook();

  // Add Worksheets to the workbook
  const ws = wb.addWorksheet('Sheet 1');
  // let ws2 = wb.addWorksheet('Sheet 2');


  // Create a reusable style
  // bold,hightlighted

  const style1 = wb.createStyle({
    font : {
      color : '#000000',
      size : 12,
      bold : true,
    },
  });
  // normal style
  const style2 = wb.createStyle({
    font : {
      color : '#000000',
      size : 11,
    },
  });

  const styleMultiLine = {
    alignment : {
      wrapText : true,
    },
  };
  const borderInfo = {
    style : 'thin',
    color : '#000000',
  };

  const styleBorderTop = {
    border : {
      top : borderInfo,
    },
  };
  const styleBorderRight = {
    border : {
      right : borderInfo,
    },
  };
  const styleUndeLine = {
    font : {
      color : '#000000',
      size : 12,
      underline : true,
    },
  };
  const styleAllBorders = {
    border : {
      bottom : borderInfo,
      left : borderInfo,
      top : borderInfo,
      right : borderInfo,
    },
  };
  const styleBorderBottom = {
    border : {
      bottom : borderInfo,
    },
  };

  const styleBorderLeft = {
    border : {
      left : borderInfo,
    },
  };

  // use translate lib fro translating labels
  const t = translate(data.lang);
  const { currencySymbol, currencyName } = data.enterprise;

  // let specify information for each excel cell

  // Header's informations
  // cell merge , cell(1,1) =A1; cell(1,3) = C1
  ws.cell(1, 1, 1, 3, true).string(data.enterprise.name).style(style1);
  ws.cell(2, 1, 2, 3, true).string(t('FORM.LABELS.ADDRESS').concat(': ', data.enterprise.location)).style(style2);
  ws.cell(3, 1, 3, 3, true).string(t('FORM.LABELS.PHONE').concat(': ', data.enterprise.phone)).style(style2);
  ws.cell(4, 1, 4, 3, true).string(t('FORM.LABELS.EMAIL').concat(': ', data.enterprise.email)).style(style2);

  // cell(1,6)=> F1
  ws.cell(1, 6).string(t('FORM.LABELS.INVOICE')).style(style1);
  ws.cell(2, 6).string(data.reference).style(style1);
  ws.cell(3, 6).string(data.dateFormat).style(style2);

  // cell(7, 1) => A7
  ws.cell(7, 1, 7, 3, true).string(t('FORM.LABELS.CLIENT').concat(': ', data.recipient.reference));
  ws.cell(8, 1, 8, 3, true).string(t('FORM.LABELS.NAME').concat(': ', data.recipient.display_name));
  ws.cell(9, 1, 9, 3, true).string(t('FORM.LABELS.GROUP').concat(': ', data.recipient.debtor_group_name));
  ws.cell(10, 1, 10, 3, true).string(t('FORM.LABELS.HOSPITAL_FILE_NR').concat(': ', data.recipient.hospital_no));


  ws.cell(7, 5, 7, 7, true).string(t('FORM.LABELS.INVOICE').concat(': ', data.reference));
  ws.cell(8, 5, 8, 7, true).string(t('TABLE.COLUMNS.SERVICE').concat(': ', data.serviceName));
  ws.cell(9, 5, 9, 7, true).string(t('FORM.LABELS.DATE').concat(': ', data.dateFormat));
  ws.cell(10, 5, 10, 7, true).string(t('FORM.LABELS.CREATED_BY').concat(': ', data.display_name));

  ws.cell(7, 1, 10, 7).style(style2);


  ws.cell(7, 1, 7, 7).style(styleBorderTop);

  ws.cell(10, 1, 10, 7).style(styleBorderBottom);
  ws.cell(7, 1, 10, 1).style(styleBorderLeft);
  ws.cell(7, 7, 10, 7).style(styleBorderRight);

  // Description

  ws.cell(12, 1).string(t('FORM.LABELS.DESCRIPTION')).style(styleUndeLine);
  ws.cell(13, 1, 13, 7, true).string(data.description).style(style2);
  ws.cell(13, 1, 13, 7, true).style(styleMultiLine);
  ws.row(13).setHeight(40); // description might be pretty long

  // detail
  ws.cell(15, 1).string(t('FORM.LABELS.INVOICES_DETAILS')).style(styleUndeLine);

  // titles
  let line = 16;
  ws.cell(line, 1).string(t('TABLE.COLUMNS.CODE'));
  ws.cell(line, 2, line, 4, true).string(t('TABLE.COLUMNS.DESCRIPTION'));
  ws.cell(line, 5).string(t('TABLE.COLUMNS.UNIT_PRICE'));
  ws.cell(line, 6).string(t('TABLE.COLUMNS.QUANTITY'));
  ws.cell(line, 7).string(t('TABLE.COLUMNS.TOTAL'));
  ws.cell(line, 1, line, 7).style(style2);
  ws.cell(line, 1, line, 7).style(styleAllBorders);

  line = 17;
  // invoice items
  data.items.forEach(row => {
    ws.cell(line, 1).string(row.code);
    ws.cell(line, 2, line, 4, true).string(row.text);
    ws.cell(line, 5).number(row.transaction_price);
    ws.cell(line, 6).number(row.quantity);

    const total = (row.transaction_price * row.quantity);
    ws.cell(line, 7).string(''.concat(total, '', currencySymbol));

    ws.cell(line, 1, line, 7).style(style2);
    ws.cell(line, 1, line, 7).style(styleAllBorders);
    line++;
  });

  // subsidy

  if (data.subsidy.length) {
    const subsidyLable = t('FORM.LABELS.SUBSIDIES').concat('(', data.subsidy.length, ')');
    ws.cell(line, 3, line, 4, true).string(subsidyLable).style(style2);
    ws.cell(line, 5, line, 7, true).number(math.sum(data.subsidy, 'value')).style(style1);
    ws.cell(line, 3, line, 7, true).style(styleAllBorders);
  }
  // Total
  line++;
  ws.cell(line, 3, line, 4, true).string(t('FORM.LABELS.TOTAL')).style(style1);
  ws.cell(line, 5, line, 7, true).number(data.cost).style(style1);
  ws.cell(line, 3, line, 7, true).style(styleAllBorders);
  line++;

  ws.cell(line, 3, line, 7, true).string(numberToText.convert(data.cost, data.lang, currencyName)).style(style1);
  ws.cell(line, 3, line, 7, true).style(styleAllBorders);
  line++;

  const deferred = q.defer();

  wb.writeToBuffer().then(xlsxBuffer => {
    deferred.resolve({
      headers : {
        'Content-Type' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition' : 'attachment; filename=invoice.xlsx',
        'Content-Length' : xlsxBuffer.length,
      },
      report : xlsxBuffer,
    });
  });
  return deferred.promise;
}
