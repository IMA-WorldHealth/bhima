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
async function importStock(req, res, next) {
  let queryParams;

  const operationDate = new Date(req.body.date);
  const filePath = req.files[0].path;
  const depotUuid = db.bid(req.body.depot_uuid);
  const documentUuid = db.bid(util.uuid());

  try {
    // check if a depot exists for the given uuid
    await db.one('SELECT uuid FROM depot WHERE uuid = ?', depotUuid);

    // get the fiscal year period information
    const period = await Fiscal.lookupFiscalYearByDate(operationDate);

    // read the csv file
    const data = await util.formatCsvToJson(filePath);

    // check validity of all data from the csv file
    checkDataFormat(data);

    const transaction = db.transaction();
    const query = 'CALL ImportStock(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);';

    data.forEach(item => {
      queryParams = [
        moment(operationDate).format('YYYY-MM-DD'),
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
        item.inventory_cmm,
        item.stock_lot_label,
        item.stock_lot_quantity,
        moment(item.stock_lot_expiration).format('YYYY-MM-DD'),
        period.id,
      ];
      transaction.addQuery(query, queryParams);
    });

    const isExit = 0;
    const postingParams = [documentUuid, isExit, req.session.project.id];

    if (req.session.stock_settings.enable_auto_stock_accounting) {
      transaction.addQuery('CALL PostStockMovement(?)', [postingParams]);
    }

    await transaction.execute();
    res.sendStatus(201);
  } catch (error) {
    next(error);
  }
}

/**
 * checkDataFormat
 *
 * @description check if data has a valid format for stock
 *
 * @param {object} data
 */
function checkDataFormat(data = []) {
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const isInventoryGroupDefined = typeof (item.inventory_group_name) === 'string'
      && item.inventory_group_name.length > 0;
    const isInventoryTextDefined = typeof (item.inventory_text) === 'string' && item.inventory_text.length > 0;
    const isInventoryTypeDefined = typeof (item.inventory_type) === 'string' && item.inventory_type.length > 0;
    const isInventoryUnitDefined = typeof (item.inventory_unit) === 'string' && item.inventory_unit.length > 0;
    const isStockLotLabelDefined = typeof (item.stock_lot_label) === 'string' && item.stock_lot_label.length > 0;
    const isExpirationDefined = typeof (item.stock_lot_expiration) === 'string' && item.stock_lot_expiration.length > 0;

    const isUnitPriceNumber = !Number.isNaN(Number(item.inventory_unit_price));
    const isLotQuantityNumber = !Number.isNaN(Number(item.stock_lot_quantity));

    /**
     * The key parameter of BadRequest must be properly translated for the user
     */

    if (!isInventoryGroupDefined) {
      throw new BadRequest(
        `[line : ${i + 2}] The inventory group ${item.inventory_group_name} must be a valid text`,
        `[line : ${i + 2}] The inventory group ${item.inventory_group_name} must be a valid text`,
        // 'ERRORS.NOT_A_TEXT',
      );
    }

    if (!isInventoryTextDefined) {
      throw new BadRequest(
        `[line : ${i + 2}] The inventory text ${item.inventory_text} must be a valid text`,
        `[line : ${i + 2}] The inventory text ${item.inventory_text} must be a valid text`,
        // 'ERRORS.NOT_A_TEXT',
      );
    }

    if (!isInventoryTypeDefined) {
      throw new BadRequest(
        `[line : ${i + 2}] The inventory type ${item.inventory_type} must be a valid text`,
        `[line : ${i + 2}] The inventory type ${item.inventory_type} must be a valid text`,
        // 'ERRORS.NOT_A_TEXT',
      );
    }

    if (!isInventoryUnitDefined) {
      throw new BadRequest(
        `[line : ${i + 2}] The inventory unit ${item.inventory_unit} must be a valid text`,
        `[line : ${i + 2}] The inventory unit ${item.inventory_unit} must be a valid text`,
        // 'ERRORS.NOT_A_TEXT',
      );
    }

    if (!isStockLotLabelDefined) {
      throw new BadRequest(
        `[line : ${i + 2}] The stock lot ${item.stock_lot_label} must be a valid text`,
        `[line : ${i + 2}] The stock lot ${item.stock_lot_label} must be a valid text`,
        // 'ERRORS.NOT_A_TEXT',
      );
    }

    if (!isExpirationDefined) {
      throw new BadRequest(
        `[line : ${i + 2}] The stock lot ${item.stock_lot_expiration} must be in this format "YYYY-MM-DD"`,
        `[line : ${i + 2}] The stock lot ${item.stock_lot_expiration} must be in this format "YYYY-MM-DD"`,
        // 'ERRORS.NOT_A_TEXT',
      );
    }

    if (!isUnitPriceNumber) {
      throw new BadRequest(
        `[line : ${i + 2}] The unit price value ${item.inventory_unit_price} is not a valid number`,
        `[line : ${i + 2}] The unit price value ${item.inventory_unit_price} is not a valid number`,
        // 'ERRORS.NOT_A_NUMBER',
      );
    }

    if (!isLotQuantityNumber) {
      throw new BadRequest(
        `[line : ${i + 2}] The lot quantity value ${item.stock_lot_quantity} is not a valid number`,
        `[line : ${i + 2}] The lot quantity value ${item.stock_lot_quantity} is not a valid number`,
        // 'ERRORS.NOT_A_NUMBER',
      );
    }
  }
}
