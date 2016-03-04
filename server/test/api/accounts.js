/* jshint expr : true */

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
    account_type_id : 1,
    enterprise_id : 1,
    account_number : 4000400,
    account_txt : 'Account for integration test',
    parent : 0,
    locked : 0,
    cc_id : null,
    pc_id : null,
    classe : 4,
    is_asset : 0,
    reference_id : null,
    is_brut_link : 0,
    is_used_budget : 0,
    is_charge : 0,
    is_title : 0
  };

  var DELETABLE_ACCOUNT_ID = 3636;
  var FETCHABLE_ACCOUNT_ID = 3626;

  var responseKeys = [
    'id', 'enterprise_id', 'locked', 'cc_id', 'pc_id', 'created', 'classe', 'is_asset',
    'reference_id', 'is_brut_link', 'is_used_budget', 'is_charge', 'account_number',
    'account_txt', 'parent', 'account_type_id', 'is_title', 'type'
  ];

    // login before each request
  beforeEach(helpers.login(agent));

  it('METHOD : GET, PATH : /accounts?full=1, It returns the full list of account' , function () {
    return agent.get('/accounts?full=1')
      .then(function (res) {
        helpers.api.listed(res, 10);
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


  it('GET /accounts returns the accounts in sorted order by account_number', function () {
    return agent.get('/accounts')
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;

        // clone the accounts for comparison
        var accounts = res.body;
        var sorted = clone(accounts);

        sorted.sort(function (a, b) {
          return a.account_number > b.account_number ? 1 : -1;
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
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });


  it('METHOD : POST, PATH : /accounts, It a adds an account', function () {
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

  it('METHOD : PUT, PATH : /accounts/:id, It updates the newly added account', function () {
    var updateInfo = { account_txt : 'updated value for testing account'};

    return agent.put('/accounts/'+ newAccount.id)
      .send(updateInfo)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body.id).to.equal(newAccount.id);
        expect(res.body.account_txt).to.equal(updateInfo.account_txt);
        expect(res.body).to.have.all.keys(responseKeys);
       })
      .catch(helpers.handler);
  });

 it('METHOD : PUT, PATH : /accounts/:unknown, It refuses to update the unknow entity', function () {
    var updateInfo = { account_txt : 'updated value for testing account unknwon'};

    return agent.put('/accounts/undefined')
      .send(updateInfo)
      .then(function (res) {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });
});
