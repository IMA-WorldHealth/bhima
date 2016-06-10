// DEPRECIATED - TO BE REMOVED 
// -used to facilitate invoice creation and posting before using an API-centric system

var q = require('q');
var db = require('./../../lib/db');
var parser = require('./../../lib/parser');
var uuid = require('node-uuid');
var journal = require('./journal');

/*
 * HTTP Controllers
*/

// FIXME Example of a legacy method - bad error handling, could easily hang
exports.execute = function (req, res, next) {
  initialiseInvoice(req.body, req.session.user.id, function (err, ans) {
    if (err) { return next(err); }
    res.send({invoiceId: ans});
  });
};

/*
 * Utility Methods
*/

//TODO Rollback logic can be implemented by sharing a transaction instance
//(db.requestTransactionConnection) across multiple modules: generic top level
//rollback.
function initialiseInvoice(invoiceData, userId, callback) {
  var invoiceRecord = invoiceData.invoice;
  var invoiceItems = invoiceData.invoiceItems;
  var invoiceApplyableSubsidies = invoiceData.applyableInvoiceSubsidies;

  if(!(invoiceRecord && invoiceItems)) {
    return callback(null, new Error('[createInvoice] Required data is invalid'));
  }
  invoiceRecord.uuid = uuid();
  invoiceRecord.reference = 1; // FIXME required reference hack

  submitInvoiceRecords(invoiceRecord, invoiceItems, invoiceApplyableSubsidies, userId)
  .then(function () {
    return submitInvoiceJournal(invoiceRecord.uuid, invoiceData.caution, userId);
  })
  .then(function () {
    callback(null, invoiceRecord.uuid);
  })
  .catch(function (error) {
    callback(error, null);
  });
}

/*
 // FIXME: PATCH AT PAX
function submitInvoiceRecords(invoiceRecord, invoiceItems, userId) {
  var querries = [
    generateInvoiceRecord(invoiceRecord, userId),
    generateInvoiceItems(invoiceRecord.uuid, invoiceItems)
  ];

  return db.executeAsTransaction(querries);
}
*/

function submitInvoiceRecords(invoiceRecord, invoiceItems, invoiceApplyableSubsidies, userId) {

  return db.exec(generateInvoiceRecord(invoiceRecord, userId))
  .then(function (res) {
    return db.exec(generateInvoiceItems(invoiceRecord.uuid, invoiceItems));
  })
  .then(function (res) {
    if (invoiceApplyableSubsidies.length){
      return db.exec(generateSubsidies(invoiceRecord, invoiceApplyableSubsidies));
    }else{
      return q();
    }
  });
}

function submitInvoiceJournal(invoiceRecordId, caution, userId) {
  var deferred = q.defer();

  journal.request('invoice', invoiceRecordId, userId, function (error, result) {
    if (error) {
      return deferred.reject(error);
    }
    return deferred.resolve(result);
  }, caution);
  return deferred.promise;
}

function generateInvoiceRecord(invoiceRecord, userId) {
  invoiceRecord.seller_id = userId;
  return parser.insert('invoice', [invoiceRecord]);
}

function generateInvoiceItems(invoiceRecordId, invoiceItems) {
  invoiceItems.forEach(function(invoiceItem) {
    invoiceItem.uuid = uuid();
    invoiceItem.invoice_uuid = invoiceRecordId;
  });
  return parser.insert('invoice_item', invoiceItems);
}

function generateSubsidies(invoiceRecord, invoiceApplyableSubsidies) {

  var invoiceApplyableSubsidiesSorted = invoiceApplyableSubsidies.sort(function (a, b){
    return b.value-a.value;
  });

  var currentCost = invoiceRecord.cost;

  var subsidyList = invoiceApplyableSubsidiesSorted.map(function (item) {
    var amount;
    if(currentCost === 0) {
      amount = 0;
      return  {uuid : uuid(), invoice_uuid : invoiceRecord.uuid, subsidy_uuid : item.uuid, value : amount};
    }else{
      if(currentCost - item.value >= 0){
        amount = item.value;
      }else{
        amount = currentCost;
      }
      currentCost = currentCost - amount;
      return {uuid : uuid(), invoice_uuid : invoiceRecord.uuid, subsidy_uuid : item.uuid, value : amount};
    }
  });

  var invoiceSubsidies = subsidyList.filter(function (item){
    return item.value > 0;
  });
  return parser.insert('invoice_subsidy', invoiceSubsidies);
}
