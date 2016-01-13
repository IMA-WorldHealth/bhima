// DEPRECIATED - TO BE REMOVED 
// -used to facilitate sale creation and posting before using an API-centric system 

var q = require('q');
var db = require('./../../lib/db');
var parser = require('./../../lib/parser');
var uuid = require('./../../lib/guid');
var journal = require('./journal');

/*
 * HTTP Controllers
*/

// FIXME Example of a legacy method - bad error handling, could easily hang
exports.execute = function (req, res, next) {
  initialiseSale(req.body, req.session.user.id, function (err, ans) {
    if (err) { return next(err); }
    res.send({saleId: ans});
  });
};

/*
 * Utility Methods
*/

//TODO Rollback logic can be implemented by sharing a transaction instance
//(db.requestTransactionConnection) across multiple modules: generic top level
//rollback.
function initialiseSale(saleData, userId, callback) {
  var saleRecord = saleData.sale;
  var saleItems = saleData.saleItems;
  var saleApplyableSubsidies = saleData.applyableSaleSubsidies;

  if(!(saleRecord && saleItems)) {
    return callback(null, new Error('[createSale] Required data is invalid'));
  }
  saleRecord.uuid = uuid();
  saleRecord.reference = 1; // FIXME required reference hack

  submitSaleRecords(saleRecord, saleItems, saleApplyableSubsidies, userId)
  .then(function () {
    return submitSaleJournal(saleRecord.uuid, saleData.caution, userId);
  })
  .then(function () {
    callback(null, saleRecord.uuid);
  })
  .catch(function (error) {
    callback(error, null);
  });
}

/*
 // FIXME: PATCH AT PAX
function submitSaleRecords(saleRecord, saleItems, userId) {
  var querries = [
    generateSaleRecord(saleRecord, userId),
    generateSaleItems(saleRecord.uuid, saleItems)
  ];

  return db.executeAsTransaction(querries);
}
*/

function submitSaleRecords(saleRecord, saleItems, saleApplyableSubsidies, userId) {

  return db.exec(generateSaleRecord(saleRecord, userId))
  .then(function (res) {
    return db.exec(generateSaleItems(saleRecord.uuid, saleItems));
  })
  .then(function (res) {
    if (saleApplyableSubsidies.length){
      return db.exec(generateSubsidies(saleRecord, saleApplyableSubsidies));
    }else{
      return q();
    }
  });
}

function submitSaleJournal(saleRecordId, caution, userId) {
  var deferred = q.defer();

  journal.request('sale', saleRecordId, userId, function (error, result) {
    if (error) {
      return deferred.reject(error);
    }
    return deferred.resolve(result);
  }, caution);
  return deferred.promise;
}

function generateSaleRecord(saleRecord, userId) {
  saleRecord.seller_id = userId;
  return parser.insert('sale', [saleRecord]);
}

function generateSaleItems(saleRecordId, saleItems) {
  saleItems.forEach(function(saleItem) {
    saleItem.uuid = uuid();
    saleItem.sale_uuid = saleRecordId;
  });
  return parser.insert('sale_item', saleItems);
}

function generateSubsidies(saleRecord, saleApplyableSubsidies) {

  var saleApplyableSubsidiesSorted = saleApplyableSubsidies.sort(function (a, b){
    return b.value-a.value;
  });

  var currentCost = saleRecord.cost;

  var subsidyList = saleApplyableSubsidiesSorted.map(function (item) {
    var amount;
    if(currentCost === 0) {
      amount = 0;
      return  {uuid : uuid(), sale_uuid : saleRecord.uuid, subsidy_uuid : item.uuid, value : amount};
    }else{
      if(currentCost - item.value >= 0){
        amount = item.value;
      }else{
        amount = currentCost;
      }
      currentCost = currentCost - amount;
      return {uuid : uuid(), sale_uuid : saleRecord.uuid, subsidy_uuid : item.uuid, value : amount};
    }
  });

  var saleSubsidies = subsidyList.filter(function (item){
    return item.value > 0;
  });
  return parser.insert('sale_subsidy', saleSubsidies);
}
