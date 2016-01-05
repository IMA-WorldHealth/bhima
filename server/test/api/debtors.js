/*global describe, it, beforeEach, process*/

var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = chai.expect;

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

describe('The /debtors API', function () { 
  var agent = chai.request.agent(url);

  var inspectDebtorGroup;

  // Assumes test database is built with the following information
  // Logs in before each test
  beforeEach(function () {
    return agent
      .post('/login')
      .send(user);
  });

  it('GET /debtors/groups returns a list of debtor groups', function () { 
    var INITIAL_TEST_DEBTORS = 2;

    return agent.get('/debtors/groups')
      .then(function (result) { 
        expect(result).to.have.status(200);
        expect(result.body).to.not.be.empty;
        expect(result.body).to.have.length(INITIAL_TEST_DEBTORS);
        
        inspectDebtorGroup = result.body[0].uuid;
      })
      .catch(handle);
  });

  it('GET /debtors/groups/:id returns all details for a valid debtor group', function () { 
    return agent.get('/debtors/groups/' + inspectDebtorGroup)
      .then(function (result) { 
        var debtorGroup;
        var expectedKeySubset = ['uuid', 'account_id', 'name', 'location_id'];

        expect(result).to.have.status(200); 

        debtorGroup = result.body;
        expect(debtorGroup).to.contain.keys(expectedKeySubset);
      })
      .catch(handle);
  });

  it('GET /debtors/groups/:id returns not found for invalid id', function () { 
    return agent.get('/debtors/groups/invalid')
      .then(function (result) { 
        
        expect(result).to.have.status(404);
        expect(result.body).to.not.be.empty;
      })
      .catch(handle);
  });

  function handle(error) {
    throw error;
  }
});
