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

describe('The /account_types API endpoint', function () {
  var agent = chai.request.agent(url);
  var newAccountType = {
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
        expect(res.body.id).to.be.equal(FETCHABLE_ACCOUNT_TYPE_ID);

      })
      .catch(handler);
  });

  it('A POST /account_types will add an account_type', function () {
    return agent.post('/account_types')
      .send(newAccountType)
      .then(function (res) {
        expect(res).to.have.status(201);        
      })
      .catch(handler);
  }); 

  it('A PUT /account_types/:id will update the newly added account_type', function () {
    return agent.put('/account_types/' + newAccountType.id)
      .send({ type : 'updated value' })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body.id).to.equal(newAccountType.id);
        expect(res.body.type).to.not.equal(newAccountType.type);

        // re-query the database
        return agent.get('/account_types/'+ newAccountType.id);
      })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.not.be.empty;
      })
      .catch(handler);
  });

   it(' A DELETE /account_types/:id will delete a account_type', function () {
    return agent.delete('/account_types/' + DELETABLE_ACCOUNT_TYPE_ID)
      .then(function (res) {
        expect(res).to.have.status(200);
        
        // re-query the database
        return agent.get('/account_types/' + DELETABLE_ACCOUNT_TYPE_ID);
      })
      .then(function (res) {
        expect(res).to.have.status(404);        
      })
      .catch(handler);
  });  
});
