/* global expect, chai, agent */
/* jshint expr : true */

const helpers = require('./helpers');

describe('(/accounts/types) Account Types', function () {
  var newAccountType = {
    type : 'Test Account Type 1'
  };

  var DELETABLE_ACCOUNT_TYPE_ID = 3;
  var FETCHABLE_ACCOUNT_TYPE_ID = 1;
  var numAccountTypes = 4;


  it('GET /accounts/types returns a list of account type', function () {
    return agent.get('/accounts/types/')
      .then(function (res) {
        helpers.api.listed(res, numAccountTypes);
      })
      .catch(helpers.handler);
  });

  it('GET /accounts/types/:id returns one account type', function () {
    return agent.get('/accounts/types/'+ FETCHABLE_ACCOUNT_TYPE_ID)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.not.be.empty;
        expect(res.body.id).to.be.equal(FETCHABLE_ACCOUNT_TYPE_ID);
        expect(res.body).to.have.all.keys('id', 'type');
      })
     .catch(helpers.handler);
  });

  it('POST /accounts/types adds an account type', function () {
    return agent.post('/accounts/types')
      .send(newAccountType)
      .then(function (res) {
        helpers.api.created(res);
        newAccountType.id = res.body.id;
        return agent.get('/accounts/types/' + newAccountType.id);
      })
      .then(function (res) {
          expect(res).to.have.status(200);
          expect(res.body).to.have.all.keys('id', 'type');
      })
      .catch(helpers.handler);
  });

  it('PUT /accounts/types/:id updates the newly added account type', function () {
    var updateInfo = { type : 'updated value' };
    return agent.put('/accounts/types/' + newAccountType.id)
      .send(updateInfo)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body.id).to.equal(newAccountType.id);
        expect(res.body.type).to.equal(updateInfo.type);
      })
      .catch(helpers.handler);
  });

   /** @todo discuss business logic for deleting system account types */
   it.skip('DELETE /accounts/types/:id deletes a account type', function () {
    return agent.delete('/accounts/types/' + DELETABLE_ACCOUNT_TYPE_ID)
      .then(function (res) {
        helpers.api.deleted(res);
        return agent.get('/accounts/types/' + DELETABLE_ACCOUNT_TYPE_ID);
      })
      .then(function (res) {
        helpers.api.errored(res, 404);
      })
     .catch(helpers.handler);
  });
});
