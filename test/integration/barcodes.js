'use strict';

/* global expect, chai, agent */

const helpers = require('./helpers');
const _ = require('lodash');

describe('(/barcode) Barcode Reverse Lookup', function () {
  let validPatientBarcode = 'PA81af634f';
  let invalidPatientBarcode = 'PAnotvalid';

  let invalidBarcodeType = 'ZZinvalidcode';

  it(`/barcode/:key looks up Patient for valid barcode key ${validPatientBarcode}`, function () {
    return agent.get(`/barcode/${validPatientBarcode}`)
      .then(function (res) {
        let patientKeys = ['uuid', 'debtor_uuid', 'display_name', 'hospital_no'];
        expect(res).to.have.status(200);
        expect(res).to.be.json;

        expect(res.body).to.contain.keys(patientKeys);
      })
      .catch(helpers.handler);
  });

  it('/barcode/invalid returns 404 for valid PA document type, invalid UUID', function () {
    return agent.get(`/barcode/${invalidPatientBarcode}`)
      .then(function (res) {
        helpers.api.errored(res, 404);
      });
  });

  it('/barcode/invalid returns 400 for an invalid barcode document code', function () {
    return agent.get(`/barcode/${invalidBarcodeType}`)
      .then(function (res) {
        helpers.api.errored(res, 400);
      });
  });
});
