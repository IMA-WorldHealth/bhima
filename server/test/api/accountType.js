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

describe('The /account_type API endpoint', function () {
  var agent = chai.request.agent(url);
  var new_account_type = {
    id : 4,
    type : 'test account type 1'
  };


  var DELETABLE_ACCOUNT_TYPE_ID = 3;
  var FETCHABLE_ACCOUNT_TYPE_ID = 1;

  // throw errors
  function handler(err) { throw err; }

  // login before each request
  beforeEach(function () {
    return agent
      .post('/login')
      .send(user);
  });

  it(' A GET /account_types returns a list of account type', function () {
    return agent.get('/account_types')
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.not.be.empty;
        expect(res.body).to.have.length(2);
      })
      .catch(handler);
  });

  it(' A GET /account_types/:id returns one account type', function () {
    return agent.get('/account_types/'+ FETCHABLE_ACCOUNT_TYPE_ID)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.not.be.empty;
        expect(res.body).to.have.length(1);
      })
      .catch(handler);
  });

  it('A POST /account_types will add an account_type', function () {
    return agent.post('/account_types')
      .send(new_account_type)
      .then(function (res) {
        expect(res).to.have.status(201);
        new_account_type.id = res.body.id;
      })
      .catch(handler);
  }); 

  it('A PUT /account_types/:id will update the newly added account_type', function () {
    return agent.put('/account_types/'+ 4)
      .send({ type : 'updated value' })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body.id).to.equal(new_account_type.id);
        expect(res.body.position).to.not.equal(new_account_type.type);

        // re-query the database
        return agent.get('/account_types/'+ new_account_type.id);
      })
      .then(function (res) {
        expect(res).to.have.status(200);
      })
      .catch(handler);
  });

   it(' A DELETE /account_types/:id will delete a account_type', function () {
    this.timeout(60000);
    return agent.delete('/account_types/' + DELETABLE_ACCOUNT_TYPE_ID)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;

        // re-query the database
        return agent.get('/account_types/' + DELETABLE_ACCOUNT_TYPE_ID);
      })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.have.length(0);
      })
      .catch(handler);
  });  
});
