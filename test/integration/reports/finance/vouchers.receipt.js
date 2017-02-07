/* global expect, chai, agent */
/* jshint expr : true */

const helpers = require('../../helpers');
const RenderingTests = require('../rendering');

const target = '/reports/finance/vouchers/';

describe(`(${target}) Voucher Receipt`, function () {

  const validVoucher = 'a5a5f950-a4c9-47f0-9a9a-2bfc3123e534';

  // set up the rendering test suite and execute it
  const suite = RenderingTests(target + validVoucher);
  suite();

  // known data for requests and assertions
  const invalidVoucher      = 'unknown';

  it(`GET ${target}:uuid should return JSON data for a valid voucher uuid`, function () {
    return agent.get(target.concat(validVoucher))
      .query({ renderer : 'json' })
      .then(function (result) {
        expect(result).to.have.status(200);
        expect(result).to.be.json;
      })
      .catch(helpers.handler);
  });

  it(`GET ${target}:uuid should return not found for invalid uuid`, function () {
    return agent.get(target.concat(invalidVoucher))
      .then(function (result) {
        helpers.api.errored(result, 404);
      })
      .catch(helpers.handler);
  });
});
