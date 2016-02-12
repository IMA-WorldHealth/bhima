var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = chai.expect;
chai.use(chaiHttp);

var helpers = require('./helpers');
helpers.configure(chai);

// base URL
var user = { username : 'superuser', password : 'superuser', project: 1};

/**
* The /Enterprises API endpoint
*
* This test suite implements full CRUD on the /Enterprises HTTP API endpoint.
*/
describe('The /Enterprises API endpoint', function () {
  var agent = chai.request.agent(helpers.baseUrl);

  var newEnterprise = {
    name : 'newEnterprises',
    abbr : 'newEnterprises',
    email : 'newEnterprises@test.org',
    po_box : 'newEnterprises',
    phone : '2016',
    location_id : 'bda70b4b-8143-47cf-a683-e4ea7ddd4cff',
    logo : null,
    currency_id : 2
  };

  var updateEnterprise = {
    name : 'updateEnterprises',
    abbr : 'updateEnterprises',
    email : 'newEnterprises@test.org',
    po_box : 'newEnterprises',
    phone : '00904940950932016',
    location_id : 'bda70b4b-8143-47cf-a683-e4ea7ddd4cff',
    logo : null,
    currency_id : 2
  };

  var invalideEnterprise = {
    name : null,
    abbr : null,
    email : 'newEnterprises@test.org',
    po_box : 'newEnterprises',
    phone : '2016',
    location_id : null,
    logo : null,
    currency_id : null
  };

  it('POST /ENTERPRISES will register a valid Enterprises', function () {
    return agent.post('/enterprises')
      .send({ enterprise : newEnterprise })
      .then(function (confirmation) {
        expect(confirmation).to.have.status(201);
        expect(confirmation.body.id).to.be.defined;
        updateEnterprise.id = confirmation.body.id;

        return agent.get('/enterprises/' + confirmation.body.id);
      })
      .then(function (res) {
        expect(res).to.have.status(200);
      })
      .catch(helpers.handler);
  });

  it('POST /ENTERPRISES will not register an invalid Enterprises', function () {
    return agent.post('/enterprises')
      .send({})
      .then(function (confirmation) {
        expect(confirmation).to.have.status(400);
        expect(confirmation).to.be.json;
      })
      .catch(helpers.handler);
  });

  it('POST /ENTERPRISES will not register an incomplete Enterprise', function () {
    return agent.post('/enterprises')
      .send({ enterprise : invalideEnterprise })
      .then(function (confirmation) {
        expect(confirmation).to.have.status(400);
        expect(confirmation).to.be.json;
      })
      .catch(helpers.handler);
  });

  it('PUT /ENTERPRISES should update an existing Enterprises', function () {
    return agent.put('/enterprises/' + updateEnterprise.id)
      .send(updateEnterprise)
      .then(function (res) {
        var e = res.body[0];
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(e).to.have.all.keys('id', 'name', 'abbr', 'email', 'po_box', 'phone', 'location_id', 'logo', 'currency_id');
        expect(e.name).to.not.be.equal(newEnterprise.name);
        expect(e.location_id).to.be.equal(newEnterprise.location_id);
      })
      .catch(helpers.handler);
  });

  it('GET /ENTERPRISES returns a Enterprises List ', function () {
    return agent.get('/enterprises?detailed=1')
      .then(function (result) {
        expect(result).to.have.status(200);
        expect(result).to.be.json;
      })
      .catch(helpers.handler);
  });

  it('GET /ENTERPRISES returns a Enterprises List With a minimum number of elements ', function () {
    return agent.get('/enterprises/')
      .then(function (result) {
        expect(result).to.have.status(200);
        expect(result).to.be.json;
        expect(result.body[0]).to.have.all.keys('id', 'name', 'abbr');
      })
      .catch(helpers.handler);
  });

  it('GET /ENTERPRISES:ID returns a single Enterprise ', function () {
    return agent.get('/enterprises/' + updateEnterprise.id)
      .then(function (result) {
        expect(result).to.have.status(200);
        expect(result).to.be.json;
      })
      .catch(helpers.handler);
  });


  it('GET /LOCATIONS ENTERPRISES returns a Locations List ', function () {
    return agent.get('/location/villages')
      .then(function (result) {
        expect(result).to.have.status(200);
        expect(result.body).to.not.be.empty;
      })
      .catch(helpers.handler);
  });

  // login before each request
  beforeEach(helpers.login(agent));
});
