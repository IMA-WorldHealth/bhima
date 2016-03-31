/* jshint expr:true */
var chai = require('chai');
var expect = chai.expect;

/** import test helpers */
var helpers = require('./helpers');
helpers.configure(chai);

describe('(/reference) The Reference API', function () {
  var agent = chai.request.agent(helpers.baseUrl);

  var newReference = {
    is_report : 0,
    ref : 'AD',
    text : 'Reference tested 1',
    position: 2,
    reference_group_id : 1,
    section_resultat_id : 1
  };

  var DELETABLE_REFERENCE_ID = 5;
  var FETCHABLE_REFERENCE_ID = 1;

  var responseKeys = [
    'id', 'is_report', 'ref', 'text', 'position', 'reference_group_id', 'section_resultat_id'
  ];

  beforeEach(helpers.login(agent));

  it('GET /references returns a full list of references', function () {
    return agent.get('/references?full=1')
      .then(function (res) {
        helpers.api.listed(res, 3);
      })
     .catch(helpers.handler);
  });

  it('GET /references returns a list of references', function () {
    return agent.get('/references')
      .then(function (res) {
        helpers.api.listed(res, 3);
       })
     .catch(helpers.handler);
  });


  it('GET /references/:id returns one reference', function () {
    return agent.get('/references/'+ FETCHABLE_REFERENCE_ID)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.not.be.empty;
        expect(res.body.id).to.be.equal(FETCHABLE_REFERENCE_ID);
        expect(res.body).to.have.keys(responseKeys);
      })
      .catch(helpers.handler);
  });

  it('POST /references adds a reference', function () {
    return agent.post('/references')
      .send(newReference)
      .then(function (res) {
        helpers.api.created(res);
        newReference.id = res.body.id;
        return agent.get('/references/' + newReference.id);
      })
      .then(function (res){
        expect(res).to.have.status(200);
        expect(res.body).to.have.keys(responseKeys);
      })
      .catch(helpers.handler);
  });

  it('PUT /references/:id updates the newly added reference', function () {
    var updateInfo = {position : 3};

    return agent.put('/references/'+ newReference.id)
      .send(updateInfo)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body.id).to.equal(newReference.id);
        expect(res.body.position).to.equal(updateInfo.position);
      })
      .catch(helpers.handler);
  });

   it('DELETE /references/:id deletes a reference', function () {
    return agent.delete('/references/' + DELETABLE_REFERENCE_ID)
      .then(function (res) {
        helpers.api.deleted(res);
        return agent.get('/references/' + DELETABLE_REFERENCE_ID);
      })
      .then(function (res) {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });
});
