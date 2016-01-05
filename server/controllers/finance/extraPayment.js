var db = require('./../../lib/db'),
    journal = require('./journal');

/*
 * HTTP Controller
*/
exports.handleExtraPayment = function (req, res, next) {
  'use strict';
  var data = req.body.params;
  var user_id = data.user_id,
      sale_id = data.sale_uuid,
      details = data.details;

  journal.request('extra_payment', sale_id, user_id, function (error, result) {
    if (error) {
      throw new Error('error::: ', error);
    }
    res.sendStatus(200);
  }, undefined, details);
};
