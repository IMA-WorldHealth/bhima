const db = require('../../../../../lib/db');
const { FROM_PURCHASE } = require('../../../../../config/constants').flux;

const IS_EXIT = 0;

/**
 * @function fetch
 * @description fetch stock entry from purchase
 */
function fetch(depotUuid, dateFrom, dateTo, showDetails) {
  const sql = `
  SELECT
    i.code, i.text, iu.text AS unit_text, BUID(m.document_uuid) AS document_uuid,
    SUM(m.quantity) as quantity, m.date, m.description,
    SUM(m.quantity * m.unit_cost) AS cost, m.unit_cost,
    u.display_name AS user_display_name, sup.display_name AS supplier_display_name,
    dm.text AS document_reference, d.text AS depot_name,
    dm2.text AS purchase_reference
  FROM stock_movement m
    JOIN lot l ON l.uuid = m.lot_uuid
    JOIN inventory i ON i.uuid = l.inventory_uuid
    JOIN inventory_unit iu ON iu.id = i.unit_id
    JOIN depot d ON d.uuid = m.depot_uuid
    JOIN purchase p ON p.uuid = m.entity_uuid
    JOIN supplier sup ON sup.uuid = p.supplier_uuid
    JOIN user u ON u.id = m.user_id
    LEFT JOIN document_map dm ON dm.uuid = m.document_uuid
    LEFT JOIN document_map dm2 ON dm2.uuid = p.uuid
  WHERE m.is_exit = ${IS_EXIT} AND m.flux_id = ${FROM_PURCHASE} AND d.uuid = ?
    AND (DATE(m.date) BETWEEN DATE(?) AND DATE(?))
  GROUP BY i.uuid`;

  const groupBy = ', m.uuid, p.uuid';
  const orderBy = ' ORDER BY i.text, m.date ASC';
  const query = showDetails ? sql.concat(groupBy, orderBy) : sql.concat(orderBy);

  const _depotUuid = db.bid(depotUuid);
  const _dateFrom = new Date(dateFrom);
  const _dateTo = new Date(dateTo);
  return db.exec(query, [_depotUuid, _dateFrom, _dateTo]);
}

module.exports.fetch = fetch;
