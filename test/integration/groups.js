/* global expect, chai, agent */

const helpers = require('./helpers');

describe('(/groups) Group subscriptions API', function () {
  'use strict';

  let invalidKey = 'notakey';
  let validKey = 'debtor_group_billing_service';

  // debtor group id
  let validEntity = '4de0fe47-177f-4d30-b95f-cff8166400b4';

  // billing service ids
  let validSubscriptions = {
    1 : true,
    2 : true
  };

  it('POST /groups/:key/:id rejects an invalid key', function () {
    return agent.post(`/groups/${invalidKey}/id`)
      .send(validSubscriptions)
      .then(function (result) {
        helpers.api.errored(result, 400, 'ERROR.INVALID_REQUEST');
      });
  });

  it('POST /groups/:key/:id rejects a requst with valid key and no subscriptions', function () {
    return agent.post(`/groups/${validKey}/${validEntity}`)
      .send({})
      .then(function (result) {
        helpers.api.errored(result, 400, 'ERROR.ERR_MISSING_INFO');
      });
  });

  it('POST /groups/:key/:id updates group subscriptions with valid request', function () {
    // determine how many subscriptions should be affected
    let trueSubscriptions = [];
    Object.keys(validSubscriptions).forEach(function (key) {
      if (validSubscriptions[key]) { trueSubscriptions.push(key); }
    });

    return agent.post(`/groups/${validKey}/${validEntity}`)
      .send({ subscriptions : validSubscriptions })
      .then(function (result) {
        expect(result).to.have.status(200);
        expect(result.body).to.not.be.empty;
        expect(result.body[1].affectedRows).to.equal(trueSubscriptions.length);
      });
  });
});


