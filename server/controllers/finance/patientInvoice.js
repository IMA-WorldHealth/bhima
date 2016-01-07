/** 
 * @description Provides API endpoint for requesting information about patient invoices, provides
 * a simplified list of all patient invoices as well as detailed information for a specific invoice
 * GET /sales - retrieve all patient invoices (accepts ?q delimiter) 
 * GET /sales/:uuid - retrieve specific patient invoice 
 * GET /sales/patient/:uuid - retrieve all patient invoices for a specific patient
 * POST /sales - write a new sale 
 *
 * @returns Map exposing all methods used by the /sales API route
 *
 * @todo Factor in subsidies, this depends on price lists and billing services infrastructre 
 * @todo Credit note logic pending on clear design 
 */
var db = require('../../lib/db');
var uuid = require('../../lib/guid');

exports.list = list;
exports.details = details;
exports.create = create;

function list(req, res, next) { 

  // Retrieve all patient invoices 
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

  insertSaleLineQuery = 
    'INSERT INTO sale SET ?';

  transaction = db.transaction();
    
  // Insert sale line 
  transaction
    .addQuery(insertSaleLineQuery, [saleLineBody]);

  // Insert sale item lines

  console.log('recieved sale object', req.body);
  res.status(500).send('Not implemented');
}
