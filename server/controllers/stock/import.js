/**
 * Stock Import Module
 *
 * This module is responsible of handling the import of stock
 * and related stock quantities
 */
const path = require('path');
const moment = require('moment');

const db = require('../../lib/db');
const util = require('../../lib/util');
const BadRequest = require('../../lib/errors/BadRequest');
const Fiscal = require('../finance/fiscal');

exports.downloadTemplate = downloadTemplate;
exports.importStock = importStock;

/**
 * @method downloadTemplate
 *
 * @description send to the client the template file for stock import
*/
function downloadTemplate(req, res, next) {
  try {
    const file = path.join(__dirname, '../../resources/templates/import-stock-template.csv');
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
  let queryParams;

  const filePath = req.files[0].path;
  const depotUuid = db.bid(req.body.depot_uuid);
  const documentUuid = db.bid(util.uuid());
  let periodId = null;

  Fiscal.lookupFiscalYearByDate(new Date())
    .then(result => {
      periodId = result.id;

      // be sure that the depot exist
      return db.one('SELECT uuid FROM depot WHERE uuid = ?', depotUuid);
    })
    .then(() => util.formatCsvToJson(filePath))
    .then(data => {
      if (!hasValidDataFormat(data)) {
        throw new BadRequest('The given file has a bad data format for stock', 'ERRORS.BAD_DATA_FORMAT');
      }

      const transaction = db.transaction();
      const query = 'CALL ImportStock(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);';

      data.forEach(item => {
        queryParams = [
          req.session.enterprise.id,
          req.session.project.id,
          req.session.user.id,
          depotUuid,
          documentUuid,
          item.inventory_group_name,
          item.inventory_code || '',
          item.inventory_text,
          item.inventory_type,
          item.inventory_unit,
          item.inventory_unit_price,
          item.inventory_cmm || 0,
          item.stock_lot_label,
          item.stock_lot_quantity,
          moment(item.stock_lot_expiration).format('YYYY-MM-DD'),
          periodId,
        ];
        transaction.addQuery(query, queryParams);
      });

      const isExit = 0;
      const postingParams = [documentUuid, isExit, req.session.project.id, req.session.enterprise.currency_id];

      if (req.session.stock_settings.enable_auto_stock_accounting) {
        transaction.addQuery('CALL PostStockMovement(?)', [postingParams]);
      }

      return transaction.execute();
    })
    .then(() => res.sendStatus(201))
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
    const isUnitPriceDefined = typeof (item.inventory_unit_price) !== 'undefined';
    return item.inventory_group_name
      && item.inventory_text && item.inventory_type && item.inventory_unit
      && isUnitPriceDefined && item.stock_lot_label
      && item.stock_lot_quantity && item.stock_lot_expiration;
  });
}
