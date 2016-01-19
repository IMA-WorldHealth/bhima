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
* The /Enterprises API endpoint
*
* This test suite implements full CRUD on the /Enterprises HTTP API endpoint.
*/
describe('The /Enterprises API endpoint', function () {
  var agent = chai.request.agent(url);
  var NUMBER_OF_CASHBOXES = 2;
  
  var newEnterprises = {
    name : 'newEnterprises',
    abbr : 'newEnterprises', 
    email : 'newEnterprises@test.org', 
    po_box : 'newEnterprises', 
    phone : '2016', 
    location_id : 'bda70b4b-8143-47cf-a683-e4ea7ddd4cff', 
    currency_id : [2]
  };

  var updateEnterprises = {
    name : 'updateEnterprises',
    abbr : 'updateEnterprises', 
    email : 'newEnterprises@test.org', 
    po_box : 'newEnterprises', 
    phone : '00904940950932016', 
    location_id : 'bda70b4b-8143-47cf-a683-e4ea7ddd4cff', 
    currency_id : [2]
  };

  it('POST /ENTERPRISES will register a valid Enterprises', function () { 
    return agent.post('/enterprises')
      .send({ enterprises : newEnterprises })
      .then(function (confirmation) { 
        expect(confirmation).to.have.status(201);
        updateEnterprises.id = confirmation.body.id  
      })
      .catch(handle);
  });

  it('GET /CURRENCY FOR ENTERPRISES returns a currencies list ', function () { 
    var TOTAL_CURRENCIES = 2;
    return agent.get('/finance/currencies')
      .then(function (result) { 
        expect(result).to.have.status(200);
        expect(result.body).to.not.be.empty;
        expect(result.body).to.have.length(TOTAL_CURRENCIES);
      })
      .catch(handle);
  });     

  it('PUT /ENTERPRISES should update an existing Enterprises', function () {
    return agent.put('/enterprises/' + updateEnterprises.id)
      .send(updateEnterprises)
      .then(function (res) {
        expect(res).to.have.status(200);
      })
      .catch(handle);
  });

  it('GET /ENTERPRISES returns a Enterprises List ', function () { 
    return agent.get('/enterprises')
      .then(function (result) { 
        expect(result).to.have.status(200);
        expect(result.body).to.not.be.empty;
      })
      .catch(handle);
  }); 

  it('GET /LOCATIONS ENTERPRISES returns a Locations List ', function () { 
    return agent.get('/location/villages')
      .then(function (result) { 
        expect(result).to.have.status(200);
        expect(result.body).to.not.be.empty;
      })
      .catch(handle);
  }); 

  // login before each request
  beforeEach(function () {
    return agent
      .post('/login')
      .send(user);
  });

  // throw errors
  function handle(error) {
    throw error;
  }  

});
