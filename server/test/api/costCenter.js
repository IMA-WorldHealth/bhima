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

describe('The /cost_center API endpoint', function () {
  var agent = chai.request.agent(url);
  var newCostCenter = {
    project_id : 1,
    //id : 200,
    text : 'tested cost',
    note : 'test inserted',
    is_principal : 1
  };

  var DELETABLE_COST_CENTER_ID = 2;

  var FETCHABLE_COST_CENTER_ID = 1;

  // throw errors
  function handler(err) { throw err; }

    // login before each request
    beforeEach(function () {
      return agent
        .post('/login')
        .send(user);
    });

    it(' A GET /cost_centers?list=full returns a list of cost centers', function () {
      return agent.get('/cost_centers?list=full')
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res.body).to.not.be.empty;
          expect(res.body).to.have.length(2);
        })
        .catch(handler);
    });

  it(' A GET /cost_centers returns a list of cost centers', function () {
    return agent.get('/cost_centers')
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.not.be.empty;
        expect(res.body).to.have.length(2);
      })
      .catch(handler);
  });



  it(' A GET /cost_center/:id returns one cost center', function () {
    return agent.get('/cost_centers/'+ FETCHABLE_COST_CENTER_ID)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.not.be.empty;
        expect(res.body.id).to.be.equal(FETCHABLE_COST_CENTER_ID);
      })
      .catch(handler);
  });

  it('A POST /cost_centers will add a cost center', function () {
    return agent.post('/cost_centers')
      .send(newCostCenter)
      .then(function (res) {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        expect(res.body).to.not.be.empty;
        expect(res.body.id).to.be.defined;
        newCostCenter.id = res.body.id;
      })
      .catch(handler);
  }); 

  it('A PUT /cost_centers/:id will update the newly added cost center', function () {
    return agent.put('/cost_centers/'+ newCostCenter.id)
      .send({ note : 'updated value for note' })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body.id).to.equal(newCostCenter.id);
        expect(res.body.note).to.not.equal(newCostCenter.note);

        // re-query the database
        return agent.get('/cost_centers/'+ newCostCenter.id);
      })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.not.be.empty;
      })
      .catch(handler);
  });

   it(' A DELETE /cost_centers/:id will delete a cost_center', function () {
    return agent.delete('/cost_centers/' + DELETABLE_COST_CENTER_ID)
      .then(function (res) {
        expect(res).to.have.status(200);
        
        // re-query the database
        return agent.get('/cost_centers/' + DELETABLE_COST_CENTER_ID);
      })
      .then(function (res) {
        expect(res).to.have.status(404);        
      })
      .catch(handler);
  });  
});
