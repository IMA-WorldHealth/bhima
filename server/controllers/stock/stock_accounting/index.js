/**
 * Stock Accounting Management
 *
 * This file contains all methods for stock accounting operations
 */

const uuid = require('node-uuid');
const db = require('../../../lib/db');
const NotFound = require('../../../lib/errors/NotFound');


// expose
exports.writeExitStockPatient = writeExitStockPatient;

/**
 * @function fetchMovement
 *
 * @description
 * fetch movement and filter them according an entry or exit
 *
 * @param {string} documentUuid
 * @param {boolean} isExit
 * @param {object} metadata - { project:..., enterprise:... }
 */
function fetchMovement(documentUuid, isExit, metadata) {
  const _IsExit = isExit ? 1 : 0;
  const projectId = metadata.project.id;
  const currencyId = metadata.enterprise.currency_id;

  const query = `
    SELECT ${projectId} as project_id, ${currencyId} as currency_id,
      m.uuid, m.description, m.flux_id, m.date, m.quantity, m.unit_cost, m.is_exit, m.user_id, m.document_uuid,
      ig.cogs_account, ig.stock_account 
    FROM stock_movement m 
    JOIN lot l ON l.uuid = m.lot_uuid
    JOIN inventory i ON i.uuid = l.inventory_uuid
    JOIN inventory_group ig 
      ON ig.uuid = i.group_uuid AND (ig.stock_account IS NOT NULL AND ig.cogs_account IS NOT NULL)
    WHERE m.document_uuid = ? AND m.is_exit = ?;
  `;
  return db.exec(query, [documentUuid, _IsExit])
    .then(rows => {
      if (!rows.length) {
        throw new NotFound(`
          Cannot find the stock movement with 
          document_uuid : ${documentUuid} and is_exit: ${_IsExit}
        `);
      }
      return rows;
    });
}

/**
 * @function postMovements
 *
 * @description
 * post stock exit movement into the voucher, the voucher items
 * and to the posting journal
 *
 * @param {array} movements
 */
function postMovements(movements) {
  const transaction = db.transaction();

  const line = movements[0];

  const queryInsertVoucher = 'INSERT INTO voucher SET ?';

  const queryInsertVoucherItem = `
    INSERT INTO voucher_item (uuid, account_id, debit, credit, voucher_uuid, document_uuid)
    VALUES (?, ?, ?, ?, ?, ?);
  `;

  const amount = movements.reduce((aggregate, mov) => {
    return aggregate + (mov.unit_cost * mov.quantity);
  }, 0);

  const voucher = {
    uuid : db.bid(uuid.v4()),
    date : line.date,
    project_id : line.project_id,
    currency_id : line.currency_id,
    user_id : line.user_id,
    type_id : null,
    description : line.description,
    amount,
  };

  // write into the voucher
  transaction.addQuery(queryInsertVoucher, [voucher]);

  // write voucher items
  movements.forEach((mov) => {
    const cost = mov.unit_cost * mov.quantity;

    // accounts
    const debitAccount = mov.is_exit ? mov.cogs_account : mov.stock_account;
    const creditAccount = mov.is_exit ? mov.stock_account : mov.cogs_account;

    // debit
    const debit = [
      db.bid(uuid.v4()),
      debitAccount,
      cost,
      0,
      voucher.uuid,
      mov.document_uuid,
    ];

    // credit
    const credit = [
      db.bid(uuid.v4()),
      creditAccount,
      0,
      cost,
      voucher.uuid,
      mov.document_uuid,
    ];

    transaction
      .addQuery(queryInsertVoucherItem, debit)
      .addQuery(queryInsertVoucherItem, credit);
  });

  // post the voucher into the journal
  transaction.addQuery('CALL PostVoucher(?);', voucher.uuid);

  return transaction.execute();
}

/**
 * @method writeExitStockPatient
 *
 * @description
 * write in the voucher and journal writinigs related
 * to the stock exit to patient
 *
 * @param {string} documentUuid
 * @param {object} metadata - { project:..., enterprise:...}
 */
function writeExitStockPatient(documentUuid, metadata) {
  const isExit = true;

  return fetchMovement(documentUuid, isExit, metadata)
    .then(postMovements);
}
