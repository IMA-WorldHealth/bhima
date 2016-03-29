/* jshint expr:true */
var chai = require('chai');
var expect = chai.expect;

var helpers = require('./helpers');
helpers.configure(chai);


/**
 * @todo - there are some tests missing:
 *  - invalid POSTs
 *  - 404s on PUTs
 */
describe('(/profit_centers) The profit center API', function () {
  var agent = chai.request.agent(helpers.baseUrl);

  var newProfitCenter = {
    project_id : 1,
    text : 'tested profit',
    note : 'test inserted'
  };

  var DELETABLE_PROFIT_CENTER_ID = 2;
  var FETCHABLE_PROFIT_CENTER_ID = 1;

  var responseKeys = [
    'project_id', 'id', 'text', 'note'
  ];

  // make sure the client is logged in before the tests start
  before(helpers.login(agent));

  it('GET /profit_centers returns a list of profit centers', function () {
    return agent.get('/profit_centers')
      .then(function (res) {
        helpers.api.listed(res, 2);
      })
     .catch(helpers.handler);
  });

  /** @todo - make this route ?detailed=1 to conform to standards */
  it('GET /profit_centers?full=1 returns a full list of profit centers', function () {
    return agent.get('/profit_centers?full=1')
      .then(function (res) {
        helpers.api.listed(res, 2);
      })
      .catch(helpers.handler);
  });

  it('GET /profit_centers?available=1 returns a list of availables profit centers', function () {
    return agent.get('/profit_centers?available=1')
      .then(function (res) {
        helpers.api.listed(res, 1);
      })
     .catch(helpers.handler);
  });

  it('GET /profit_centers?available=1&full=1 returns a full list of availables profit centers', function () {
    return agent.get('/profit_centers?available=1&full=1')
      .then(function (res) {
        helpers.api.listed(res, 1);
      })
     .catch(helpers.handler);
  });

  it('GET /profit_center/:id returns one profit center', function () {
    return agent.get('/profit_centers/'+ FETCHABLE_PROFIT_CENTER_ID)
      .then(function (res) {
       expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.not.be.empty;
        expect(res.body.id).to.be.equal(FETCHABLE_PROFIT_CENTER_ID);
        expect(res.body).to.have.all.keys(responseKeys);
      })
      .catch(helpers.handler);
  });

  it('GET /profit_center/:id returns a 404 for unknown id', function () {
    return agent.get('/profit_centers/unknown')
      .then(function (res) {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('GET /profit_centers/:id/profit returns  profit of a provided profit center', function () {
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

  it('POST /profit_centers adds a profit center', function () {
    return agent.post('/profit_centers')
      .send(newProfitCenter)
      .then(function (res) {
        helpers.api.created(res);
        newProfitCenter.id = res.body.id;
        return agent.get('/profit_centers/' + newProfitCenter.id);
      })
      .then(function (res){
        expect(res).to.have.status(200);
        expect(res.body).to.have.all.keys(responseKeys);
      })
     .catch(helpers.handler);
  });

  it('PUT /profit_centers/:id updates the newly added profit center', function () {
    var updateInfo = {note : 'updated value for note'};
    return agent.put('/profit_centers/'+ newProfitCenter.id)
      .send(updateInfo)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.have.all.keys(responseKeys);
        expect(res.body.id).to.equal(newProfitCenter.id);
        expect(res.body.note).to.equal(updateInfo.note);
      })
      .catch(helpers.handler);
  });

  it('DELETE /profit_centers/:id deletes a profit_center', function () {
    return agent.delete('/profit_centers/' + DELETABLE_PROFIT_CENTER_ID)
      .then(function (res) {
        helpers.api.deleted(res);
        return agent.get('/profit_centers/' + DELETABLE_PROFIT_CENTER_ID);
      })
      .then(function (res) {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('DELETE /profit_centers/:id should return a 404 for an unknown profit center id', function () {
    return agent.delete('/profit_centers/unknown')
      .then(function (res) {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });
});
