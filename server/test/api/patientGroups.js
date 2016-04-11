/* jshint expr:true */
var chai = require('chai');
var expect = chai.expect;

var helpers = require('./helpers');
helpers.configure(chai);

describe('(/patient_groups) Patient Group API', function () {
  var agent = chai.request.agent(helpers.baseUrl);

  var newPatientGroup = {
    enterprise_id : 1,
    uuid : '2c6a2854-efb9-11e5-a4d7-9c4e36a322c8',
    price_list_uuid : '2e39c855-6f2b-48d7-af7f-746f0552f7b7',
    name : 'Test Patient group 1',
    note : 'The first test patient group inserted'
  };

  var PatientGroupWithoutPriceList = {
    enterprise_id : 1,
    uuid : '30eba520-efa7-11e5-a4d7-9c4e36a322c8',
    price_list_uuid : null,
    name : 'Test Patient group 2',
    note : 'The second patient group there is no price list'
  };

  var responseKeys = [
    'enterprise_id', 'uuid', 'price_list_uuid', 'name', 'note', 'created_at'
  ];

  // log in before test suite
  before(helpers.login(agent));

  it('POST /patient_groups adds a patient group', function () {
    return agent.post('/patient_groups')
      .send(newPatientGroup)
      .then(function (res) {
        helpers.api.created(res);

        newPatientGroup.uuid = res.body.uuid;
        return agent.get('/patient_groups/' + newPatientGroup.uuid);
      })
      .then(function (res){
        expect(res).to.have.status(200);
        expect(res.body).to.have.all.keys(responseKeys);
      })
     .catch(helpers.handler);
  });

  it('POST /patient_groups adds a patient group with a null price list', function () {
    return agent.post('/patient_groups')
      .send(PatientGroupWithoutPriceList)
      .then(function (res) {
        helpers.api.created(res);

        PatientGroupWithoutPriceList.uuid = res.body.uuid;
        return agent.get('/patient_groups/' + PatientGroupWithoutPriceList.uuid);
      })
      .then(function (res){
        expect(res).to.have.status(200);
        expect(res.body).to.have.all.keys(responseKeys);
      })
     .catch(helpers.handler);
  });

  it('GET /patient_groups returns a list of patient groups', function () {
    return agent.get('/patient_groups')
      .then(function (res) {
        helpers.api.listed(res, 5);
      })
      .catch(helpers.handler);
  });

  it('GET /patient_groups/:uuid returns one patient group', function () {
    return agent.get('/patient_groups/'+ newPatientGroup.uuid)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.not.be.empty;
        expect(res.body.uuid).to.be.equal(newPatientGroup.uuid);
        expect(res.body).to.have.all.keys(responseKeys);
      })
      .catch(helpers.handler);
  });

  it('PUT /patient_groups/:uuid updates the newly added patient group', function () {
    var updateInfo = {name : 'test updated patient group'};

    return agent.put('/patient_groups/'+ newPatientGroup.uuid)
      .send(updateInfo)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body.uuid).to.equal(newPatientGroup.uuid);
        expect(res.body.name).to.equal(updateInfo.name);
      })
      .catch(helpers.handler);
  });

  it('DELETE /patient_groups/:uuid deletes a patient group', function () {
    return agent.delete('/patient_groups/' + newPatientGroup.uuid)
      .then(function (res) {
        helpers.api.deleted(res);
        return agent.get('/patient_groups/' + newPatientGroup.uuid);
      })
      .then(function (res) {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });
});
