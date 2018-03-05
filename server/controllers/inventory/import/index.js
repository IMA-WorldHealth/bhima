/**
 * Inventory Import Module
 *
 * This module is responsible of handling the import of inventories
 * and related stock quantities
 */
const Q = require('q');
const csvtojson = require('csvtojson');
const path = require('path');

const db = require('../../../lib/db');
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
    next(new BadRequest('Expected at least one file upload but did not receive any files.'));
    return;
  }

  let query;
  let queryParams;
  const file = req.files[0];

  formatCsvToJson(file)
    .then(data => {
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
    .catch(next)
    .done();
}

/**
 * formatCsvToJson
 * @param {object} file the csv file sent by the client
 */
function formatCsvToJson(file) {
  const filePath = path.resolve(file.path);
  const defer = Q.defer();
  const rows = [];

  csvtojson()
    .fromFile(filePath)
    .on('json', (data) => {
      rows.push(data);
    })
    .on('end', () => {
      defer.resolve(rows);
    })
    .on('error', (error) => {
      defer.reject(error);
    });

  return defer.promise;
}
