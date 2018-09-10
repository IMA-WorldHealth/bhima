/**
 * Stock Import Module
 *
 * This module is responsible of handling the import of stock
 * and related stock quantities
 */
const path = require('path');

const db = require('../../lib/db');
const util = require('../../lib/util');
const BadRequest = require('../../lib/errors/BadRequest');

exports.downloadTemplate = downloadTemplate;
exports.importStock = importStock;

/**
 * @method downloadTemplate
 *
 * @description send to the client the template file for stock import
*/
function downloadTemplate(req, res, next) {
  try {
    const file = path.join(__dirname, '../../../resources/templates/import-stock-template.csv');
    res.download(file);
  } catch (error) {
    next(error);
  }
}

/**
 * @method importStock
 *
 * @description this method allow to do an import of stock and their lots
 */
function importStock(req, res, next) {
  if (!req.files || req.files.length === 0) {
    next(new BadRequest('Something broke', 'ERRORS.EVERYTHING_BAD'));
    return;
  }

  let query;
  let queryParams;
  const filePath = req.files[0].path;

  util.formatCsvToJson(filePath)
    .then(data => {
      if (!hasValidDataFormat(data)) {
        throw new BadRequest('The given file has a bad data format for stock', 'ERRORS.BAD_DATA_FORMAT');
      }

      const transaction = db.transaction();

      data.forEach(item => {
        query = 'CALL ImportStock(?, ?, ?, ?, ?, ?, ?);';
        queryParams = [
          req.session.enterprise.id,
          item.stock_group_name,
          item.stock_code,
          item.stock_text,
          item.stock_type,
          item.stock_unit,
          item.stock_unit_price,
        ];
        transaction.addQuery(query, queryParams);
      });

      return transaction.execute();
    })
    .then(() => res.sendStatus(200))
    .catch(next)
    .done();
}

/**
 * hasValidDataFormat
 *
 * @description check if data has a valid format for stock
 *
 * @param {object} data
 */
function hasValidDataFormat(data = []) {
  return data.every(item => {
    return item.stock_code && item.stock_group_name
      && item.stock_text && item.stock_type && item.stock_unit
      && item.stock_unit_price;
  });
}
