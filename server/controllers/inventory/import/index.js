/**
 * @overview Inventory Import Module
 *
 * This module implements the logic for importing the inventory into the application.  It provides
 * a template file to show how the inventory schema must be modeled for the user to fill out.
 */
const path = require('path');
const debug = require('debug')('bhima:inventory');
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
async function importInventories(req, res, next) {
  try {
    if (!req.files || req.files.length === 0) {
      const errorDescription = 'Expected at least one file upload but did not receive any files.';
      throw new BadRequest(errorDescription, 'ERRORS.MISSING_UPLOAD_FILES');
    }

    const filePath = req.files[0].path;

    const data = await util.formatCsvToJson(filePath);
    if (!hasValidDataFormat(data)) {
      throw new BadRequest('The given file has a bad data format for inventories', 'ERRORS.BAD_DATA_FORMAT');
    }

    const transaction = db.transaction();
    const query = 'CALL ImportInventory(?, ?, ?, ?, ?, ?, ?);';

    data.forEach(item => {
      const queryParams = [
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

    await transaction.execute();
    res.sendStatus(200);
  } catch (e) {
    next(e);
  }
}

/**
 * @function hasValidDataFormat
 *
 * @description check if data has a valid format for inventories
 *
 * @param {Array} data - array of objects to check for valid properties
 *
 * @returns {boolean} - true if data is valid
 */
function hasValidDataFormat(data = []) {
  return data.every(item => {
    const bool = item.inventory_code && item.inventory_group_name
      && item.inventory_text && item.inventory_type && item.inventory_unit
      && item.inventory_unit_price;

    if (!bool) {
      debug('#import(): invalid data format:', item);
    }

    return bool;
  });
}
