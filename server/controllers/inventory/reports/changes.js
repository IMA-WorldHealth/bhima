
/**
 * @overview Price Report
 *
 * @description
 * This file describes the price list report - it produces the list of prices to
 * be used as a physical reference for invoicing.
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

async function inventoryChanges(req, res, next) {
  const params = _.clone(req.query);

  const qs = _.extend(req.query, {
    csvKey : 'groups',
    footerRight : '[page] / [toPage]',
    footerFontSize : '7',
  });
  const metadata = _.clone(req.session);

  let report;

  try {
    report = new ReportManager(TEMPLATE, metadata, qs);
    const { dateFrom, dateTo } = params;

    const inventorySql = `
      SELECT DISTINCT BUID(iv.uuid) as uuid, iv.text AS inventory_name
      FROM inventory_log ivl
      JOIN inventory iv ON iv.uuid = ivl.inventory_uuid
      JOIN user u ON u.id = ivl.user_id
      WHERE ivl.log_timestamp BETWEEN DATE(?) AND DATE(?)
      ORDER BY iv.text
    `;

    const logsSql = `
      SELECT BUID(iv.uuid) as uuid, iv.text as label, ivl.text AS changes,
         u.display_name as userName, ivl.log_timestamp
      FROM inventory_log ivl
      JOIN inventory iv ON iv.uuid = ivl.inventory_uuid
      JOIN user u ON u.id = ivl.user_id
      WHERE ivl.log_timestamp BETWEEN DATE(?) AND DATE(?)
      ORDER BY iv.text ASC , ivl.log_timestamp DESC 
    `;
    const inventories = await db.exec(inventorySql, [dateFrom, dateTo]);
    const inventoriesMap = {};
    inventories.forEach(iv => {
      iv.logs = [];
      inventoriesMap[iv.uuid] = iv;
    });

    const results = await db.exec(logsSql, [dateFrom, dateTo]);

    results.forEach(row => {
      const { action, last, current } = JSON.parse(row.changes);
      formatKeys(last);
      formatKeys(current);

      if (action !== 'UPDATE') return;

      const updatedKeys = Object.keys(current);

      updatedKeys.forEach(col => {
        inventoriesMap[row.uuid].logs.push({
          col : core.columnsMap[col],
          value : getValue(last, current, col),
          date : row.log_timestamp,
          userName : row.userName,
          update : true,
        });
      });

    });

    const renderResult = await report.render({ inventories, dateFrom, dateTo });
    res.set(renderResult.headers).send(renderResult.report);
  } catch (e) {
    next(e);
  }
}

function formatKeys(record) {
  const removables = ['group_uuid', 'type_id', 'unit_id'];
  _.omit(record, removables);
  if (record.text) {
    record.label = _.clone(record.text);
    delete record.text;
  }
  return record;
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
