/**
 * The /vouchers HTTP API endpoint
 *
 * @module finance/vouchers
 *
 * @description This module is responsible for handling CRUD operations
 * against the `voucher` table.
 *
 * @requires lodash
 * @requires uuid/v4
 * @requires lib/util
 * @requires lib/db
 * @requires lib/ReportManager
 * @requires lib/errors/NotFound
 * @requires lib/errors/BadRequest
 */

const _ = require('lodash');
const uuid = require('uuid/v4');
const util = require('../../lib/util');
const db = require('../../lib/db');
const BadRequest = require('../../lib/errors/BadRequest');
const identifiers = require('../../config/identifiers');
const FilterParser = require('../../lib/filter');

exports.generate = generate;



/**
 * POST /vouchers/transfert/generate
 *
 * @method generate
 */
function generate(req, res, next) {
  // alias both the voucher and the voucher items
  const { voucher } = req.body;
  const items = req.body.voucher.items;
  let creditAccount;

  // a voucher without two items doesn't make any sense in double-entry
  // accounting.  Therefore, throw a bad data error if there are any fewer
  // than two items in the journal voucher.
  if (items.length < 2) {
    next(new BadRequest(`Expected there to be at least two items, but only received ${items.length} items.`));

    return;
  }

  // remove the voucher items from the request before insertion into the
  // database
  delete voucher.items;
  delete voucher.uuid;
  delete voucher.reference;

  // convert dates to a date objects
  voucher.date = voucher.date ? new Date(voucher.date) : new Date();

  // attach session information
  voucher.user_id = req.session.user.id;
  voucher.project_id = req.session.project.id;

  // make sure the voucher has an id
  const vuid1 = uuid();
  const voucher1 = {
    uuid : db.bid(vuid1),
    project_id : voucher.project_id,
    currency_id : voucher.currency_id,
    user_id : voucher.user_id,
    type_id : voucher.type_id,
    description : voucher.description,
    amount : voucher.amount,
    date : voucher.date,
  };

  const vuid2 = uuid();
  const voucher2 = {
    uuid : db.bid(vuid2),
    project_id : voucher.project_id,
    currency_id : voucher.currency_id,
    user_id : voucher.user_id,
    type_id : voucher.type_id,
    description : voucher.description,
    amount : voucher.amount,
    date : voucher.date,
  };

  let itemsVoucher1 = [];
  let itemsVoucher2 = [];

  // preprocess the items so they have uuids as required
  items.forEach(value => {
    const item = value;
    if (item.credit > 0) {
      creditAccount = item.account_id;
    }
  });

  const getTransfertAccount = `
    SELECT cash_box_account_currency.transfer_account_id
    FROM cash_box_account_currency
    WHERE cash_box_account_currency.account_id = ?
  `;

  db.exec(getTransfertAccount, [creditAccount])
    .then(data => {

      if (!data.length) {
        next(new BadRequest(`There is not any account of transfer configured for the accounts which you chose.`));

        return;
      }

      const transfertAccountId = data[0].transfer_account_id;

      // preprocess the items so they have uuids as required
      items.forEach(item => {
        // convert the item's binary uuids
        item = db.convert(item, ['uuid', 'voucher_uuid', 'document_uuid', 'entity_uuid']);

        const itemAccount1 = item.debit > 0 ? transfertAccountId : item.account_id;
        const itemAccount2 = item.credit > 0 ? transfertAccountId : item.account_id;

        itemsVoucher1.push({
          debit : item.debit,
          credit : item.credit,
          account_id : itemAccount1,
          uuid : db.bid(uuid()),
          voucher_uuid : db.bid(vuid1),
        });

        itemsVoucher2.push({
          debit : item.debit,
          credit : item.credit,
          account_id : itemAccount2,
          uuid : db.bid(uuid()),
          voucher_uuid : db.bid(vuid2),
        });
      });

      // map items into an array of arrays
      itemsVoucher1 = _.map(
        itemsVoucher1,
        util.take('uuid', 'account_id', 'debit', 'credit', 'voucher_uuid')
      );

      // map items into an array of arrays
      itemsVoucher2 = _.map(
        itemsVoucher2,
        util.take('uuid', 'account_id', 'debit', 'credit', 'voucher_uuid')
      );

      // initialise the transaction handler
      const transaction = db.transaction();

      // build the SQL query
      transaction
        .addQuery('INSERT INTO voucher SET ?', [voucher1])
        .addQuery(
          'INSERT INTO voucher_item (uuid, account_id, debit, credit, voucher_uuid) VALUES ?',
          [itemsVoucher1]
        )
        .addQuery('CALL PostVoucher(?);', [voucher1.uuid])
        .addQuery('INSERT INTO voucher SET ?', [voucher2])
        .addQuery(
          'INSERT INTO voucher_item (uuid, account_id, debit, credit, voucher_uuid) VALUES ?',
          [itemsVoucher2]
        )
        .addQuery('CALL PostVoucher(?);', [voucher2.uuid]);

      return transaction.execute();
    })
    .then(() => res.status(201).json({ uuid : vuid2 }))
    .catch(next)
    .done();

}
