/**
 * @overview Inventory Changes Report
 *
 * @description
 * This report shows all the changes made to inventory items by different users.
 *
 * @requires lodash
 * @requires ReportManager
 * @requires inventorycore
 */

const _ = require('lodash');
const ReportManager = require('../../../lib/ReportManager');
const db = require('../../../lib/db');
const core = require('../inventory/core');

module.exports = inventoryChanges;

const TEMPLATE = './server/controllers/inventory/reports/changes.handlebars';

function processChangeLog(records) {
  return _.flatMap(records, (record) => {
    record.changes = JSON.parse(record.changes);
    const prev = formatKeys(record.changes.last);
    const next = formatKeys(record.changes.current);

    const keys = Object.keys(next);

    // loop through updated columns and create rows for them.
    return keys.map((key) => {
      return ({
        uuid : record.uuid,
        col : core.inventoryColsMap[key],
        value : getValue(prev, next, key),
        date : record.log_timestamp,
        userName : record.user_name,
        update : true,
      });
    });
  });
}

async function inventoryChanges(req, res, next) {
  const params = _.clone(req.query);
  const metadata = _.clone(req.session);

  try {
    const report = new ReportManager(TEMPLATE, metadata, params);
    const { dateFrom, dateTo } = params;

    const inventorySql = `
      SELECT BUID(iv.uuid) AS uuid, iv.code, iv.text AS label, iv.created_at,
      iv.updated_at, ivt.text AS type, ivu.text AS unit, ivg.name AS group_name
      FROM inventory iv
        JOIN inventory_type ivt ON iv.type_id = ivt.id
        JOIN inventory_group ivg ON iv.group_uuid = ivg.uuid
        JOIN inventory_unit ivu ON iv.unit_id = ivu.id
      WHERE iv.uuid IN (
        SELECT inventory_log.inventory_uuid FROM inventory_log
        WHERE inventory_log.log_timestamp BETWEEN DATE(?) AND DATE(?)
      )
      ORDER BY ivg.name, iv.text;
    `;

    const logsSql = `
      SELECT BUID(ivl.inventory_uuid) AS uuid, ivl.text AS changes, u.display_name as user_name,
        ivl.log_timestamp
      FROM inventory_log ivl
        JOIN user u ON u.id = ivl.user_id
      WHERE ivl.log_timestamp BETWEEN DATE(?) AND DATE(?)
        AND ivl.text->"$.action" = "UPDATE"
      ORDER BY ivl.log_timestamp DESC;
    `;


    const inventories = await db.exec(inventorySql, [dateFrom, dateTo]);
    const logs = await db.exec(logsSql, [dateFrom, dateTo]);

    // parse the changes to avoid doing that later
    const changelog = processChangeLog(logs);

    // group changelog by the inventory uuid
    const changeMap = _.groupBy(changelog, 'uuid');

    // attach logs to each inventory item
    inventories.forEach(inventory => {
      inventory.logs = changeMap[inventory.uuid];
    });

    // calculate the number of changes by user.
    const userChanges = _.chain(changelog)
      .groupBy('userName')
      .mapValues('length')
      .map((value, key) => ({ user : key, numberOfChanges : value }))
      .sortBy(row => -1 * row.numberOfChanges) // sort DESC
      .value();

    const renderResult = await report.render({
      inventories, dateFrom, dateTo, userChanges,
    });
    res.set(renderResult.headers).send(renderResult.report);
  } catch (e) {
    next(e);
  }
}

function formatKeys(record) {
  record.label = record.text;
  if (!record.label) { delete record.label; }
  return _.omit(record, ['group_uuid', 'type_id', 'unit_id', 'text']);
}

function getValue(last, current, key) {
  const result = {};

  if (key === 'inventoryGroup') {
    result.from = last.groupName || '';
    result.to = current.inventoryGroup.name || '';
    return result;
  }

  if (key === 'inventoryType') {
    result.from = last.type;
    result.to = current.inventoryType.text;
    return result;
  }

  if (key === 'inventoryUnit') {
    result.from = last.unit;
    result.to = current.inventoryUnit.text;
    return result;
  }

  result.from = last[key];
  result.to = current[key];
  return result;
}
