/*global describe, it, beforeEach, process*/

var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = chai.expect;
chai.use(chaiHttp);

if (!global.Promise) {
  var q = require('q');
  chai.request.addPromises(q.Promise);
}

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

var url = 'https://localhost:8080';
var user = { username : 'superuser', password : 'superuser', project: 1};

describe('The /account API endpoint', function () {
  var agent = chai.request.agent(url);
  var new_account = {
    id : 1000,
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

  var deletable_account = {
    id : 3636
  };

  var fecthable_account = {
    id : 3626
  };

  // throw errors
  function handler(err) { throw err; }

  // login before each request
  beforeEach(function () {
    return agent
      .post('/login')
      .send(user);
  });

  it(' A GET /accounts returns a list of accounts', function () {
    return agent.get('/accounts/detailed')
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.not.be.empty;
        expect(res.body).to.have.length(8);
      })
      .catch(handler);
  });

  it(' A GET /account/:id returns one account', function () {
    return agent.get('/account/'+ fecthable_account.id)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.not.be.empty;
        expect(res.body).to.have.length(1);
      })
      .catch(handler);
  });

  it('A POST /accounts will add a cost center', function () {
    return agent.post('/accounts')
      .send(new_account)
      .then(function (res) {
        expect(res).to.have.status(201);
        new_account.id = res.body.id;
      })
      .catch(handler);
  }); 

  it('A PUT /accounts/:id will update the newly added profit center', function () {
    this.timeout(60000);
    return agent.put('/accounts/'+ new_account.id)
      .send({ account_txt : 'updated value for testing account' })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body.id).to.equal(new_account.id);
        expect(res.body.account_txt).to.not.equal(new_account.account_txt);

        // re-query the database
        return agent.get('/account/'+ new_account.id);
      })
      .then(function (res) {
        expect(res).to.have.status(200);
      })
      .catch(handler);
  });    
});
