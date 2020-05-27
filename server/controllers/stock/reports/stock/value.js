const Exchange = require('../../../finance/exchange');

const {
  _, db, ReportManager, pdfOptions, STOCK_VALUE_REPORT_TEMPLATE,
} = require('../common');

/**
 * @method stockInventoryReport
 *
 * @description
 * This method builds the stock value report as either a JSON, PDF, or HTML
 * file to be sent to the client.
 *
 * GET /reports/stock/value
 */
function stockValue(req, res, next) {
  reporting(req.query, req.session).then(result => {
    res.set(result.headers).send(result.report);
  }).catch(next);
}

async function reporting(_options, session) {
  const transaction = db.transaction();
  const data = {};
  const enterpriseId = session.enterprise.id;

  const optionReport = _.extend(_options, pdfOptions, {
    filename : 'TREE.STOCK_VALUE',
  });

  const report = new ReportManager(STOCK_VALUE_REPORT_TEMPLATE, session, optionReport);


  const options = (typeof (_options.params) === 'string') ? JSON.parse(_options.params) : _options.params;
  data.dateTo = options.dateTo;
  data.depot = await db.one('SELECT * FROM depot WHERE uuid=?', [db.bid(options.depot_uuid)]);

  // Get inventories movemented
  const sqlGetInventories = `
    SELECT DISTINCT(BUID(mov.inventory_uuid)) AS inventory_uuid, mov.text AS inventory_name
    FROM(
      SELECT inv.uuid AS inventory_uuid, inv.text, sm.date
      FROM stock_movement AS sm
      JOIN lot AS l ON l.uuid = sm.lot_uuid
      JOIN inventory AS inv ON inv.uuid = l.inventory_uuid
      WHERE sm.depot_uuid = ? AND DATE(sm.date) <= DATE(?)
    ) AS mov
    ORDER BY mov.text ASC;
  `;

  /*
   * The following query collects all the data related to the movement
   * of stocks of an item in order to calculate the stock value
   * With the aim of solving the problem, count the total number of
   * entries into stock *quantityIn* as well as that of exit
   * but also the cumulative value of entries *quantityCum* and exits *cumOut*
   * and the quantity in stock after each movement of stock *quantityStock*
  */
  const stockValues = await db.exec(sqlGetInventories, [db.bid(options.depot_uuid), options.dateTo]);
  stockValues.forEach(inventory => {
    const sqlGetValueByMovement = `
      SELECT BUID(gl1.inventory_uuid) AS inventory_uuid, gl1.date, gl1.inventory_text, gl1.quantity, gl1.unit_cost,
      gl1.is_exit, gl1.docRef, gl1.valueStock, gl1.quantityIn, (@cumquant := gl1.quantity + @cumquant) AS quantityStock,
      (@cumsum := gl1.quantityIn + @cumsum) AS quantityCum, (@cumtotal := gl1.valueStock + @cumtotal) AS cumtotal,
      (@cumOut := gl1.quantityOut + @cumOut) AS cumOut, gl1.created_at
      FROM (
        SELECT inv.uuid AS inventory_uuid, inv.text AS inventory_text, sm.date, IF(sm.is_exit, (sm.quantity * (-1)),
        sm.quantity) AS quantity, sm.unit_cost, sm.is_exit, sm.flux_id, map.text AS docRef, sm.created_at,
        IF (sm.is_exit, 0, (sm.quantity * sm.unit_cost)) AS valueStock, IF (sm.is_exit, 0, sm.quantity) AS quantityIn,
        IF (sm.is_exit, sm.quantity, 0) AS quantityOut
        FROM stock_movement AS sm
        JOIN lot AS l ON l.uuid = sm.lot_uuid
        JOIN inventory AS inv ON inv.uuid = l.inventory_uuid
        JOIN document_map AS map ON map.uuid = sm.document_uuid
        WHERE inv.uuid = ? AND sm.depot_uuid = ? AND DATE(sm.date) <= DATE(?)
        ORDER BY DATE(sm.date), sm.created_at  ASC
      ) AS gl1, (SELECT @cumquant := 0)a, (SELECT @cumsum := 0) AS b, (SELECT @cumtotal := 0)c, (SELECT @cumOut := 0)d
    `;

    transaction
      .addQuery(sqlGetValueByMovement, [db.bid(inventory.inventory_uuid), db.bid(options.depot_uuid), options.dateTo]);
  });

  const inventoriesValues = await transaction.execute();
  inventoriesValues.forEach(inventory => {
    let unitCost = 0;
    let lastCumValue = 0;

    inventory.forEach(item => {
      item.oldUNITCOST = unitCost;
      if (item.is_exit) {
        item.newQuantityCum = item.quantityCum - item.cumOut;
        item.newCumValue = item.quantityStock * unitCost;
        item.stockUnitCost = item.newQuantityCum ? item.newCumValue / item.newQuantityCum : unitCost;

        unitCost = item.stockUnitCost;
        lastCumValue = item.newCumValue;
      } else if (!item.is_exit) {
        item.newQuantityCum = item.quantityCum - item.cumOut;
        item.newCumValue = item.valueStock + lastCumValue;
        item.stockUnitCost = item.newQuantityCum ? item.newCumValue / item.newQuantityCum : unitCost;

        unitCost = item.stockUnitCost;
        lastCumValue = item.newCumValue;
      }
    });
  });

  let stockTolal = 0;

  stockValues.forEach(inventory => {
    inventory.movements = [];
    inventoriesValues.forEach(item => {
      const lastMovement = item[item.length - 1];

      if (inventory.inventory_uuid === lastMovement.inventory_uuid) {
        inventory.stockQtt = lastMovement.quantityStock;
        inventory.stockUnitCost = lastMovement.stockUnitCost;
        inventory.stockValue = lastMovement.newCumValue;

        stockTolal += inventory.stockValue;
      }
    });
  });

  const stockValueElements = options.exclude_zero_value
    ? stockValues.filter(item => item.stockValue > 0) : stockValues;

  data.stockValues = stockValueElements || [];

  data.stocktotal = stockTolal;
  data.emptyResult = data.stockValues.length === 0;
  const exchangeRate = await Exchange.getExchangeRate(enterpriseId, options.currency_id, new Date());
  data.rate = exchangeRate.rate || 1;

  data.currency_id = options.currency_id;
  return report.render(data);
}

module.exports.document = stockValue;
module.exports.reporting = reporting;
