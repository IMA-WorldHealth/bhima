/* global expect, chai, agent */

const helpers = require('./helpers');
const uuid = require('node-uuid');

// The /depots API endpoint
describe('(/depots) The depots API ', function () {
  'use strict';

  // new depot object
  var newDepot = {
    uuid : uuid.v4(),
    // the reference column is auto increment by a trigger
    text : 'New Depot',
    enterprise_id : 1,
    is_warehouse : 0
  };

  // second depot object
  var secondDepot = {
    text : 'Second Depot',
    enterprise_id : 1,
    is_warehouse : 0
  };

  // depot object with missing uuid
  var badDepot = {
    text : 'New Depot',
    enterprise_id : 1,
    is_warehouse : 0
  };

  // update depot
  var editDepot = {
    uuid : uuid.v4(),
    text : 'Edited Depot',
    is_warehouse : 1
  };

  // removable depot
  var removableDepot = {
    uuid : uuid.v4(),
    text : 'Removable Depot',
    enterprise_id : 1,
    is_warehouse : 1
  };

  it('POST /depots create a new depot in the database', function () {
    return agent.post('/depots')
    .send(newDepot)
    .then(function (res) {
      helpers.api.created(res);
      expect(res.body.uuid).to.equal(newDepot.uuid);
    })
    .catch(helpers.handler);
  });

  it('POST /depots create a second depot (without sending uuid)', function () {
    return agent.post('/depots')
    .send(secondDepot)
    .then(function (res) {
      helpers.api.created(res);
    })
    .catch(helpers.handler);
  });

  it('POST /depots should not create when missing data', function () {
    delete badDepot.enterprise_id;
    return agent.post('/depots')
    .send(badDepot)
    .then(function (res) {
      helpers.api.errored(res, 400);
      expect(res.body.code).to.be.equal('ERRORS.ER_NO_DEFAULT_FOR_FIELD');
    })
    .catch(helpers.handler);
  });

  it('PUT /depots update an existing depot', function () {
    return agent.put('/depots/' + newDepot.uuid)
    .send(editDepot)
    .then(function (res) {
      expect(res).to.have.status(200);
      expect(res.body[0].text).to.exist;
      expect(res.body[0].text).to.be.equal(editDepot.text);
      expect(res.body[0].is_warehouse).to.exist;
      expect(res.body[0].is_warehouse).to.be.equal(editDepot.is_warehouse);
    })
    .catch(helpers.handler);
  });

  it('GET /depots should returns the list of depots', function () {
    return agent.get('/depots')
    .then(function (res) {
      helpers.api.listed(res, 4);
    })
    .catch(helpers.handler);
  });

  it('POST /depots create a removable depot in the database', function () {
    return agent.post('/depots')
    .send(removableDepot)
    .then(function (res) {
      helpers.api.created(res);
    })
    .catch(helpers.handler);
  });

  it('DELETE /depots should delete an existing depot', function () {
    return agent.delete('/depots/' + removableDepot.uuid)
    .then(function (res) {
      helpers.api.deleted(res);
    })
    .catch(helpers.handler);
  });
});
