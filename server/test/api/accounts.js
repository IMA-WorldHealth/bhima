/* global expect, chai, agent */
/* jshint expr : true */

const helpers = require('./helpers');

// cheeky method to duplicate an array
function clone(array) {
  return array.filter(() => true);
}

describe('(/accounts) Accounts', function () {
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
  var balanceAccountId = 3631;

  const responseKeys = [
    'id', 'enterprise_id', 'locked', 'cc_id', 'pc_id', 'created', 'classe', 'is_asset',
    'reference_id', 'is_brut_link', 'is_charge', 'number',
    'label', 'parent', 'type_id', 'is_title', 'type'
  ];

  it('GET /accounts?detailed=1 returns the full list of account', function () {
    return agent.get('/accounts?detailed=1')
      .then(function (res) {
        helpers.api.listed(res, 14);
      })
      .catch(helpers.handler);
  });

  it('GET /accounts returns a simple list of account', function () {
    return agent.get('/accounts')
      .then(function (res) {
        helpers.api.listed(res, 14);
      })
      .catch(helpers.handler);
   });

   it('GET /accounts?locked=0 returns a list of unlocked accounts', function () {
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

  it('GET /accounts/:id returns one account', function () {
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

  it('GET /accounts/:id returns a 404 error for unknown id', function () {
    return agent.get('/accounts/unknown')
      .then(function (res) {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('GET /accounts/:id/balance returns an object with zero as balance, debit and credit', function () {
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

  it('GET /accounts/:id/balance?journal=1 returns the balance of a provided account_id, scans the journal also', function () {
    return agent.get('/accounts/:id/balance?journal=1'.replace(':id', balanceAccountId))
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.not.be.empty;
        expect(res.body).to.have.all.keys('account_id', 'debit', 'credit', 'balance');
        expect(res.body.debit).to.equal(100);
        expect(res.body.credit).to.equal(0);
        expect(res.body.balance).to.equal(75);
      })
      .catch(helpers.handler);
  });

  it('POST /accounts a adds an account', function () {
    return agent.post('/accounts')
      .send(newAccount)
      .then(function (res) {
        helpers.api.created(res);
        newAccount.id = res.body.id;
        return agent.get('/accounts/' + newAccount.id);
      })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.have.all.keys(responseKeys);
      })
     .catch(helpers.handler);
  });

  it('PUT /accounts/:id updates the newly added account', function () {
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

  it('PUT /accounts/:id returns a 404 for unknown account id', function () {
    var updateInfo = { label : 'updated value for testing account unknown '};
    return agent.put('/accounts/undefined')
      .send(updateInfo)
      .then(function (res) {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });
});
