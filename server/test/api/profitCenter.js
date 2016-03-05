var chai = require('chai');
var expect = chai.expect;

var helpers = require('./helpers');
helpers.configure(chai);

describe('The profit center API, PATH : /profit_centers', function () {
  var agent = chai.request.agent(helpers.baseUrl);

  var newProfitCenter = {
    project_id : 1,
    text : 'tested profit',
    note : 'test inserted'
  };

  var DELETABLE_PROFIT_CENTER_ID = 2;
  var FETCHABLE_PROFIT_CENTER_ID = 1;

  before(helpers.login(agent));

    it('METHOD : GET, PATH : /profit_centers?full=1, It returns a full list of profit centers', function () {
      return agent.get('/profit_centers?full=1')
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.not.be.empty;
          expect(res.body).to.have.length(2);
        })
        .catch(helpers.handler);
    });

  it('METHOD : GET, PATH : /profit_centers, It returns a list of profit centers', function () {
    return agent.get('/profit_centers')
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.not.be.empty;
        expect(res.body).to.have.length(2);
      })
     .catch(helpers.handler);
  });

    it('METHOD : GET, PATH : /profit_centers?available=1, It returns a list of availables profit centers', function () {
      return agent.get('/profit_centers?available=1')
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.not.be.empty;
          expect(res.body).to.have.length(1);
        })
       .catch(helpers.handler);
    });

    it('METHOD : GET, PATH : /profit_centers?available=1&full=1, It returns a full list of availables profit centers', function () {
      return agent.get('/profit_centers?available=1&full=1')
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.not.be.empty;
          expect(res.body).to.have.length(1);
        })
       .catch(helpers.handler);
    });

    it('METHOD : GET, PATH : /profit_centers/:id/profit, It returns  profit of a provided profit center', function () {
      return agent.get('/profit_centers/:id/profit'.replace(':id', FETCHABLE_PROFIT_CENTER_ID))
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.not.be.empty;
          expect(res.body).to.have.all.keys('profit');
          expect(res.body.profit).to.satisfy(function (profit) { return profit >= 0;});
        })
        .catch(helpers.handler);
    });

  it('METHOD : GET, PATH : /profit_center/:id, It returns one profit center', function () {
    return agent.get('/profit_centers/'+ FETCHABLE_PROFIT_CENTER_ID)
      .then(function (res) {
       expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.not.be.empty;
        expect(res.body.id).to.be.equal(FETCHABLE_PROFIT_CENTER_ID);
        expect(res.body).to.have.all.keys('project_id', 'id', 'text', 'note');
      })
      .catch(helpers.handler);
  });

  it('METHOD : POST, PATH : /profit_centers, It adds a profit center', function () {
    return agent.post('/profit_centers')
      .send(newProfitCenter)
      .then(function (res) {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        expect(res.body).to.not.be.empty;
        expect(res.body.id).to.be.defined;
        newProfitCenter.id = res.body.id;
        return agent.get('/profit_centers/' + newProfitCenter.id);
      })
      .then(function (res){
        expect(res).to.have.status(200);
        expect(res.body).to.have.all.keys('project_id', 'id', 'text', 'note');
      })
     .catch(helpers.handler);
  });

  it('METHOD : PUT, PATH : /profit_centers/:id, It updates the newly added profit center', function () {
    var updateInfo = {note : 'updated value for note'};

    return agent.put('/profit_centers/'+ newProfitCenter.id)
      .send(updateInfo)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body.id).to.equal(newProfitCenter.id);
        expect(res.body.note).to.equal(updateInfo.note);
      })
      .catch(helpers.handler);
  });

   it('METHOD : DELETE, PATH : /profit_centers/:id, It deletes a profit_center', function () {
    return agent.delete('/profit_centers/' + DELETABLE_PROFIT_CENTER_ID)
      .then(function (res) {
        expect(res).to.have.status(204);
        // re-query the database
        return agent.get('/profit_centers/' + DELETABLE_PROFIT_CENTER_ID);
      })
      .then(function (res) {
        expect(res).to.have.status(404);
      })
      .catch(helpers.handler);
  });
});
