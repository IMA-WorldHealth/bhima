/**
 * Cash Receipt Controller
 *
 * This controller is responsible to assembling the cash payment receipt and
 * rendering it for the client.
 *
 * @module finance/reports/cash.receipt
 */
const _    = require('lodash');
const path = require('path');
const q    = require('q');

const BadRequest = require('../../../lib/errors/BadRequest');

const CashPayments = require('../cash');
const Users = require('../../admin/users');
const Patients = require('../../medical/patients');
const Enterprises = require('../../admin/enterprises');
const Exchange = require('../../finance/exchange');

// group supported renderers
const renderers = {
  'json': require('../../../lib/renderers/json'),
  'html': require('../../../lib/renderers/html'),
  'pdf': require('../../../lib/renderers/pdf'),
};

// default rendering parameters
const defaults = {
  pageSize: 'A6',
  renderer: 'pdf',
  lang: 'en'
};

const template = path.normalize('./server/controllers/finance/reports/cash.receipt.handlebars');

/**
 * @method build
 *
 * @description
 * This method builds the cash payment receipt as either a JSON, PDF, or HTML
 * file to be sent to the client.
 *
 * GET /reports/cash/:uuid
 */
function build(req, res, next) {
  const qs = req.query;

  // choose the renderer
  const renderer = renderers[qs.renderer || defaults.renderer];
  if (_.isUndefined(renderer)) {
    throw new BadRequest(`The application does not support rendering ${qs.renderer}.`);
  }

  // delete from the query string
  delete qs.renderer;

  // receipt data to be rendered
  const data = {};

  // set up contextual variables
  const context = {};
  _.defaults(context, qs, defaults);

  CashPayments.lookup(req.params.uuid)
    .then(payment => {
      data.payment = payment;

      return q.all([
        Users.lookup(payment.user_id),
        Patients.lookupByDebtorUuid(payment.debtor_uuid),
        Enterprises.lookupByProjectId(payment.project_id),
      ]);
    })
    .spread((user, patient, enterprise) => {
      data.user = user;
      data.patient = patient;
      data.enterprise = enterprise;

      return Exchange.getExchangeRate(enterprise.id, data.payment.currency_id, data.payment.date);
    })
    .then(exchange => {
      data.rate = exchange.rate;
      data.hasRate = (data.rate && !data.payment.is_caution);
      return renderer.render(data, template, context);
    })
    .then(result => {
      res.set(renderer.headers).send(result);
    })
    .catch(next)
    .done();
}

module.exports = build;
