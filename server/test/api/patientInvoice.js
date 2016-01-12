var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = chai.expect;

var q = require('q');

var url = 'https://localhost:8080';
var user = { 
  username : 'superuser', 
  password : 'superuser', 
  project: 1
};

chai.use(chaiHttp);

// workaround for low node versions
if (!global.Promise) {
  var q = require('q');
  chai.request.addPromises(q.Promise);
}

// Environment variables - disable certificate errors
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

describe('The /sales API', function () { 
  var agent = chai.request.agent(url);
  
  beforeEach(function () {
    return agent
      .post('/login')
      .send(user);
  });
  
  it('POST /sales will record a valid patient invoice and return success from the posting journal'), function () { 

  });

  it('GET /sales returns a list of patient invoices', function () {

    // This value depends on the success of the previous test
    var INITIAL_PATIENT_INVOICES = 1;

    return agent.get('/sales')
      .then(function (res) { 
        expect(res).to.have.status(200);
        expect(res.body).to.not.be.empty;
        expect(res.body).to.have.length(INITIAL_PATIENT_INVOICES);
      })
      .catch(handle);
  });
  // it('GET /sales/:uuid returns a valid patient invoice', function () { });
  // it('GET /sales/:uuid returns 404 for an invalid patient invoice', function () { });
  
  // it('POST /sales/ returns 500 for an invalid patient invoice request object', function () { });
  // it('GET /sales/:invalid_request_uuid returns 404 ensuring invalid request was not written', function () { });
  function handle(error) {
    throw error;
  }
});
