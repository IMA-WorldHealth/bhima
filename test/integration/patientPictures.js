/* global expect, chai, agent */

const helpers = require('./helpers');
const fs = require('fs');
const path = require('path');

const fixtures = path.resolve(__dirname, '../fixtures');

describe('(patients/:uuid/pictures) Patient Pictures', () => {
  'use strict';

  const patientUuid = '274c51ae-efcc-4238-98c6-f402bfb39866';

  it('POST /patients/:uuid/pictures should Set Picture to a patient', () => {
    return agent.post(`/patients/${patientUuid}/pictures`)
      .attach('pictures', fs.createReadStream(`${fixtures}/patient.png`))
      .then(function (res) {
        expect(res).to.have.status(200);
      })
      .catch(helpers.api.handler);
  });
});
