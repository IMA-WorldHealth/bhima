'use strict';

const db = require('../lib/db');

function ReportControllerFactory(reportKey) {

  function list(req, res, next) {
    const sql = `
      SELECT uuid, label, type, paramenters, link, timestamp, user_id
      FROM report
      WHERE type = ?;
    `;

    db.exec(sql, [req.params.type])
      .then(rows => res.status(200).json(rows))
      .catch(next)
      .done();
  }

  function remove(req, res, next) {
    const sql = 'DELETE FROM report WHERE uuid = ?;';

    db.exec(sql, [db.bid(req.params.uuid)])
      .then(() => res.sendStatus(204))
      .catch(next)
      .done();
  }

  // return the controllers
  return {
    delete : remove,
    list : list
  };
}

module.exports = ReportControllerFactory;
