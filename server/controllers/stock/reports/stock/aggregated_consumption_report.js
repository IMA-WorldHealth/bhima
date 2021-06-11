const {
  _, db, ReportManager, STOCK_AGGREGATED_CONSUMPTION_REPORT_TEMPLATE,
} = require('../common');

/**
 * @method stockAggregatedConsumptionReport
 *
 * @description
 * This method builds the aggregated stock consumption report as either a
 * JSON, PDF, or HTML file to be sent to the client.
 *
 * GET /reports/stock/aggregated_consumption
 */
function stockAggregatedConsumptionReport(req, res, next) {
  reporting(req.query, req.session).then(result => {
    res.set(result.headers).send(result.report);
  }).catch(next);
}

async function reporting(_options, session) {
  const data = {};

  const optionReport = _.extend(_options, {
    filename : 'REPORT.AGGREGATED_STOCK_CONSUMPTION.TITLE',
  });

  const TO_PATIENT = 9;
  const TO_SERVICE = 10;

  const report = new ReportManager(STOCK_AGGREGATED_CONSUMPTION_REPORT_TEMPLATE, session, optionReport);

  const options = (typeof (_options.params) === 'string') ? JSON.parse(_options.params) : _options.params;
  data.dateFrom = options.dateFrom;
  data.dateTo = options.dateTo;

  data.depotUuid = options.depotUuid;
  data.depotName = null;
  if (data.depotUuid) {
    const depotQuery = `SELECT text FROM depot WHERE uuid = ?`;
    const result = await db.one(depotQuery, db.bid(data.depotUuid));
    data.depotName = result.text;
    console.log("D: ", data.depotName);
  }

  data.inventoryGroupUuid = options.inventoryGroupUuid;
  data.inventoryGroupName = null;
  if (data.inventoryGroupUuid) {
    const gnameQuery = `SELECT name FROM inventory_group WHERE uuid = ?`;
    const result = await db.one(gnameQuery, db.bid(data.inventoryGroupUuid));
    data.inventoryGroupName = result.name;
  }

  const WhereDepot = options.depotUuid
    ? ` AND sm.depot_uuid = HUID(${db.escape(options.depotUuid)})` : '';

  const WhereInvGroup = options.inventoryGroupUuid
    ? ` AND inv.group_uuid = HUID(${db.escape(options.inventoryGroupUuid)})` : '';

  // Get the aggregated stock consumption for both service and patients
  const sqlCombined = `
    SELECT
      mov.code, mov.text AS inventory_name,
      MIN(mov.quantity) AS min_quantity,
      MAX(mov.quantity) AS max_quantity,
      SUM(mov.quantity) AS quantity,
      COUNT(DISTINCT(mov.sm_uuid)) AS num_distributions
    FROM (
      SELECT inv.uuid AS inventory_uuid, inv.text, inv.code,
             sm.uuid as sm_uuid, sm.quantity, sm.entity_uuid, sm.date
      FROM stock_movement AS sm
      JOIN lot AS l ON l.uuid = sm.lot_uuid
      JOIN inventory AS inv ON inv.uuid = l.inventory_uuid
      WHERE DATE(sm.date) BETWEEN DATE(?) AND DATE(?) AND
            sm.flux_id IN (${TO_PATIENT}, ${TO_SERVICE}) AND
            sm.is_exit=1 ${WhereDepot} ${WhereInvGroup}
     ) AS mov
    GROUP BY mov.inventory_uuid
    ORDER BY mov.text ASC;
    `;

  // Get the aggregated stock distributions to either patients or services
  const aggregatedValues = await db.exec(sqlCombined, [data.dateFrom, data.dateTo]);

  // Get the aggregated stock consumption for patients
  const sqlPatients = `
    SELECT
      mov.code, mov.text AS inventory_name,
      MIN(mov.quantity) AS min_quantity_patients,
      MAX(mov.quantity) AS max_quantity_patients,
      SUM(mov.quantity) AS quantity_patients,
      COUNT(DISTINCT(mov.sm_uuid)) AS num_distributions_patients,
      COUNT(DISTINCT(mov.entity_uuid)) AS num_patients
    FROM (
      SELECT inv.uuid AS inventory_uuid, inv.text, inv.code,
             sm.uuid as sm_uuid, sm.quantity, sm.entity_uuid, sm.date
      FROM stock_movement AS sm
      JOIN lot AS l ON l.uuid = sm.lot_uuid
      JOIN inventory AS inv ON inv.uuid = l.inventory_uuid
      WHERE DATE(sm.date) BETWEEN DATE(?) AND DATE(?) AND
            sm.flux_id=${TO_PATIENT} AND
            sm.is_exit=1 ${WhereDepot} ${WhereInvGroup}
    ) AS mov
    GROUP BY mov.inventory_uuid
    ORDER BY mov.text ASC;
  `;

  // Get the aggregated stock distributions to patients
  const patientValues = await db.exec(sqlPatients, [options.dateFrom, options.dateTo]);

  // Add in the patient data
  aggregatedValues.forEach(dist => {
    const patData = patientValues.find(row => row.code === dist.code);
    if (patData) {
      dist.avg_distribution = (dist.quantity / dist.num_distributions).toFixed(1);
      dist.min_quantity_patients = patData.min_quantity_patients;
      dist.max_quantity_patients = patData.max_quantity_patients;
      dist.quantity_patients = patData.quantity_patients;
      dist.num_patients = patData.num_patients;
      dist.num_distributions_patients = patData.num_distributions_patients;
      dist.avg_distribution_per_patient = (patData.quantity_patients / patData.num_patients).toFixed(1);
    }
  });

  data.aggregatedValues = aggregatedValues || [];

  data.emptyResult = data.aggregatedValues.length === 0;

  return report.render(data);
}

module.exports = stockAggregatedConsumptionReport;
