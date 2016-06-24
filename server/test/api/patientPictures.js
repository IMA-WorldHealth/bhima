/* jshint expr:true */
/* jshint -W079 */
const chai = require('chai');
const expect = chai.expect;
const fs = require('fs');

const helpers = require('./helpers');
helpers.configure(chai);

describe('(patients/:uuid/pictures) Patient Pictures', () => {
  'use strict';

  const agent = chai.request.agent(helpers.baseUrl);
  before(helpers.login(agent));

  const patientUuid = '274c51ae-efcc-4238-98c6-f402bfb39866';

  it('POST /patients/:uuid/pictures should Set Picture to a patient', () => {
    return agent
      .post(`/patients/${patientUuid}/pictures`)

      .attach('pictures', fs.createReadStream(`${__dirname}/data/patient.png`))
      .then(function (res) {
        expect(res).to.have.status(200);
      })
      .catch(helpers.api.handler);
  });
});
