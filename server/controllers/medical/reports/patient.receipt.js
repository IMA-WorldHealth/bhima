var Patients = require ('../patients');
var path = require('path');
var _ = require('lodash');

var BadRequest = require('../../../lib/errors/BadRequest');

var supportedRender = {};
supportedRender.json = require('../../../lib/renderers/json');
supportedRender.html = require('../../../lib/renderers/html');
supportedRender.pdf = require('../../../lib/renderers/pdf');

var defaultRender = 'json';

var template = path.normalize('./server/controllers/medical/reports/patient.receipt.handlebars');

/* @todo these can be overridden given the clients request if required */
var receiptOptions = {
  pageSize : 'A6',
  orientation : 'landscape'
};

exports.build = build;

function build(req, res, next) {
  var queryString = req.query;
  var patientID = req.params.uuid;

  var renderTarget = queryString.renderer || defaultRender;
  var renderer = supportedRender[renderTarget];

  if (_.isUndefined(renderer)) {
    throw new BadRequest('Render target provided is invalid or not supported by this report '.concat(renderTarget));
  }

  Patients.lookupPatient(patientID)
    .then(function (patient) {
      return renderer.render({ patient }, template, receiptOptions);
    })
    .then(function (result) {

      res.set(renderer.headers).send(result);
    })
    .catch(next)
    .done();
}
