/**
 * Stock Requisition Controller
 */
const _ = require('lodash');
const db = require('../../../lib/db');
const util = require('../../../lib/util');
const FilterParser = require('../../../lib/filter');

exports.details = (req, res, next) => {
  const uuid = db.bid(req.params.uuid);
  const glb = {};
  const sqlDetail = `
    SELECT 
      BUID(sr.uuid) uuid, BUID(sr.requestor_uuid) requestor_uuid, BUID(sr.depot_uuid) depot_uuid,
      sr.requestor_type_id, sr.description, sr.date, sr.user_id,
      u.display_name AS user_display_name, d.text AS depot_text, 
      s.name service_requestor, dd.text depot_requestor,
      dm.text reference
    FROM stock_requisition sr
    JOIN user u ON u.id = sr.user_id
    JOIN depot d ON d.uuid = sr.depot_uuid
    JOIN document_map dm ON dm.uuid = sr.uuid
    LEFT JOIN service s ON s.uuid = sr.requestor_uuid
    LEFT JOIN depot dd ON dd.uuid = sr.requestor_uuid
    WHERE sr.uuid = ?;
  `;
  db.one(sqlDetail, [uuid])
    .then(requisition => {
      glb.requisition = requisition;
      const sqlItems = `
        SELECT BUID(i.uuid) inventory_uuid, i.code, i.text, sri.quantity
        FROM stock_requisition_item sri
        JOIN inventory i ON i.uuid = sri.inventory_uuid
        WHERE sri.requisition_uuid = ?
      `;
      return db.exec(sqlItems, [uuid]);
    })
    .then(requisitionItems => {
      glb.requisition.items = requisitionItems;
      res.status(200).json(glb.requisition);
    })
    .catch(next)
    .done();
};

exports.list = (req, res, next) => {
  const params = binarize(req.query);
  const sr = getStockRequisition(params);
  db.exec(sr.query, sr.queryParameters)
    .then(rows => res.status(200).json(rows))
    .catch(next)
    .done();
};

exports.create = (req, res, next) => {
  const transaction = db.transaction();
  const identifier = util.uuid();
  const requisitionItems = _.pick(req.body, 'items').items;
  const requisition = _.omit(req.body, 'items');

  requisition.uuid = identifier;
  requisition.user_id = req.session.user.id;
  requisition.date = new Date(requisition.date);

  transaction.addQuery('INSERT INTO stock_requisition SET ?;', binarize(requisition));

  requisitionItems.forEach(item => {
    item.requisition_uuid = identifier;
    transaction.addQuery('INSERT INTO stock_requisition_item SET ?;', binarize(item));
  });

  transaction.execute()
    .then(() => res.status(201).json({ uuid : identifier }))
    .catch(next)
    .done();
};

exports.update = (req, res, next) => {
  const transaction = db.transaction();
  const uuid = db.bid(req.params.uuid);
  const requisition = _.omit(req.body, 'items');
  const requisitionItems = _.pick(req.body, 'items').items;

  if (requisition.uuid) {
    delete requisition.uuid;
  }

  requisition.date = new Date(requisition.date);
  transaction.addQuery('UPDATE stock_requisition SET ? WHERE uuid = ?;', [binarize(requisition), uuid]);

  if (requisitionItems && requisitionItems.length) {
    transaction
      .addQuery('DELETE FROM stock_requisition_item WHERE requisition_uuid = ?;', [binarize(requisition), uuid]);

    requisitionItems.forEach(item => {
      item.requisition_uuid = req.params.uuid;
      transaction.addQuery('INSERT INTO stock_requisition_item SET ?;', binarize(item));
    });
  }

  transaction.execute()
    .then(() => res.sendStatus(200))
    .catch(next)
    .done();
};

/**
 * deleteRequisition() allow to delete the requisition record in the database
 */
exports.deleteRequisition = (req, res, next) => {
  const transaction = db.transaction();
  const uuid = db.bid(req.params.uuid);

  transaction.addQuery('DELETE FROM stock_requisition_item WHERE requisition_uuid = ?;', [uuid]);
  transaction.addQuery('DELETE FROM stock_requisition WHERE uuid = ?;', [uuid]);

  transaction.execute()
    .then(() => res.sendStatus(200))
    .catch(next)
    .done();
};

/**
 * @function binarize
 *
 * @description
 * returns binary version of given identifiers (uuids)
 *
 * @param {object} params an object which contains identifiers in string format
 * @returns {object} params with binary identifiers
 */
function binarize(params) {
  return db.convert(params, [
    'uuid',
    'depot_uuid',
    'requisition_uuid',
    'inventory_uuid',
    'requestor_uuid',
  ]);
}

/**
 * @function getStockRequisition
 *
 * @description
 * build the query for getting stock requisition based on
 * a given parameters
 *
 * @param {object} params
 * @returns {object} { query:..., queryParameters:... }
 */
function getStockRequisition(params) {
  const sql = `
    SELECT 
      BUID(sr.uuid) uuid, BUID(sr.requestor_uuid) requestor_uuid, BUID(sr.depot_uuid) depot_uuid,
      sr.requestor_type_id, sr.description, sr.date, sr.user_id,
      u.display_name AS user_display_name, d.text AS depot_text, 
      s.name service_requestor, dd.text depot_requestor,
      dm.text reference
    FROM stock_requisition sr
    JOIN user u ON u.id = sr.user_id
    JOIN depot d ON d.uuid = sr.depot_uuid
    JOIN document_map dm ON dm.uuid = sr.uuid
    LEFT JOIN service s ON s.uuid = sr.requestor_uuid
    LEFT JOIN depot dd ON dd.uuid = sr.requestor_uuid
  `;

  const filters = new FilterParser(params);
  filters.equals('depot_text', 'text', 'd');
  filters.equals('service_requestor', 'name', 's');
  filters.equals('depot_requestor', 'text', 'dd');
  filters.equals('uuid', 'uuid', 'sr');
  filters.equals('type_id', 'requestor_type_id', 'sr');
  filters.equals('depot_uuid', 'depot_uuid', 'sr');
  filters.equals('requestor_uuid', 'requestor_uuid', 'sr');
  filters.equals('user_id', 'user_id', 'sr');
  filters.period('date', 'date', 'sr');
  filters.dateFrom('custom_period_start', 'created_at', 'sr');
  filters.dateTo('custom_period_end', 'created_at', 'sr');

  const query = filters.applyQuery(sql);
  const queryParameters = filters.parameters();
  return { query, queryParameters };
}
