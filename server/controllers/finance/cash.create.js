'use strict';

const uuid = require('node-uuid');
const _ = require('lodash');
const db   = require('../../lib/db');
const BadRequest = require('../../lib/errors/BadRequest');
const util = require('../../lib/util');

// @fixme - only for testing purposes
const q = require('q');

module.exports = create;

/**
 * @function processCashItems
 *
 * @description
 * This method prepares the cash items for writing to the DB.  It ensures that
 * the uuids are defined and converted, and that each item represents an ordered
 * array of values.
 *
 * @param {Buffer} cashUuid - the binary uuid of the cash record
 * @param {Array} items - an array of cash_item JSONs
 * @returns {Array} - an ordered array of arrays (cash_items)
 */
function processCashItems(cashUuid, items) {

  // make sure uuids are defined and converted
  items.forEach(item => {
    item.cash_uuid = cashUuid;
    item.uuid = item.uuid || uuid.v4();

    item = db.convert(item, ['uuid', 'invoice_uuid']);
  });

  // make sure the items are in an ordered array
  const order = util.take('uuid', 'cash_uuid', 'amount', 'invoice_uuid');
  return _.map(items, order);
}

/**
 * @method processCash
 *
 * @description
 * Turns the cash payment into an array of values for templating into MySQL.
 *
 *
 */
function processCash(cashUuid, payment) {

  payment.uuid = cashUuid;
  payment = db.convert(payment, ['debtor_uuid']);

  if (payment.date) {
    payment.date = new Date(payment.date);
  }

  // remove the cash items so that the SQL query is properly formatted
  delete payment.items;

  // turns the object into an array ordered by these values
  const order = util.take(
    'amount', 'currency_id', 'cashbox_id', 'debtor_uuid', 'project_id', 'date',
    'user_id', 'is_caution', 'description', 'uuid'
  );

  return order(payment);
}

/**
 * @method create
 *
 * @description
 * Creates a cash payment against one or many previous invoices or a cautionary
 * payment.  If a UUID is not provided, one is automatically generated.
 *
 * POST /cash
 */
function create(req, res, next) {

  // alias insertion data
  let data = req.body.payment;
  const isCaution = Boolean(data.is_caution);
  const hasItems = (data.items && data.items.length);

  // disallow invoice payments with empty items by returning a 400 to the client
  if (!isCaution && !hasItems) {
    return next(
      new BadRequest('You must submit cash items with the cash items payment.')
    );
  }

  // generate a UUID if it not provided.
  const cashUuid = db.bid(data.uuid || uuid.v4());

  // trust the server's session info over the client's
  data.project_id = req.session.project.id;
  data.user_id = req.session.user.id;

  let items;

  // if items exist, transform them into an array of arrays for db formatting
  if (data.items) {
    items = processCashItems(cashUuid, data.items);
  }

  data = processCash(cashUuid, data);

  const transaction = db.transaction();

  // proposed posting process
  transaction.addQuery('CALL StageCash(?)', [data]); // @todo - rename data -> payment

  // only add the "items" query if we are NOT making a caution
  // cautions do not have items
  if (!isCaution) {
    items.forEach(item => transaction.addQuery('CALL StageCashItem(?)', [item]));
  }

  transaction.addQuery('CALL WriteCash(?)', [cashUuid]);
  // transaction.addQuery('CALL PostCash(?)', [cashUuid]);

  transaction.execute()
    .then(() => {
      res.status(201).json({ uuid : uuid.unparse(cashUuid) });
    })
    .catch(next)
    .done();
}

