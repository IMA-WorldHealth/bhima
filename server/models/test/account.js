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
    account_number : 4000400
    account_txt : 'Account for integration test',
    parent : NULL,
    locked : 0,
    cc_id : NULL,
    pc_id : NULL,
    classe : 4,
    is_asset : 0,
    reference_id : NULL,
    is_brut_link : 0,
    is_used_budget : 0,
    is_charge : 0,
    is_title : 0
  };

  var deletable_account = {
    id : 2
  };

  var fecthable_account = {
    id : 1
  };

  // throw errors
  function handler(err) { throw err; }

  // login before each request
  beforeEach(function () {
    return agent
      .post('/login')
      .send(user);
  });

  it(' A GET /accounts returns a list of profit centers', function () {
    return agent.get('/accounts/detailed')
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.not.be.empty;
        expect(res.body).to.have.length(2);
      })
      .catch(handler);
  });

  it(' A GET /account/:id returns one profit center', function () {
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
    return agent.put('/accounts/'+ 200)
      .send({ note : 'updated value for note' })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body.id).to.equal(new_account.id);
        expect(res.body.note).to.not.equal(new_account.note);

        // re-query the database
        return agent.get('/account/'+ new_account.id);
      })
      .then(function (res) {
        expect(res).to.have.status(200);
      })
      .catch(handler);
  });

   it(' A DELETE /accounts/:id will delete a account', function () {
    return agent.delete('/accounts/' + deletable_account.id)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;

        // re-query the database
        return agent.get('/account/' + deletable_account.id);
      })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.have.length(0);
      })
      .catch(handler);
  });  
});
