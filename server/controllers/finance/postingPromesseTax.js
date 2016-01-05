var q       = require('q');

var db      = require('./../../lib/db');
var parser  = require('./../../lib/parser');
var uuid    = require('./../../lib/guid');

var journal = require('./journal');

module.exports = function() {
  'use strict';

  function execute(data, userId, callback) {
    return writeToJournal(data.paiement_uuid, userId, data)
    .then(function(){
      var res = {};
      res.docId = data.paiement_uuid;
      callback(null, res);
    })
    .catch(function (err) {
      callback(err, null);
    });
  }

  function writeToJournal (id, userId, data) {
    var deferred = q.defer();
    journal.request('promesse_tax', id, userId, function (error, result) {
      if (error) {
        return deferred.reject(error);
      }
      return deferred.resolve(result);
    }, undefined, data);
    return deferred.promise;
  }
  return { execute : execute };
};
