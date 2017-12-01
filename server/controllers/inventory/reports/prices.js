
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
const inventorycore = require('../inventory/core');

module.exports = prices;

const TEMPLATE = './server/controllers/inventory/reports/prices.handlebars';

function prices(req, res, next) {
  const params = _.clone(req.query);

  const qs = _.extend(req.query, {
    csvKey: 'groups',
    footerRight: '[page] / [toPage]',
    footerFontSize: '7',
  });
  const metadata = _.clone(req.session);

  let report;

  try {
    report = new ReportManager(TEMPLATE, metadata, qs);
  } catch (e) {
    next(e);
    return;
  }


  inventorycore.getItemsMetadata(params)
    .then(items => {
      // group by inventory group
      let groups = _.groupBy(items, i => i.groupName);

      // make sure that they keys are sorted in alphabetical order
      groups = _.mapValues(groups, lines => {
        _.sortBy(lines, 'label');
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

