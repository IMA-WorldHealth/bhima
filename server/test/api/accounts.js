/* jshint expr : true */
/* global describe, it, beforeEach */

var chai = require('chai');
var expect = chai.expect;

var helpers = require('./helpers');
helpers.configure(chai);

// cheeky method to duplicate an array
function clone(array) {
  return array.filter(function (element) { return 1; });
}

/** tests for the /accounts API endpoint */
describe('The account API, PATH : /accounts', function () {
  var agent = chai.request.agent(helpers.baseUrl);

  var newAccount = {
    type_id : 1,
    enterprise_id : 1,
    number : 4000400,
    label : 'Account for integration test',
    parent : 0,
    locked : 0,
    cc_id : null,
    pc_id : null,
    classe : 4,
    is_asset : 0,
    reference_id : null,
    is_brut_link : 0,
    is_charge : 0,
    is_title : 0
  };

  var DELETABLE_ACCOUNT_ID = 3636;
  var FETCHABLE_ACCOUNT_ID = 3626;
  var ACCOUNT_ID_FOR_BALANCE = 3631;

  var responseKeys = [
    'id', 'enterprise_id', 'locked', 'cc_id', 'pc_id', 'created', 'classe', 'is_asset',
    'reference_id', 'is_brut_link', 'is_charge', 'number',
    'label', 'parent', 'type_id', 'is_title', 'type'
  ];

    // login before each request
  beforeEach(helpers.login(agent));

  it('METHOD : GET, PATH : /accounts?full=1, It returns the full list of account', function () {
    return agent.get('/accounts?full=1')
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.not.be.empty;
        expect(res.body).to.have.length(10);
      })
      .catch(helpers.handler);
  });

  it('METHOD : GET, PATH : /accounts, It returns a simple list of account', function () {
    return agent.get('/accounts')
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.not.be.empty;
        expect(res.body).to.have.length(10);
       })
      .catch(helpers.handler);
   });

   it('METHOD : GET, PATH : /accounts?locked=0, It returns a list of unlocked accounts', function () {
      return agent.get('/accounts?locked=0')
      .then(function (res) {
        var list = res.body.filter(function (item) { return item.locked === 0; });
        expect(res).to.have.status(200);
        expect(res.body).to.not.be.empty;
        expect(res.body).to.deep.have.same.members(list);
      })
     .catch(helpers.handler);
    });


  it('GET /accounts returns the accounts in sorted order by number', function () {
    return agent.get('/accounts')
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;

        // clone the accounts for comparison
        var accounts = res.body;
        var sorted = clone(accounts);

        sorted.sort(function (a, b) {
          return a.number > b.number ? 1 : -1;
        });

        expect(accounts).to.deep.equal(sorted);
      })
      .catch(helpers.handler);
  });

  it('METHOD : GET, PATH : /accounts/:id, It returns one account', function () {
    return agent.get('/accounts/'+ FETCHABLE_ACCOUNT_ID)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.not.be.empty;
        expect(res.body).to.have.all.keys(responseKeys);

       expect(res.body.id).to.be.equal(FETCHABLE_ACCOUNT_ID);
      })
      .catch(helpers.handler);
  });

 it('METHOD : GET, PATH : /accounts/unknownId, It returns a 404 error', function () {
    return agent.get('/accounts/unknownId')
      .then(function (res) {
        expect(res).to.have.status(404);
        expect(res.body).to.contain.all.keys(helpers.errorKeys);
      })
      .catch(helpers.handler);
  });

 it('METHOD : GET, PATH : /accounts/:id/balance, It returns an object with zero as balance, debit and credit', function () {
   return agent.get('/accounts/:id/balance'.replace(':id', FETCHABLE_ACCOUNT_ID))
    .then(function (res){
      expect(res).to.have.status(200);
      expect(res).to.be.json;
      expect(res.body).to.not.be.empty;
      expect(res.body).to.have.all.keys('account_id', 'debit', 'credit', 'balance');
      expect(res.body.debit).to.equal(0);
      expect(res.body.credit).to.equal(0);
      expect(res.body.balance).to.equal(0);
    })
    .catch(helpers.handler);
 });

  
  it('METHOD : GET, PATH : /accounts/:id/balance?journal=1, It returns the balance of a provided account_id, scans the journal also', function () {
    return agent.get('/accounts/:id/balance?journal=1'.replace(':id', ACCOUNT_ID_FOR_BALANCE))
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.not.be.empty;
        expect(res.body).to.have.all.keys('account_id', 'debit', 'credit', 'balance');
        expect(res.body.debit).to.equal(75);
        expect(res.body.credit).to.equal(0);
        expect(res.body.balance).to.equal(75);
      })
      .catch(helpers.handler);
  });

  it('METHOD : POST, PATH : /accounts, It a adds an account', function () {
    return agent.post('/accounts')
      .send(newAccount)
      .then(function (res) {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        expect(res.body).to.not.be.empty;
        expect(res.body).to.have.all.keys('id');
        expect(res.body.id).to.be.defined;
        newAccount.id = res.body.id;
        return agent.get('/accounts/' + newAccount.id);
      })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.have.all.keys(responseKeys);
      })
     .catch(helpers.handler);
  });

  it('METHOD : PUT, PATH : /accounts/:id, It updates the newly added account', function () {
    var updateInfo = { label : 'updated value for testing account'};

    return agent.put('/accounts/'+ newAccount.id)
      .send(updateInfo)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body.id).to.equal(newAccount.id);
        expect(res.body.label).to.equal(updateInfo.label);
        expect(res.body).to.have.all.keys(responseKeys);
       })
      .catch(helpers.handler);
  });

 it('METHOD : PUT, PATH : /accounts/:unknown, It refuses to update the unknow entity', function () {
    var updateInfo = { label : 'updated value for testing account unknwon'};

    return agent.put('/accounts/undefined')
      .send(updateInfo)
      .then(function (res) {
        expect(res).to.have.status(404);
        expect(res).to.be.json;
      })
      .catch(helpers.handler);
  });
});
