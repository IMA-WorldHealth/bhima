const {
  _, db, ReportManager, SATISFACTION_RATE_REPORT_TEMPLATE,
} = require('../common');

/**
 * @method satisfactionRateReport
 *
 * @description
 * This method builds the satisfaction rate report as either a
 * JSON, PDF, or HTML file to be sent to the client.
 *
 * GET '/reports/stock/satisfaction_rate_report'
 */
function satisfactionRateReport(req, res, next) {

  reporting(req.query, req.session).then(result => {

    res.set(result.headers).send(result.report);
  }).catch(next);
}

async function reporting(_options, session) {
  const data = {};
  const suppliersListe = [];

  const optionReport = _.extend(_options, {
    filename : 'TREE.SATISFACTION_RATE_REPORT',
  });

  const report = new ReportManager(SATISFACTION_RATE_REPORT_TEMPLATE, session, optionReport);

  let { depotUuids } = optionReport;

  // Check if element is an array
  if (!Array.isArray(depotUuids)) {
    depotUuids = Array.from([depotUuids]);
  }

  for (let i = 0; i < depotUuids.length; i++) {
    depotUuids[i] = [db.bid(depotUuids[i])];
  }

  const sqlGetDepotSupplier = `
    SELECT BUID(d.uuid) AS depot_uuid, d.text AS depot_text
      FROM depot AS d
    WHERE d.uuid IN (
      SELECT sr.depot_uuid
      FROM stock_requisition AS sr
      JOIN depot AS d ON d.uuid = sr.depot_uuid
      WHERE sr.depot_uuid IN (?)
      AND DATE(sr.date) >= DATE(?) AND DATE(sr.date) <= DATE(?)
    ) ORDER BY d.text ASC;`;

  const depotsListSupplier = await db.exec(sqlGetDepotSupplier, [
    depotUuids,
    optionReport.dateFrom,
    optionReport.dateTo,
  ]);

  const sqlGetDepotRequisition = `
    SELECT BUID(sr.requestor_uuid) AS requestor_uuid, d.text AS beneficiary, BUID(sr.depot_uuid) AS depot_uuid
      FROM stock_requisition AS sr
      JOIN depot AS d ON d.uuid = sr.requestor_uuid
      JOIN depot AS dd ON dd.uuid = sr.depot_uuid
      WHERE sr.depot_uuid IN (?)
      AND DATE(sr.date) >= DATE(?) AND DATE(sr.date) <= DATE(?)
      GROUP BY sr.depot_uuid, sr.requestor_uuid
      ORDER BY d.text ASC;
    `;

  const depotsListRequisition = await db.exec(sqlGetDepotRequisition, [
    depotUuids,
    optionReport.dateFrom,
    optionReport.dateTo,
  ]);

  const sqlGetRequisitionStockMovement = `
  SELECT req.requisition_reference, mov.stock_movement_text,
    IF(mov.quantity_delivered, mov.quantity_delivered, 0) AS quantity_delivered, req.stock_requisition_uuid,
    req.inventory_uuid, req.inventory_text,
    req.validator_user_id, BUID(req.depot_supplier_uuid) AS depot_supplier_uuid, req.depot_supplier_text,
    BUID(req.depot_requestor_uuid) AS depot_requestor_uuid, req.depot_requestor_text,
    req.quatity_requested, req.quatity_validated
    FROM (SELECT sr.uuid AS stock_requisition_uuid, it.inventory_uuid, inv.text AS inventory_text,
    sr.validator_user_id, sr.depot_uuid AS depot_supplier_uuid, d.text AS depot_supplier_text,
    sr.requestor_uuid AS depot_requestor_uuid, dd.text AS depot_requestor_text,
    IF(sr.validator_user_id, it.old_quantity, it.quantity) AS quatity_requested,
    it.quantity AS quatity_validated, map1.text AS requisition_reference
    FROM stock_requisition AS sr
    JOIN stock_requisition_item AS it ON it.requisition_uuid = sr.uuid
    JOIN inventory AS inv ON inv.uuid = it.inventory_uuid
    JOIN depot AS d ON d.uuid = sr.depot_uuid
    JOIN depot AS dd ON dd.uuid = sr.requestor_uuid
    JOIN document_map AS map1 ON map1.uuid = sr.uuid
    WHERE sr.depot_uuid IN (?)
    AND DATE(sr.date) >= DATE(?) AND DATE(sr.date) <= DATE(?)
    ORDER BY d.text, dd.text, inv.text ASC
  ) AS req
  LEFT JOIN (
    SELECT l.inventory_uuid, SUM(sm.quantity) AS quantity_delivered, sm.stock_requisition_uuid,
    map.text AS stock_movement_text
    FROM stock_movement AS sm
    JOIN lot AS l ON l.uuid = sm.lot_uuid
    JOIN inventory AS inv ON inv.uuid = l.inventory_uuid
    JOIN stock_requisition AS sr ON sr.uuid = sm.stock_requisition_uuid
    JOIN depot AS d ON d.uuid = sm.depot_uuid
    JOIN document_map AS map ON map.uuid = sm.document_uuid
    WHERE d.uuid IN (?)
    GROUP BY sm.stock_requisition_uuid, inv.uuid
  ) AS mov ON mov.inventory_uuid = req.inventory_uuid AND mov.stock_requisition_uuid = req.stock_requisition_uuid
  ORDER BY req.depot_supplier_text, req.depot_requestor_text, req.inventory_text ASC;
  `;

  const sqlGetRequisitionStockMovementAggregate = `
  SELECT req.depot_supplier_text, req.depot_requestor_text, req.requisition_reference, mov.stock_movement_text,
    mov.quantity_delivered,
    AVG(IF(mov.quantity_delivered, (mov.quantity_delivered / req.quatity_validated), 0)) AS satisfaction_rate_avg,
    req.stock_requisition_uuid,
    req.inventory_uuid, req.inventory_text,
    req.validator_user_id, BUID(req.depot_supplier_uuid) AS depot_supplier_uuid, 
    BUID(req.depot_requestor_uuid) AS depot_requestor_uuid,
    req.quatity_requested, req.quatity_validated
    FROM (SELECT sr.uuid AS stock_requisition_uuid, it.inventory_uuid, inv.text AS inventory_text,
    sr.validator_user_id, sr.depot_uuid AS depot_supplier_uuid, d.text AS depot_supplier_text, 
    sr.requestor_uuid AS depot_requestor_uuid, dd.text AS depot_requestor_text,
    IF(sr.validator_user_id, it.old_quantity, it.quantity) AS quatity_requested,
    it.quantity AS quatity_validated, map1.text AS requisition_reference
    FROM stock_requisition AS sr
    JOIN stock_requisition_item AS it ON it.requisition_uuid = sr.uuid
    JOIN inventory AS inv ON inv.uuid = it.inventory_uuid
    JOIN depot AS d ON d.uuid = sr.depot_uuid
    JOIN depot AS dd ON dd.uuid = sr.requestor_uuid
    JOIN document_map AS map1 ON map1.uuid = sr.uuid
    WHERE sr.depot_uuid IN (?)
    AND DATE(sr.date) >= DATE(?) AND DATE(sr.date) <= DATE(?)
    ORDER BY d.text, dd.text, inv.text ASC
  ) AS req 
  LEFT JOIN ( 
    SELECT l.inventory_uuid, SUM(sm.quantity) AS quantity_delivered, sm.stock_requisition_uuid,
    map.text AS stock_movement_text
    FROM stock_movement AS sm
    JOIN lot AS l ON l.uuid = sm.lot_uuid
    JOIN inventory AS inv ON inv.uuid = l.inventory_uuid
    JOIN stock_requisition AS sr ON sr.uuid = sm.stock_requisition_uuid
    JOIN depot AS d ON d.uuid = sm.depot_uuid
    JOIN document_map AS map ON map.uuid = sm.document_uuid
    WHERE d.uuid IN (?)
    GROUP BY sm.stock_requisition_uuid, inv.uuid
  ) AS mov ON mov.inventory_uuid = req.inventory_uuid AND mov.stock_requisition_uuid = req.stock_requisition_uuid
  GROUP BY req.depot_supplier_uuid, req.depot_requestor_uuid;`;

  const dataRequisitionStockMovement = await db.exec(sqlGetRequisitionStockMovement, [
    depotUuids,
    optionReport.dateFrom,
    optionReport.dateTo,
    depotUuids,
  ]);

  const dataRequisitionStockMovementAggregate = await db.exec(sqlGetRequisitionStockMovementAggregate, [
    depotUuids,
    optionReport.dateFrom,
    optionReport.dateTo,
    depotUuids,
  ]);

  depotsListSupplier.forEach(supplier => {
    suppliersListe.push({
      depot_text : supplier.depot_text,
    });

    supplier.data = [];
    const requisitionBySupplier = depotsListRequisition.filter(item => (item.depot_uuid === supplier.depot_uuid));

    requisitionBySupplier.forEach(requisition => {
      const dataRequisition = requisition;
      const dataMovementFilter = dataRequisitionStockMovement.filter(item => (
        item.depot_supplier_uuid === supplier.depot_uuid && item.depot_requestor_uuid === dataRequisition.requestor_uuid
      ));

      dataMovementFilter.forEach(item => {
        item.satisfaction_rate = item.quantity_delivered / item.quatity_validated;
      });

      if (dataMovementFilter.length) {
        supplier.data.push({
          depot_requisition : dataRequisition,
          data_requisition_movement : dataMovementFilter,
        });
      }
    });
  });

  depotsListSupplier.forEach(item => {
    let supplierSatisfactionQuantity = 0;
    let supplierSatisfactionItem = 0;

    item.data.forEach(element => {
      dataRequisitionStockMovementAggregate.forEach(aggr => {
        if ((item.depot_uuid === aggr.depot_supplier_uuid)
          && (element.depot_requisition.requestor_uuid === aggr.depot_requestor_uuid)) {

          element.depot_requisition.satisfaction_rate_quantity = aggr.satisfaction_rate_avg;
          element.depot_requisition.satisfaction_rate_item = 0;

          supplierSatisfactionQuantity += aggr.satisfaction_rate_avg;

          let countItemDelivered = 0;

          element.data_requisition_movement.forEach(mov => {
            if (mov.quantity_delivered) {
              countItemDelivered++;
            }
          });

          element.depot_requisition.satisfaction_rate_item = countItemDelivered
            / element.data_requisition_movement.length;

          supplierSatisfactionItem += element.depot_requisition.satisfaction_rate_item;
        }
      });

    });

    item.satisfaction_rate_quantity = supplierSatisfactionQuantity / item.data.length;
    item.satisfaction_rate_item = supplierSatisfactionItem / item.data.length;
  });

  data.depotsListSupplier = depotsListSupplier;
  optionReport.suppliersListe = suppliersListe;
  data.option = optionReport;

  return report.render(data);
}

module.exports = satisfactionRateReport;
