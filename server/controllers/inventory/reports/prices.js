
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

const _ = require('lodash');
const db = require('../../../lib/db');
const FilterParser = require('../../../lib/filter');
const ReportManager = require('../../../lib/ReportManager');

module.exports = prices;

const TEMPLATE = './server/controllers/inventory/reports/prices.handlebars';

function prices(req, res, next) {
  const params = req.query.params ? JSON.parse(req.query.params) : {};

  if (params && params.group_uuid) { params.group_uuid = db.bid(params.group_uuid); }

  const filters = new FilterParser(params);
  const qs = _.extend(req.query, { csvKey : 'debtors' });
  const metadata = _.clone(req.session);

  let report;

  try {
    report = new ReportManager(TEMPLATE, metadata, qs);
  } catch (e) {
    next(e);
    return;
  }

  const sql = `
    SELECT BUID(inventory.uuid) AS uuid, inventory.default_quantity, inventory.text,
      inventory.price, inventory_group.name AS groupName, inventory_type.text AS typeName
    FROM inventory
      JOIN inventory_group ON inventory.group_uuid = inventory_group.uuid
      JOIN inventory_type ON inventory.type_id = inventory_type.id 
  `;

  filters.fullText('text', 'text', 'inventory');
  filters.equals('group_uuid');
  filters.setOrder('ORDER BY inventory.text');

  const query = filters.applyQuery(sql);
  const parameters = filters.parameters();

  db.exec(query, parameters)
    .then(items => {
      // group by inventory group
      let groups = _.groupBy(items, i => i.groupName);

      // make sure that they keys are sorted in alphabetical order
      groups = _.mapValues(groups, lines => {
        _.sortBy(lines, 'text');
        return lines;
      });

      return report.render({ groups });
    })
    .then(result => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();
}

