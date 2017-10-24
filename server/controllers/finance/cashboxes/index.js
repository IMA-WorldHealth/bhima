/**
 * @overview Cashboxes
 *
 * @description
 * This controller is responsible for creating and updating cashboxes.  Every
 * cashbox must have a name, and as many accounts as there are currencies
 * supported by the application.
 *
 * @requires db
 * @requires NotFound
 * @requires Topic
 * @requires Cashboxes/Currencies
 * @requires FilterParser
 */


const db = require('../../../lib/db');
const NotFound = require('../../../lib/errors/NotFound');
const FilterParser = require('../../../lib/filter');
const Topic = require('../../../lib/topic');
const currencies = require('./currencies');

exports.list = list;
exports.detail = detail;
exports.create = create;
exports.update = update;
exports.delete = remove;
exports.currencies = currencies;

/**
 * @method list
 *
 * @description
 * GET /cashboxes
 * Lists available cashboxes, defaulting to all in the database.  Pass in the
 * optional parameters:
 */
function list(req, res, next) {
  const filters = new FilterParser(req.query);

  let sql =
    'SELECT id, label, is_auxiliary, project_id FROM cash_box ';

  if (req.query.detailed === '1') {
    sql = `
      SELECT cash_box_account_currency.id, label, account_id, is_auxiliary, transfer_account_id, symbol,
      cash_box_account_currency.currency_id
      FROM cash_box JOIN cash_box_account_currency ON
      cash_box.id = cash_box_account_currency.cash_box_id JOIN currency ON
      currency.id = cash_box_account_currency.currency_id
    `;
  }

  filters.equals('project_id');
  filters.equals('is_auxiliary');

  filters.setOrder('ORDER BY label');

  const query = filters.applyQuery(sql);
  const parameters = filters.parameters();

  db.exec(query, parameters)
    .then(rows => res.status(200).json(rows))
    .catch(next)
    .done();
}

/**
 * @method helperGetCashbox
 *
 * @description
 * This method fetches a cashbox from the database.
 *
 * @param {Number} id - the id of the cashbox to be retrieved
 * @returns {Promise} - the response from the database
 */
function helperGetCashbox(id) {
  let cashbox;

  let sql = `
    SELECT id, label, project_id, is_auxiliary FROM cash_box
    WHERE id = ?;
  `;

  return db.one(sql, [id], id, 'Cashbox')
    .then((box) => {
      cashbox = box;

      // query the currencies supported by this cashbox
      sql = `
        SELECT currency_id, account_id, transfer_account_id
        FROM cash_box_account_currency
        WHERE cash_box_id = ?;
      `;

      return db.exec(sql, [cashbox.id]);
    })
    .then((rows) => {
      // assign the currencies to the cashbox
      cashbox.currencies = rows;
      return cashbox;
    });
}

/**
 * @method detail
 *
 * @description
 * GET /cashboxes/:id
 *
 * Returns the details of a specific cashbox, including the supported currencies
 * and their accounts.
 */
function detail(req, res, next) {
  helperGetCashbox(req.params.id)
    .then(cashbox => res.status(200).json(cashbox))
    .catch(next)
    .done();
}


/**
 * @method create
 *
 * @description
 * This method creates a new cashbox in the database.
 *
 * POST /cashboxes
 */
function create(req, res, next) {
  const box = req.body.cashbox;
  const sql = 'INSERT INTO cash_box SET ?;';

  db.exec(sql, [box])
    .then((row) => {
      Topic.publish(Topic.channels.FINANCE, {
        event   : Topic.events.CREATE,
        entity  : Topic.entities.CASHBOX,
        user_id : req.session.user.id,
        id      : row.insertId,
      });

      res.status(201).json({ id : row.insertId });
    })
    .catch(next)
    .done();
}

/**
 * @method update
 *
 * @description
 * This method updates the cashbox details for a cashbox matching the provided
 * id.
 *
 * PUT /cashboxes/:id
 */
function update(req, res, next) {
  const sql = 'UPDATE cash_box SET ? WHERE id = ?;';

  db.exec(sql, [req.body, req.params.id])
    .then(() => helperGetCashbox(req.params.id))
    .then((cashbox) => {
      Topic.publish(Topic.channels.FINANCE, {
        event   : Topic.events.UPDATE,
        entity  : Topic.entities.CASHBOX,
        user_id : req.session.user.id,
        id      : req.params.id,
      });

      res.status(200).json(cashbox);
    })
    .catch(next)
    .done();
}


/**
 * @method remove
 *
 * @description
 * This method removes the cashbox from the system.
 */
function remove(req, res, next) {
  const sql = 'DELETE FROM cash_box WHERE id = ?';

  db.exec(sql, [req.params.id])
    .then((rows) => {
      if (!rows.affectedRows) {
        throw new NotFound(`Could not find a cash box with id ${req.params.id}.`);
      }

      Topic.publish(Topic.channels.FINANCE, {
        event   : Topic.events.DELETE,
        entity  : Topic.entities.CASHBOX,
        user_id : req.session.user.id,
        id      : req.params.id,
      });

      res.sendStatus(204);
    })
    .catch(next)
    .done();
}
