var db = require('./../../lib/db');



function healthZones (req, res, next) {
  var sql = 'SELECT id, zone, territoire, province FROM mod_snis_zs';

  db.exec(sql)
  .then(function (rows) {
    res.status(200).json(rows);
  })
  .catch(next)
  .done();
}


// Expose
module.exports = {
    healthZones   	: healthZones
};
