var parser = require('./../../lib/parser');
var uuid = require('node-uuid');
var db = require('./../../lib/db');
var sanitize = require('./../../lib/sanitize');
var journal = require('./journal');

var q = require('q');

// HTTP Controller
exports.availablePaymentPeriod = function (req, res, next) {
  var sql =
    'SELECT p.id, p.config_tax_id, p.config_rubric_id, p.config_accounting_id, p.config_cotisation_id, p.label, p.dateFrom, p.dateTo, r.label AS RUBRIC, t.label AS TAX, a.label AS ACCOUNT, c.label AS COTISATION FROM paiement_period p, config_rubric r, config_tax t, config_accounting a, config_cotisation c WHERE p.config_tax_id = t.id AND p.config_rubric_id = r.id AND a.id=p.config_accounting_id AND p.config_cotisation_id = c.id ORDER BY p.id DESC';
  db.exec(sql)
  .then(function (result) {
    res.send(result);
  })
  .catch(function (err) { next(err); })
  .done();
};

exports.submit = function (req, res, next) {

  // FIXME Hack to not break everything during categorisation
  requestPayment().execute(req.body, req.session.user.id, function (err, ans) {
    if (err) { return next(err); }
    res.send({resp: ans});
  });
};

exports.setTaxPayment = function (req, res, next) {
  var sql = 'UPDATE tax_paiement SET posted = 1 ' +
            'WHERE tax_paiement.paiement_uuid=' + sanitize.escape(req.body.paiement_uuid) + ' AND tax_paiement.tax_id=' + sanitize.escape(req.body.tax_id);

  db.exec(sql)
  .then(function (result) {
    res.send(result);
  })
  .catch(function (err) { next(err); })
  .done();
};

function requestPayment () {
  'use strict';

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
    journal.request('tax_payment', id, userId, function (error, result) {
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
}
