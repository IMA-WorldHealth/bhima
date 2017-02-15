var q       = require('q');
var db      = require('./../../lib/db');
var parser  = require('./../../lib/parser');
var uuid    = require('node-uuid');

var journal = require('./journal');

module.exports = function() {

  function execute(data, userId, callback) {
    return writePrimary(data.primary)
      .then(function () {
        return writeItem(data.primary_details);
      })
      .then(function () {
        return writeToJournal(data.primary.uuid, userId, data.other);
      })
      .then(function(){
        var res = {};
        callback(null, res);
      })
      .catch(function (err) {
        callback(err, null);
      });
  }

  function writePrimary (primary) {
    return db.exec(generate ('primary_cash', [primary]));
  }

  function writeItem (details) {
    return db.exec(generate ('primary_cash_item', [details]));
  }

  function writeToJournal (id, userId, details) {
    var deferred = q.defer();
    journal.request('cotisation_payment', id, userId, function (error, result) {
      if (error) {
        return deferred.reject(error);
      }
      return deferred.resolve(result);
    }, undefined, details);
    return deferred.promise;
  }

  function generate (table, data) {
    return parser.insert(table, data);
  }
  return { execute : execute };
};
