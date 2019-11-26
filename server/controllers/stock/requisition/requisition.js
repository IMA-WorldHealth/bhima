/**
 * Stock Requisition Controller
 */
const _ = require('lodash');
const db = require('../../../lib/db');
const util = require('../../../lib/util');
const FilterParser = require('../../../lib/filter');

const SELECT_QUERY = `
  SELECT 
    BUID(sr.uuid) uuid, BUID(sr.requestor_uuid) requestor_uuid, BUID(sr.depot_uuid) depot_uuid,
    sr.requestor_type_id, sr.description, sr.date, sr.user_id,
    u.display_name AS user_display_name, d.text AS depot_text, 
    s.name service_requestor, dd.text depot_requestor,
    dm.text reference, stat.title_key, stat.status_key
  FROM stock_requisition sr
  JOIN user u ON u.id = sr.user_id
  JOIN depot d ON d.uuid = sr.depot_uuid
  JOIN document_map dm ON dm.uuid = sr.uuid
  JOIN status stat ON stat.id = sr.status_id
  LEFT JOIN service s ON s.uuid = sr.requestor_uuid
  LEFT JOIN depot dd ON dd.uuid = sr.requestor_uuid
`;

/**
 * @function getDetails
 * @description returns details of a requisition with inventories
 * @param {object} identifier The identifier of the record
 */
async function getDetails(identifier) {
  const uuid = identifier;
  const sqlRequisition = `${SELECT_QUERY} WHERE sr.uuid = ?;`;
  const sqlRequisitionItems = `
    SELECT BUID(i.uuid) inventory_uuid, i.code, i.text, sri.quantity
    FROM stock_requisition_item sri
    JOIN inventory i ON i.uuid = sri.inventory_uuid
    WHERE sri.requisition_uuid = ?
  `;
  const requisition = await db.one(sqlRequisition, [uuid]);
  const items = await db.exec(sqlRequisitionItems, [uuid]);
  return _.assignIn({ items }, requisition);
}

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
  const filters = new FilterParser(params);

  filters.equals('depot_text', 'text', 'd');
  filters.equals('service_requestor', 'name', 's');
  filters.equals('depot_requestor', 'text', 'dd');
  filters.equals('uuid', 'uuid', 'sr');
  filters.equals('type_id', 'requestor_type_id', 'sr');
  filters.equals('status_id', 'status_id', 'sr');
  filters.equals('depot_uuid', 'depot_uuid', 'sr');
  filters.equals('requestor_uuid', 'requestor_uuid', 'sr');
  filters.equals('user_id', 'user_id', 'sr');
  filters.equals('reference', 'text', 'dm');
  filters.period('date', 'date', 'sr');
  filters.period('period', 'date', 'sr');
  filters.dateFrom('custom_period_start', 'date', 'sr');
  filters.dateTo('custom_period_end', 'date', 'sr');
  filters.setOrder('ORDER BY sr.date DESC');

  const query = filters.applyQuery(SELECT_QUERY);
  const queryParameters = filters.parameters();
  return { query, queryParameters };
}

exports.details = async (req, res, next) => {
  try {
    const result = await getDetails(db.bid(req.params.uuid));
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.list = async (req, res, next) => {
  try {
    const params = binarize(req.query);
    const sr = getStockRequisition(params);
    const result = await db.exec(sr.query, sr.queryParameters);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const transaction = db.transaction();
    const identifier = util.uuid();
    const requisitionItems = _.pick(req.body, 'items').items;
    const requisition = _.omit(req.body, 'items');

    requisition.uuid = identifier;
    requisition.user_id = req.session.user.id;
    requisition.date = new Date();

    transaction.addQuery('INSERT INTO stock_requisition SET ?;', binarize(requisition));

    if (!requisitionItems.length) {
      throw new Error('No Requisition Items Given');
    }

    requisitionItems.forEach(item => {
      item.requisition_uuid = identifier;
      transaction.addQuery('INSERT INTO stock_requisition_item SET ?;', binarize(item));
    });

    await transaction.execute();
    res.status(201).json({ uuid : identifier });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const transaction = db.transaction();
    const uuid = db.bid(req.params.uuid);
    const requisition = _.omit(req.body, 'items');
    const requisitionItems = _.pick(req.body, 'items').items;

    if (requisition.uuid) {
      delete requisition.uuid;
    }

    requisition.date = requisition.date ? new Date(requisition.date) : new Date();
    transaction.addQuery('UPDATE stock_requisition SET ? WHERE uuid = ?;', [binarize(requisition), uuid]);

    if (requisitionItems && requisitionItems.length) {
      transaction
        .addQuery('DELETE FROM stock_requisition_item WHERE requisition_uuid = ?;', [binarize(requisition), uuid]);

      requisitionItems.forEach(item => {
        item.requisition_uuid = req.params.uuid;
        transaction.addQuery('INSERT INTO stock_requisition_item SET ?;', binarize(item));
      });
    }

    await transaction.execute();
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
};

exports.deleteRequisition = async (req, res, next) => {
  try {
    const transaction = db.transaction();
    const uuid = db.bid(req.params.uuid);

    transaction.addQuery('DELETE FROM stock_requisition_item WHERE requisition_uuid = ?;', [uuid]);
    transaction.addQuery('DELETE FROM stock_requisition WHERE uuid = ?;', [uuid]);

    await transaction.execute();
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

exports.getDetails = getDetails;
