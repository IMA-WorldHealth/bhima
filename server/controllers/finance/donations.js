var journal = require('./journal');

var db = require('../../lib/db');
var q = require('q');

exports.post = function (req, res, next) {

  // FIXME Hack to not disrupt workflow during categorisation
  requestDonations().execute(req.body, req.session.user.id, function (err, ans) {
    if (err) { return next(err); }
    res.send({resp: ans});
  });
};

/*
* GET /donations?limit=10
*
* Returns a list of the top donors by quantity
*/
exports.getRecentDonations = function(req, res, next) {
  'use strict';

  // FIXME - why was this sent as a string?
  var sql, limit = req.query.limit ? Number(req.query.limit) : 10;

  sql =
    'SELECT donations.uuid, donor.name AS donorname, donations.date, COUNT(donation_item.tracking_number) AS items ' +
    'FROM donations JOIN donation_item JOIN donor ON ' +
      'donor.id = donations.donor_id AND ' +
      'donations.uuid = donation_item.donation_uuid ' +
    'GROUP BY donations.uuid ' +
    'ORDER BY items DESC ' +
    'LIMIT ?;';

  db.exec(sql, [limit])
  .then(function (rows) {
    res.status(200).send(rows);
  })
  .catch(next)
  .done();
};

function requestDonations() {
  'use strict';

  function execute(data, userId, callback) {
    return writeToJournal(data.movement.document_id, userId, data)
    .then(function(){
      var res = {};
      res.docId = data.movement.document_id;
      callback(null, res);
    })
    .catch(function (err) {
      callback(err, null);
    });
  }

  // FIXME -- make this much clearer
  function writeToJournal (id, userId, data) {
    var deferred = q.defer();
    journal.request('donation', id, userId, function (error, result) {
      if (error) {
        return deferred.reject(error);
      }
      return deferred.resolve(result);
    }, undefined, data);
    return deferred.promise;
  }
  return { execute : execute };
}
