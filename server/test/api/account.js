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

describe('The /account API endpoint', function () {
  var agent = chai.request.agent(helpers.baseUrl);
  var newAccount = {
    //id : 1000,
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

  it(' A GET /accounts?full returns a list of accounts', function () {
    return agent.get('/accounts?full=1')
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.not.be.empty;
        expect(res.body).to.have.length(9);
      })
      .catch(helpers.handler);
  });

 it(' A GET /accounts returns a list of accounts', function () {
      return agent.get('/accounts')
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res.body).to.not.be.empty;
          expect(res.body).to.have.length(9);
         })
        .catch(helpers.handler);
    });

 it(' A GET /accounts?locked returns a list of accounts which is not locked', function () {
      return agent.get('/accounts?locked=0')
        .then(function (res) {
          var list = res.body.filter(function (item){return item.locked === 0;});
          expect(res).to.have.status(200);
          expect(res.body).to.not.be.empty;
          expect(res.body).to.deep.have.same.members(list);
         })
         .catch(helpers.handler);
    });

  it(' A GET /accounts/:id returns one account', function () {
    return agent.get('/accounts/'+ FETCHABLE_ACCOUNT_ID)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.not.be.empty;
        expect(res.body.id).to.be.equal(FETCHABLE_ACCOUNT_ID);
      })
       .catch(helpers.handler);
  });

  it('A POST /accounts will add a account', function () {
    return agent.post('/accounts')
      .send(newAccount)
      .then(function (res) {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        expect(res.body).to.not.be.empty;
        expect(res.body.id).to.be.defined;
        newAccount.id = res.body.id;
      })
     .catch(helpers.handler);
  }); 

  it('A PUT /accounts/:id will update the newly added profit center', function () {
  
    return agent.put('/accounts/'+ newAccount.id)
      .send({ account_txt : 'updated value for testing account' })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body.id).to.equal(newAccount.id);
        expect(res.body.account_txt).to.not.equal(newAccount.account_txt);

        // re-query the database
        return agent.get('/accounts/'+ newAccount.id);
      })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.not.be.empty;
      })
      .catch(helpers.handler);
  });    
});
