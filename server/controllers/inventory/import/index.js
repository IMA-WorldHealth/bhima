/**
 * Inventory Import Module
 *
 * This module is responsible of handling the import of inventories
 * and related stock quantities
 */
const path = require('path');

const db = require('../../../lib/db');
const util = require('../../../lib/util');
const BadRequest = require('../../../lib/errors/BadRequest');

exports.downloadTemplate = downloadTemplate;
exports.importInventories = importInventories;

/**
 * @method downloadTemplate
 *
 * @description send to the client the template file for inventory import
*/
function downloadTemplate(req, res, next) {
  try {
    const file = path.join(__dirname, '../../../resources/templates/import-inventory-template.csv');
    res.download(file);
  } catch (error) {
    next(error);
  }
}

/**
 * @method importInventories
 *
 * @description this method allow to do an import of inventory and stock
 */
function importInventories(req, res, next) {
  if (!req.files || req.files.length === 0) {
    const errorDescription = 'Expected at least one file upload but did not receive any files.';
    const errorDetails = new BadRequest(errorDescription, 'ERRORS.MISSING_UPLOAD_FILES');
    next(errorDetails);
    return;
  }

  let query;
  let queryParams;
  const filePath = req.files[0].path;

  util.formatCsvToJson(filePath)
    .then(data => {
      if (!hasValidDataFormat(data)) {
        throw new BadRequest('The given file has a bad data format for inventories', 'ERRORS.BAD_DATA_FORMAT');
      }

      const transaction = db.transaction();

      data.forEach(item => {
        query = 'CALL ImportInventory(?, ?, ?, ?, ?, ?, ?);';
        queryParams = [
          req.session.enterprise.id,
          item.inventory_group_name,
          item.inventory_code,
          item.inventory_text,
          item.inventory_type,
          item.inventory_unit,
          item.inventory_unit_price,
        ];
        transaction.addQuery(query, queryParams);
      });

      return transaction.execute();
    })
    .then(() => res.sendStatus(200))
    .catch(next);
}

/**
 * hasValidDataFormat
 *
 * @description check if data has a valid format for inventories
 *
 * @param {object} data
 */
function hasValidDataFormat(data = []) {
  return data.every(item => {
    return item.inventory_code && item.inventory_group_name
      && item.inventory_text && item.inventory_type && item.inventory_unit
      && item.inventory_unit_price;
  });
}
