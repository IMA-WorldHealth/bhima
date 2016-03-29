/* jshint expr:true */
var chai = require('chai');
var expect = chai.expect;

var helpers = require('./helpers');
helpers.configure(chai);

describe('(/account_types) The account types API', function () {
  var agent = chai.request.agent(helpers.baseUrl);
  var newAccountType = {
    type : 'test account type 1'
  };

  var DELETABLE_ACCOUNT_TYPE_ID = 3;
  var FETCHABLE_ACCOUNT_TYPE_ID = 1;

  /** @const */
  var numAccountTypes = 2;

  // logs the client into the app
  before(helpers.login(agent));

  it('GET /account_types returns a list of account type', function () {
    return agent.get('/account_types')
      .then(function (res) {
        helpers.api.listed(res, 2);
      })
      .catch(helpers.handler);
  });

  it('GET /account_types/:id returns one account type', function () {
    return agent.get('/account_types/'+ FETCHABLE_ACCOUNT_TYPE_ID)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.not.be.empty;
        expect(res.body.id).to.be.equal(FETCHABLE_ACCOUNT_TYPE_ID);
        expect(res.body).to.have.all.keys('id', 'type');
      })
     .catch(helpers.handler);
  });

  it('POST /account_types adds an account type', function () {
    return agent.post('/account_types')
      .send(newAccountType)
      .then(function (res) {
        helpers.api.created(res);
        newAccountType.id = res.body.id;
        return agent.get('/account_types/' + newAccountType.id);
      })
      .then(function (res) {
          expect(res).to.have.status(200);
          expect(res.body).to.have.all.keys('id', 'type');
      })
      .catch(helpers.handler);
  });

  it('PUT /account_types/:id updates the newly added account type', function () {
    var updateInfo = { type : 'updated value' };
    return agent.put('/account_types/' + newAccountType.id)
      .send(updateInfo)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body.id).to.equal(newAccountType.id);
        expect(res.body.type).to.equal(updateInfo.type);
      })
      .catch(helpers.handler);
  });

   it('DELETE /account_types/:id deletes a account type', function () {
    return agent.delete('/account_types/' + DELETABLE_ACCOUNT_TYPE_ID)
      .then(function (res) {
        helpers.api.deleted(res);
        return agent.get('/account_types/' + DELETABLE_ACCOUNT_TYPE_ID);
      })
      .then(function (res) {
        helpers.api.errored(res, 404);
      })
     .catch(helpers.handler);
  });
});
