/*global describe, it, beforeEach, process*/

var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = chai.expect;
chai.use(chaiHttp);

var helpers = require('./helpers');
helpers.configure(chai);

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

var url = 'https://localhost:8080';
var user = { username : 'superuser', password : 'superuser', project: 1};

describe('The /profit_center API endpoint', function () {
  var agent = chai.request.agent(helpers.baseUrl);
  var newProfitCenter = {
    project_id : 1,
    //id : 200,
    text : 'tested profit',
    note : 'test inserted'  
  };

  var DELETABLE_PROFIT_CENTER_ID = 2;
  var FETCHABLE_PROFIT_CENTER_ID = 1;

  beforeEach(helpers.login(agent));

    it(' A GET /profit_centers?full returns a list of profit centers', function () {
      return agent.get('/profit_centers?full=1')
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res.body).to.not.be.empty;
          expect(res.body).to.have.length(2);
        })
        .catch(helpers.handler);
    });

  it(' A GET /profit_centers returns a list of profit centers', function () {
    return agent.get('/profit_centers')
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.not.be.empty;
        expect(res.body).to.have.length(2);
      })
     .catch(helpers.handler);
  });
  
  it(' A GET /profit_center/:id returns one profit center', function () {
    return agent.get('/profit_centers/'+ FETCHABLE_PROFIT_CENTER_ID)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.not.be.empty;
        expect(res.body.id).to.be.equal(FETCHABLE_PROFIT_CENTER_ID);
      })
      .catch(helpers.handler);

  });

  it('A POST /profit_centers will add a profit center', function () {
    return agent.post('/profit_centers')
      .send(newProfitCenter)
      .then(function (res) {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        expect(res.body).to.not.be.empty;
        expect(res.body.id).to.be.defined;
        newProfitCenter.id = res.body.id;
      })
     .catch(helpers.handler);
  }); 

  it('A PUT /profit_centers/:id will update the newly added profit center', function () {
    return agent.put('/profit_centers/'+ newProfitCenter.id)
      .send({ note : 'updated value for note' })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body.id).to.equal(newProfitCenter.id);
        expect(res.body.note).to.not.equal(newProfitCenter.note);

        // re-query the database
        return agent.get('/profit_centers/'+ newProfitCenter.id);
      })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.not.be.empty;
      })
     .catch(helpers.handler);

  });

   it(' A DELETE /profit_centers/:id will delete a profit_center', function () {
    return agent.delete('/profit_centers/' + DELETABLE_PROFIT_CENTER_ID)
      .then(function (res) {
        expect(res).to.have.status(200);
        // re-query the database
        return agent.get('/profit_centers/' + DELETABLE_PROFIT_CENTER_ID);
      })
      .then(function (res) {
        expect(res).to.have.status(404);        
      })
      .catch(helpers.handler);
  });  
});
