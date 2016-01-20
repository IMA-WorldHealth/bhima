/*global describe, it, beforeEach, process*/

var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = chai.expect;
chai.use(chaiHttp);

var helpers = require('./helpers');
helpers.configure(chai);

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

var url = 'https://localhost:8080';
var user = { username : 'superuser', password : 'superuser', project: 1};

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
  
    // login before each request
  beforeEach(helpers.login(agent));

  it('METHOD : GET, PATH : /accounts?full=1, It returns the full list of account' , function () {
    return agent.get('/accounts?full=1')
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.not.be.empty;
        expect(res.body).to.have.length(9);
      })
      .catch(helpers.handler);
  });

 it('METHOD : GET, PATH : /accounts, It returns a simple list of account', function () {
      return agent.get('/accounts')
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.not.be.empty;
          expect(res.body).to.have.length(9);
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

  it('METHOD : GET, PATH : /accounts/:id, It returns one account', function () {
    return agent.get('/accounts/'+ FETCHABLE_ACCOUNT_ID)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.not.be.empty;
        expect(res.body)
        .to.have.all.keys('id', 'enterprise_id', 'locked', 'cc_id', 'pc_id', 'created', 'classe', 'is_asset',
                          'reference_id', 'is_brut_link', 'is_used_budget', 'is_charge', 'account_number',
                          'account_txt', 'parent', 'account_type_id', 'is_title', 'type');
       
       expect(res.body.id).to.be.equal(FETCHABLE_ACCOUNT_ID);
      })
      .catch(helpers.handler);
  });

 it('METHOD : GET, PATH : /accounts/unknownId, It returns a 404 error', function () {
    return agent.get('/accounts/unknownId')
      .then(function (res) {
        expect(res).to.have.status(404);
        expect(res.body).to.have.all.keys('code', 'httpStatus', 'reason');
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
        expect(res.body)
        .to.have.all.keys('id', 'enterprise_id', 'locked', 'cc_id', 'pc_id', 'created', 'classe', 'is_asset',
                          'reference_id', 'is_brut_link', 'is_used_budget', 'is_charge', 'account_number',
                          'account_txt', 'parent', 'account_type_id', 'is_title', 'type');

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
        expect(res.body)
        .to.have.all.keys('id', 'enterprise_id', 'locked', 'cc_id', 'pc_id', 'created', 'classe', 'is_asset',
                          'reference_id', 'is_brut_link', 'is_used_budget', 'is_charge', 'account_number',
                          'account_txt', 'parent', 'account_type_id', 'is_title', 'type');

       })
      .catch(helpers.handler);
  });

 it('METHOD : PUT, PATH : /accounts/:unknown, It refuses to update the unknow entity', function () {
    var updateInfo = { account_txt : 'updated value for testing account unknwon'};
  
    return agent.put('/accounts/undefined')
      .send(updateInfo)
      .then(function (res) {
        expect(res).to.have.status(404);
        expect(res).to.be.json;
      })
      .catch(helpers.handler);
  });    
});
