/* global expect, agent */
/* eslint-disable no-unused-expressions */

const helpers = require('./helpers');

describe('(/barcode) Barcode Reverse Lookup', () => {
  const validPatientBarcode = 'PA81af634f';
  const invalidPatientBarcode = 'PAnotvalid';
  const validLotBarcode = 'LT064ab1d9';

  const invalidBarcodeType = 'ZZinvalidcode';

  it(`/barcode/:key looks up patient for valid barcode key ${validPatientBarcode}`, () => {
    return agent.get(`/barcode/${validPatientBarcode}`)
      .then((res) => {
        const patientKeys = ['uuid', 'debtor_uuid', 'display_name', 'hospital_no'];
        expect(res).to.have.status(200);
        expect(res).to.be.json;

        expect(res.body).to.contain.keys(patientKeys);
      })
      .catch(helpers.handler);
  });

  it(`/barcode/:key looks up a barcode for a lot ${validLotBarcode}`, () => {
    return agent.get(`/barcode/${validLotBarcode}`)
      .then((res) => {
        const lotKeys = ['uuid', 'label', 'code', 'text', 'expiration_date', 'unit_cost'];
        expect(res).to.have.status(200);
        expect(res).to.be.json;

        const lot = res.body;
        expect(lot).to.contain.keys(lotKeys);
        expect(lot.uuid).to.equal('064AB1D952464402AE8A958FCDB07B35');
      })
      .catch(helpers.handler);

  });

  it('/barcode/invalid returns 404 for valid PA document type, invalid UUID', () => {
    return agent.get(`/barcode/${invalidPatientBarcode}`)
      .then((res) => {
        helpers.api.errored(res, 404);
      });
  });

  it('/barcode/invalid returns 400 for an invalid barcode document code', () => {
    return agent.get(`/barcode/${invalidBarcodeType}`)
      .then((res) => {
        helpers.api.errored(res, 400);
      });
  });
});
