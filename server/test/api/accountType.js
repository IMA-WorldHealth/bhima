/* global describe, it, beforeEach */

var chai = require('chai');
var expect = chai.expect;

var helpers = require('./helpers');
helpers.configure(chai);

describe('The account types API, PATH : /account_types', function () {
  var agent = chai.request.agent(helpers.baseUrl);
  var newAccountType = {
    type : 'test account type 1'
  };

  var DELETABLE_ACCOUNT_TYPE_ID = 3;
  var FETCHABLE_ACCOUNT_TYPE_ID = 1;

  // login before each request
  beforeEach(helpers.login(agent));

  it('METHOD : GET, PATH : /account_types, It returns a list of account type', function () {
    return agent.get('/account_types')
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.not.be.empty;
        expect(res.body).to.have.length(2);
      })
      .catch(helpers.handler);
  });

  it('METHOD : GET, PATH : /account_types/:id, It returns one account type', function () {
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

  it('METHOD : POST, PATH : /account_types, It adds an account_type', function () {
    return agent.post('/account_types')
      .send(newAccountType)
      .then(function (res) {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        expect(res.body).to.not.be.empty;
        expect(res.body.id).to.be.defined;
        newAccountType.id = res.body.id;
        return agent.get('/account_types/' + newAccountType.id);
      })
      .then(function (res) {
          expect(res).to.have.status(200);
          expect(res.body).to.have.all.keys('id', 'type');
      })
      .catch(helpers.handler);
  });

  it('METHOD : PUT, PATH : /account_types/:id, It updates the newly added account_type', function () {
    var updateInfo = {type : 'updated value' };
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

   it('METHOD : DELETE, PATH : /account_types/:id, It deletes a account_type', function () {
    return agent.delete('/account_types/' + DELETABLE_ACCOUNT_TYPE_ID)
      .then(function (res) {
        expect(res).to.have.status(204);
        // re-query the database
        return agent.get('/account_types/' + DELETABLE_ACCOUNT_TYPE_ID);
      })
      .then(function (res) {
        expect(res).to.have.status(404);
      })
     .catch(helpers.handler);
  });
});
