/**
 * Patient Invoice API Controller 
 *.@module controllers/finance/patientInvoice
 * 
 * @todo GET /sales/patient/:uuid - retrieve all patient invoices for a specific patient
 * @todo Factor in subsidies, this depends on price lists and billing services infrastructre 
 * @todo Credit note logic pending on clear design 
 */
var db = require('../../lib/db');
var uuid = require('../../lib/guid');

/** Retrieves a list of all patient invoices (accepts ?q delimiter). */
exports.list = list;

/** Retrieves details for a specific patient invoice. */
exports.details = details;

/** Write a new patient invoice record and attempt to post it to the journal. */
exports.create = create;

function list(req, res, next) { 
  var saleListQuery;

  saleListQuery = 
    'SELECT sale.project_id, sale.reference, sale.uuid, cost, sale.debitor_uuid, ' +
      'seller_id, invoice_date, is_distributable ' + 
      // '(SELECT COUNT(uuid) ' + 
      // 'FROM sale_item ' + 
      // 'WHERE sale_item.uuid = sale.uuid) as itemCount ' + 
    'FROM sale ' + 
    'LEFT JOIN patient ON sale.debitor_uuid = patient.debitor_uuid';

  db.exec(saleListQuery)
    .then(function (result) { 
      var sales = result;

      res.status(200).json(sales);  
    })
    .catch(next)
    .done();
}

function details(req, res, next) { 
  
  // Retrieve specific patient invoice
}

function create(req, res, next) { 
  var insertSaleLineQuery, insertSaleItemQuery;
  var transaction;
   
  // Verify request validity 
  var saleLineBody = req.body.sale;
  var saleItems = req.body.saleItems;
  
  // Reject invalid parameters
  if (!saleLineBody || !saleItems) { 
    res.status(400).json({
      code : 'ERROR.ERR_MISSING_INFO', 
      reason : 'A valid sale details and sale items must be provided under the attributes `sale` and `saleItems`'
    });
    return;
  }
  
  // Provide UUID if the client has not specified 
  saleLineBody.uuid = saleLineBody.uuid || uuid();
  
  // Implicitly provide seller information based on user session 
  saleLineBody.seller_id = req.session.user.id;

  insertSaleLineQuery = 
    'INSERT INTO sale SET ?';
  
  insertSaleItemQuery = 
    'INSERT INTO sale_item (inventory_uuid, quantity, inventory_price, ' + 
        'transaction_price, credit, debit, uuid,  sale_uuid) VALUES ?';

  transaction = db.transaction();

  // Insert sale line 
  transaction
    .addQuery(insertSaleLineQuery, [saleLineBody])
  
  // Insert sale item lines
    .addQuery(insertSaleItemQuery, [linkSaleItems(saleItems, saleLineBody.uuid)]);

  transaction.execute() 
    .then(function (results) { 
      var confirmation = { 
        uuid : saleLineBody.uuid,
        results : results
      };
      res.status(201).json(confirmation);
    })
    .catch(next)
    .done();
}

/** 
 * Utility method to ensure patient invoice lines reference sale.
 * @param {Object} saleItems - An Array of all sale items to be written 
 * @param {string} saleUuid - UUID of referenced patient invoice
 * @returns {Object} An Array of all sale items with guaranteed UUIDs and Patient Invoice references
 */
function linkSaleItems(saleItems, saleUuid) { 
  return saleItems.map(function (saleItem) { 
     
    saleItem.uuid = saleItem.uuid || uuid();
    saleItem.sale_uuid = saleUuid;
   
    // Collapse sale item into Array to be inserted into database
    return Object.keys(saleItem).map(function (key) { 
      return saleItem[key];
    });
  });
}
