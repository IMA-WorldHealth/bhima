/* jshint expr: true */
const chai = require('chai');
const expect = chai.expect;

const helpers = require('./helpers');
helpers.configure(chai);

/**
 * The /donors API endpoint
 *
 * This test suit is about the crud operation with donors
 */
describe('(/donors) Donors', function () {
  'use strict';

  const agent = chai.request.agent(helpers.baseUrl);
  before(helpers.login(agent));

  /** new donors object */
  var newDonor = {
    name : 'IMA WorldHealth'
  };

	var secondDonor = {
    name : 'SANRU'
  };

  /** update donor object */
  var updateDonor = {
    name : 'ASSP'
  };

  it('POST /donors create a new donor in the database', function () {
    return agent.post('/donors')
    .send(newDonor)
    .then(function (res) {
      helpers.api.created(res);
			newDonor.id = res.body.id;
    })
    .catch(helpers.handler);
  });

	it('POST /donors create a second donor in the database', function () {
    return agent.post('/donors')
    .send(secondDonor)
    .then(function (res) {
      helpers.api.created(res);
			secondDonor.id = res.body.id;
    })
    .catch(helpers.handler);
  });


  it('POST /donors should not create when missing data', function () {
    return agent.post('/depots')
    .send({})
    .then(function (res) {
      helpers.api.errored(res, 400);
      expect(res.body.code).to.be.equal('ERRORS.BAD_REQUEST');
    })
    .catch(helpers.handler);
  });

  it('PUT /donors/:id update an existing donor', function () {
    return agent.put('/donors/' + newDonor.id)
    .send(updateDonor)
    .then(function (res) {
      expect(res).to.have.status(200);
      expect(res.body.name).to.exist;
      expect(res.body.name).to.be.equal(updateDonor.name);
    })
    .catch(helpers.handler);
  });

  it('GET /donors should returns the list of donors', function () {
    return agent.get('/donors')
    .then(function (res) {
      helpers.api.listed(res, 2);
    })
    .catch(helpers.handler);
  });

	it('GET /donors/:id should returns a specific donor', function () {
    return agent.get('/donors/' + secondDonor.id)
    .then(function (res) {
      expect(res).to.have.status(200);
      expect(res.body.name).to.exist;
      expect(res.body.name).to.be.equal(secondDonor.name);
    })
    .catch(helpers.handler);
  });

	it('DELETE /donors/:id should delete a specific donor', function () {
    return agent.delete('/donors/' + secondDonor.id)
    .then(function (res) {
      helpers.api.deleted(res);
    })
    .catch(helpers.handler);
  });

});
