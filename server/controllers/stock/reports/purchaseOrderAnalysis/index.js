const q = require('q');
const _ = require('lodash');
const db = require('../../../../lib/db');
const ReportManager = require('../../../../lib/ReportManager');
const Purchases = require('../../../finance/purchases');

const TEMPLATE = './server/controllers/stock/reports/purchaseOrderAnalysis/report.handlebars';
// expose to the API
exports.report = report;

// default report parameters
const DEFAULT_PARAMS = {
  csvKey : 'brea_report',
  filename : 'TREE.BREAK_EVEN_REPORT',
  orientation : 'landscape',
  footerRight : '[page] / [toPage]',
};

/**
 * @function report
 *
 * @description
 * This function renders the balance of accounts references as report.  The account_reference report provides a view
 * of the balance of account_references for a given period of fiscal year.
 */
function report(req, res, next) {
  const params = req.query;
  const data = {};

  params.shouldShowDetails = parseInt(params.shouldShowDetails, 10); 
  if (params.shouldShowDetails) {
    data.displayDetails = params.shouldShowDetails;
  } else {
    data.hideDetails = !params.shouldShowDetails;
  }

  data.enterprise = req.session.enterprise;
  let reporting;

  const statusDisplay = {
    waiting : {
      color : '#777777',
      icon : '...',
      text : 'FORM.LABELS.PENDING',
    },
    received : {
      color : '#5cb85c',
      icon : '✔',
      text : 'PURCHASES.STATUS.RECEIVED',
    },
    confirmed : {
      color : '#337AB7',
      icon : '-',
    },
    canceled : {
      color : '#d9534f',
      icon : 'X',
    },
    exessive : {
      color : '#d9534f',
      icon : '▲',
      text : 'FORM.LABELS.RECEIVED_IN_EXCESS',
    },
    partial : {
      color : '#f0ad4e',
      icon : '▼',
      text : 'PURCHASES.STATUS.PARTIALLY_RECEIVED',
    },
  };

  _.defaults(params, DEFAULT_PARAMS);

  try {
    reporting = new ReportManager(TEMPLATE, req.session, params);
  } catch (e) {
    next(e);
    return;
  }

  // This request makes it possible to obtain the quantities of the ordered products
  const sqlInventoriesOrdered = `
    SELECT BUID(p.uuid) AS purchase_uuid, BUID(iv.uuid) AS inventory_uuid, iv.code,
    iv.text AS inventory_text, pi.quantity AS quantity_ordered
    FROM purchase AS p
    JOIN purchase_item AS pi ON pi.purchase_uuid = p.uuid
    JOIN inventory AS iv ON iv.uuid = pi.inventory_uuid
    WHERE p.uuid = ?
    ORDER BY iv.text ASC;    
  `;

  // This query is used to get the quantities in stock for a purchase order
  const sqlInventoriesInStock = `
    SELECT BUID(p.uuid) AS purchase_uuid, BUID(iv.uuid) AS inventory_uuid,
    iv.text AS inventoryText, l.label AS lotLabel, p.project_id,
    p.reference, p.user_id, l.uuid AS lotUuid, SUM(l.quantity) AS quantity_inStock,
    l.expiration_date, MAX(l.entry_date) AS entry_date, iv.code
    FROM purchase AS p 
    JOIN lot AS l ON l.origin_uuid = p.uuid
    JOIN inventory AS iv ON iv.uuid = l.inventory_uuid
    WHERE p.uuid = ?
    GROUP BY iv.uuid
    ORDER BY iv.text ASC;
  `;

  // This request tracks the entries in stock of a purchase order, by date, by deposit but also by product
  const sqlInventoriesInStockDetailled = `
    SELECT BUID(p.uuid) AS purchase_uuid, BUID(iv.uuid) AS inventory_uuid, iv.text AS inventoryText,
    l.label AS lotLabel, p.project_id, p.reference, p.user_id, l.uuid AS lotUuid, l.quantity,
    l.expiration_date, l.entry_date, iv.code,
    d.text AS depotText, BUID(sm.uuid) AS stock_movement_uuid, dm1.text AS stock_movement_reference
    FROM purchase AS p 
    JOIN lot AS l ON l.origin_uuid = p.uuid
    JOIN inventory AS iv ON iv.uuid = l.inventory_uuid
    JOIN stock_movement AS sm ON sm.lot_uuid = l.uuid
    JOIN depot AS d ON d.uuid = sm.depot_uuid
    JOIN document_map AS dm1 ON dm1.uuid = sm.document_uuid
    WHERE p.uuid = ? AND sm.is_exit = 0
    ORDER BY iv.text ASC, l.entry_date ASC
  `;

  const uidPurchase = db.bid(params.purchase_uuid);

  const dbPromises = [
    Purchases.find({ uuid : params.purchase_uuid }),
    db.exec(sqlInventoriesOrdered, uidPurchase),
    db.exec(sqlInventoriesInStock, uidPurchase),
    db.exec(sqlInventoriesInStockDetailled, uidPurchase),
  ];

  q.all(dbPromises)
    .spread((purchase, inventoriesOrdered, inventoriesInStock, inventoriesInStockDetailled) => {
      inventoriesOrdered.forEach(ordered => {
        // Initialization of the quantity received
        ordered.quantity_inStock = 0;
        ordered.quantity_difference = ordered.quantity_ordered;
        ordered.last_entry_date = null;

        inventoriesInStock.forEach(inStock => {
          if (ordered.inventory_uuid === inStock.inventory_uuid) {
            ordered.quantity_inStock += inStock.quantity_inStock;
            ordered.quantity_difference -= inStock.quantity_inStock;
            ordered.last_entry_date = inStock.entry_date;
          }
        });
      });

      inventoriesOrdered.forEach(ordered => {
        if (ordered.quantity_difference === ordered.quantity_ordered) {
          ordered.status = statusDisplay.waiting;
        } else if (ordered.quantity_difference < 0) {
          ordered.status = statusDisplay.exessive;
        } else if (ordered.quantity_difference === 0) {
          ordered.status = statusDisplay.received;
        } else if (ordered.quantity_difference > 0 && ordered.quantity_difference < ordered.quantity_ordered) {
          ordered.status = statusDisplay.partial;
        }
      });

      inventoriesOrdered.forEach(ordered => {
        ordered.detailled = [];
        inventoriesInStockDetailled.forEach(detailled => {
          if (ordered.inventory_uuid === detailled.inventory_uuid) {
            ordered.detailled.push(detailled);
          }
        });
      });

      data.inventoriesOrdered = inventoriesOrdered;

      [data.purchase] = purchase;

      if (data.purchase.status_id === 1) {
        data.purchase.statusDisplay = statusDisplay.waiting;
      } else if (data.purchase.status_id === 2) {
        data.purchase.statusDisplay = statusDisplay.confirmed;
      } if (data.purchase.status_id === 3) {
        data.purchase.statusDisplay = statusDisplay.received;
      } else if (data.purchase.status_id === 4) {
        data.purchase.statusDisplay = statusDisplay.partial;
      } else if (data.purchase.status_id === 5) {
        data.purchase.statusDisplay = statusDisplay.canceled;
      } else if (data.purchase.status_id === 6) {
        data.purchase.statusDisplay = statusDisplay.exessive;
      }

      return reporting.render(data);
    })
    .then(result => {
      res.set(result.headers).send(result.report);
    })
    .catch(next)
    .done();

}
