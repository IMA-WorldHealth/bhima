/*global describe, it, beforeEach, process*/

var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = chai.expect;
chai.use(chaiHttp);

// workaround for low node versions
if (!global.Promise) {
  var q = require('q');
  chai.request.addPromises(q.Promise);
}

// environment variables - disable certificate errors
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

// base URL
var url = 'https://localhost:8080';
var user = { username : 'superuser', password : 'superuser', project: 1};

/**
* The /exchange API endpoint
*/
describe('The /exchange API endpoint', function () {
  var agent = chai.request.agent(url);

  // constants
  var RATE = {
    enterprise_currency_id : 2, // USD in test database
    foreign_currency_id : 1,    // FC in test database
    rate : 930,
    date : new Date()
  };

  // throw errors
  function handler(err) { throw err; }

  // login before each request
  beforeEach(function () {
    return agent
      .post('/login')
      .send(user);
  });

  it('GET /exchange returns a list of exchange rates', function () {
    return agent.get('/exchange')
      .then(function (res) {
        expect(res).to.have.status(200);
      })
      .catch(handler);
  });


  it('POST /exchange creates a new exchange rate', function () {
    return agent.post('/exchange')
      .send(RATE)
      .then(function (res) {
        expect(res).to.have.status(201);
        expect(res.body).to.have.property('id');
        return agent.get('/exchange');
      })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.not.be.empty;
        expect(res.body[0]).to.not.be.empty;
        expect(res.body[0]).to.contain.keys('currency_id', 'date', 'rate');
      })
      .catch(handler);
  });
});
