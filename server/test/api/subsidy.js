/*global describe, it, beforeEach*/

var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = chai.expect;
chai.use(chaiHttp);

var helpers = require('./helpers');
helpers.configure(chai);

describe('The subsidy API, PATH : /subsidies', function () {
  var agent = chai.request.agent(helpers.baseUrl);

  var newSubsidy = {
    account_id : 3626,
    label : 'tested subsidy',
    description : 'This is for the test',
    value : 10  
  };
 
  var wrongSubsidy = {
    account_id : 3626,
    label : 'tested wrong subsidy',
    description : 'This is for the wrong value test',
    value : -10  
  };

  beforeEach(helpers.login(agent));

  it('METHOD : POST, PATH : /subsidies, It adds a subsidy', function () {
    return agent.post('/subsidies')
      .send(newSubsidy)
      .then(function (res) {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        expect(res.body).to.not.be.empty;
        expect(res.body.id).to.be.defined;
        newSubsidy.id = res.body.id;
        return agent.get('/subsidies/' + newSubsidy.id);  
      })
      .then(function (res){ 
        expect(res).to.have.status(200);
        expect(res.body).to.have.all.keys('id', 'account_id', 'label', 'description', 'value', 'created_at', 'updated_at');
      })
     .catch(helpers.handler);
  });

  it('METHOD : POST, PATH : /subsidies, It refuses to add a wrong subsidy', function () {
    return agent.post('/subsidies')
      .send(wrongSubsidy)
      .then(function (res) {
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        expect(res.body).to.not.be.empty;
        expect(res.body).to.have.all.keys('code', 'httpStatus', 'reason');
      })
      .catch(helpers.handler);
  });  
    
  it('METHOD : GET, PATH : /subsidies, It returns a list of subsidies', function () {
      return agent.get('/subsidies')
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.not.be.empty;
          expect(res.body).to.have.length(1);
        })
        .catch(helpers.handler);
    });
  
  it('METHOD : GET, PATH : /subsidies/:id, It returns one subsidy', function () {
    return agent.get('/subsidies/'+ newSubsidy.id)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.not.be.empty;
        expect(res.body.id).to.be.equal(newSubsidy.id);
        expect(res.body).to.have.all.keys('id', 'account_id', 'label', 'description', 'value', 'created_at', 'updated_at');
      })
      .catch(helpers.handler);
  });

 
  it('METHOD : PUT, PATH : /subsidies/:id, It updates the newly added subsidy', function () {
    var updateInfo = {value : 50};

    return agent.put('/subsidies/'+ newSubsidy.id)
      .send(updateInfo)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body.id).to.equal(newSubsidy.id);
        expect(res.body.value).to.equal(updateInfo.value);
      })
      .catch(helpers.handler);
  });

   it('METHOD : DELETE, PATH : /subsidies/:id, It deletes a subsidy', function () {
    return agent.delete('/subsidies/' + newSubsidy.id)
      .then(function (res) {
        expect(res).to.have.status(204);
        // re-query the database
        return agent.get('/subsidies/' + newSubsidy.id);
      })
      .then(function (res) {
        expect(res).to.have.status(404);     
        expect(res.body).to.have.all.keys('code', 'httpStatus', 'reason');
      })
      .catch(helpers.handler);
  });  
});
