'use strict';

/**
 * @overview Price Report
 *
 * @description
 * This file describes the price list report - it produces the list of prices to
 * be used as a physical reference for invoicing.
 *
 * @requires db
 * @requires lodash
 * @requires ReportManager
 */

const db = require('../../../lib/db');
const _ = require('lodash');

const ReportManager = require('../../../lib/ReportManager');

module.exports = prices;

const TEMPLATE = './server/controllers/inventory/reports/prices.handlebars';

function prices(req, res, next) {

  const qs = _.extend(req.query, { csvKey : 'debtors' });
  const metadata = _.clone(req.session);

  let report;

  try {
    report = new ReportManager(TEMPLATE, metadata, qs);
  } catch(e) {
    return next(e);
  }

  const sql = `
    SELECT BUID(inventory.uuid) AS uuid, inventory.default_quantity, inventory.text,
      inventory.price, inventory_group.name AS groupName, inventory_type.text AS typeName
    FROM inventory
      JOIN inventory_group ON inventory.group_uuid = inventory_group.uuid
      JOIN inventory_type ON inventory.type_id = inventory_type.id
    ORDER BY inventory.text;
  `;

  db.exec(sql)
    .then(items => {

      // group by inventory group
      let groups = _.groupBy(items, i => i.groupName);

      // make sure that they keys are sorted in alphabetical order
      groups = _.mapValues(groups, items => {
        _.sortBy(items, 'text');
        return items;
      });

      return report.render({ groups });
    })
    .then(result => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();

}
