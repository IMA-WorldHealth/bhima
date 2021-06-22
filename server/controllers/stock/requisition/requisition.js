/**
 * Stock Requisition Controller
 */
const _ = require('lodash');
const db = require('../../../lib/db');
const util = require('../../../lib/util');
const FilterParser = require('../../../lib/filter');

const REQUISITION_STATUS_PARTIAL = 3;
const REQUISITION_STATUS_EXCESSIVE = 7;

const SELECT_QUERY = `
  SELECT
    BUID(sr.uuid) uuid, BUID(sr.requestor_uuid) requestor_uuid, BUID(sr.depot_uuid) depot_uuid,
    sr.requestor_type_id, sr.description, sr.date, sr.user_id, sr.project_id, sr.status_id,
    u.display_name AS user_display_name, d.text AS depot_text,
    s.name service_requestor, dd.text depot_requestor,
    dm.text reference, stat.title_key, stat.status_key, stat.class_style
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
    SELECT BUID(i.uuid) inventory_uuid, i.code, i.text, it.text as inventoryType, sri.quantity
    FROM stock_requisition_item sri
    JOIN inventory i ON i.uuid = sri.inventory_uuid
    JOIN inventory_type it ON i.type_id = it.id
    WHERE sri.requisition_uuid = ?
  `;
  const requisition = await db.one(sqlRequisition, [uuid]);
  const items = await db.exec(sqlRequisitionItems, [uuid]);
  return _.assignIn({ items }, requisition);
}

/**
 * @function getDetailsBalance
 * @description Returns the balance of inventories distributed for the requisition
 * @param {object} identifier The identifier of the record
 */
async function getDetailsBalance(identifier) {
  const uuid = identifier;
  const sqlRequisition = `${SELECT_QUERY} WHERE sr.uuid = ?;`;

  const sql = `
    SELECT req.inventory_uuid, req.code, req.text, req.inventoryType,
    (req.quantity - IF(mouv.quantity, mouv.quantity, 0)) AS quantity
    FROM (
      SELECT BUID(i.uuid) inventory_uuid, i.code, i.text, it.text as inventoryType, sri.quantity
      FROM stock_requisition_item sri
      JOIN inventory i ON i.uuid = sri.inventory_uuid
      JOIN inventory_type it ON i.type_id = it.id
      WHERE sri.requisition_uuid = ?
    ) AS req
    LEFT JOIN (
      SELECT BUID(inv.uuid) AS inventory_uuid, inv.code, inv.text, it.text AS inventoryType, SUM(m.quantity) AS quantity
      FROM stock_movement AS m
      JOIN lot AS l ON l.uuid = m.lot_uuid
      JOIN inventory AS inv ON inv.uuid = l.inventory_uuid
      JOIN inventory_type it ON inv.type_id = it.id
      JOIN stock_requisition AS sr ON sr.uuid = m.stock_requisition_uuid
      WHERE m.stock_requisition_uuid = ?
      GROUP BY inv.uuid
    ) AS mouv ON mouv.inventory_uuid = req.inventory_uuid
    WHERE (req.quantity - IF(mouv.quantity, mouv.quantity, 0)) > 0;
  `;

  const [requisition, items] = await Promise.all([db.one(sqlRequisition, [uuid]), db.exec(sql, [uuid, uuid])]);

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
    'stock_requisition_uuid',
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
  filters.equals('stock_requisition_uuid', 'uuid', 'sr');
  filters.equals('type_id', 'requestor_type_id', 'sr');
  filters.equals('depot_uuid', 'depot_uuid', 'sr');
  filters.equals('requestor_uuid', 'requestor_uuid', 'sr');
  filters.equals('user_id', 'user_id', 'sr');
  filters.equals('project_id', 'project_id', 'sr');
  filters.equals('reference', 'text', 'dm');
  filters.period('date', 'date', 'sr');
  filters.period('period', 'date', 'sr');
  filters.dateFrom('custom_period_start', 'date', 'sr');
  filters.dateTo('custom_period_end', 'date', 'sr');
  filters.custom('status', 'sr.status_id IN (?)', [params.status]);
  filters.setOrder('ORDER BY sr.date DESC');

  const query = filters.applyQuery(SELECT_QUERY);
  const queryParameters = filters.parameters();
  return { query, queryParameters };
}

exports.details = async (req, res, next) => {
  try {
    const params = req.query;

    const result = params.balance
      ? await getDetailsBalance(db.bid(req.params.uuid)) : await getDetails(db.bid(req.params.uuid));
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
    requisition.project_id = req.session.project.id;

    requisition.date = new Date(requisition.date) || new Date();

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

    if (requisition.date) {
      requisition.date = new Date(requisition.date);
    }

    if (requisition.depot_uuid) {
      requisition.depot_uuid = db.bid(requisition.depot_uuid);
    }

    if (requisition.movementRequisition) {
      const dataMovementRequisition = db.convert(
        req.body.movementRequisition, ['stock_requisition_uuid'],
      );

      delete requisition.movementRequisition;

      const checkRequisitionBalance = `
      SELECT COUNT(balance.inventory_uuid) AS numberInventoryPartial
        FROM (
        SELECT req.inventory_uuid, (req.quantity - IF(mouv.quantity, mouv.quantity, 0)) AS quantity
            FROM (
              SELECT BUID(i.uuid) inventory_uuid, sri.quantity
              FROM stock_requisition_item sri
              JOIN inventory i ON i.uuid = sri.inventory_uuid
              WHERE sri.requisition_uuid = ?
            ) AS req
            LEFT JOIN (
              SELECT BUID(inv.uuid) AS inventory_uuid, SUM(m.quantity) AS quantity
              FROM stock_movement AS m
              JOIN lot AS l ON l.uuid = m.lot_uuid
              JOIN inventory AS inv ON inv.uuid = l.inventory_uuid
              JOIN stock_requisition AS sr ON sr.uuid = m.stock_requisition_uuid
              WHERE m.stock_requisition_uuid = ?
              GROUP BY inv.uuid
            ) AS mouv ON mouv.inventory_uuid = req.inventory_uuid
          ) AS balance
          WHERE balance.quantity > 0;
        `;

      const movementStatus = await db.one(checkRequisitionBalance, [
        dataMovementRequisition.stock_requisition_uuid, dataMovementRequisition.stock_requisition_uuid,
      ]);

      const checkExcessiveBalance = `
      SELECT COUNT(balance.inventory_uuid) AS numberExcessive
        FROM (
        SELECT req.inventory_uuid, (req.quantity - IF(mouv.quantity, mouv.quantity, 0)) AS quantity
            FROM (
              SELECT BUID(i.uuid) inventory_uuid, sri.quantity
              FROM stock_requisition_item sri
              JOIN inventory i ON i.uuid = sri.inventory_uuid
              WHERE sri.requisition_uuid = ?
            ) AS req
            LEFT JOIN (
              SELECT BUID(inv.uuid) AS inventory_uuid, SUM(m.quantity) AS quantity
              FROM stock_movement AS m
              JOIN lot AS l ON l.uuid = m.lot_uuid
              JOIN inventory AS inv ON inv.uuid = l.inventory_uuid
              JOIN stock_requisition AS sr ON sr.uuid = m.stock_requisition_uuid
              WHERE m.stock_requisition_uuid = ?
              GROUP BY inv.uuid
            ) AS mouv ON mouv.inventory_uuid = req.inventory_uuid
          ) AS balance
          WHERE balance.quantity < 0;
        `;

      const excessiveStatus = await db.one(checkExcessiveBalance, [
        dataMovementRequisition.stock_requisition_uuid, dataMovementRequisition.stock_requisition_uuid,
      ]);

      if (movementStatus.numberInventoryPartial > 0) {
        // Partially
        requisition.status_id = REQUISITION_STATUS_PARTIAL;
      }

      if (movementStatus.numberInventoryPartial === 0 && excessiveStatus.numberExcessive > 0) {
        // Excessive
        requisition.status_id = REQUISITION_STATUS_EXCESSIVE;
      }
    }

    transaction.addQuery('UPDATE stock_requisition SET ? WHERE uuid = ?;', [binarize(requisition), uuid]);

    if (requisitionItems && requisitionItems.length) {
      transaction
        .addQuery('DELETE FROM stock_requisition_item WHERE requisition_uuid = ?;', [uuid]);

      requisitionItems.forEach(item => {
        item.requisition_uuid = req.params.uuid;
        transaction.addQuery('INSERT INTO stock_requisition_item SET ?;', binarize(item));
      });
    }

    await transaction.execute();
    res.status(200).json({ uuid : req.params.uuid });
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
exports.getDetailsBalance = getDetailsBalance;
