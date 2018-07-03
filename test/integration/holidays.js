/* global expect, agent */

const helpers = require('./helpers');

/*
 * The /holidays  API endpoint
 *
 * This test suite implements full CRUD on the /holidays  HTTP API endpoint.
 */
describe('(/holidays) The /holidays  API endpoint', function () {

  // Holiday we will add during this test suite.

  const holiday = {
    label           : 'Conge Maternite',
    employee_uuid   : '75e09694-65f2-45a1-a8a2-8b025003d793',
    dateFrom        : '2017-11-01',
    dateTo          : '2017-11-29',
  };

  const NUM_HOLIDAYS = 0;

  it('GET /HOLIDAYS returns a list of function ', function () {
    return agent.get('/holidays')
    .then(function (res) {
      helpers.api.listed(res, NUM_HOLIDAYS);
    })
    .catch(helpers.handler);
  });

  it('POST /HOLIDAYS should create a new Holiday', function () {
    return agent.post('/holidays')
    .send(holiday)
    .then(function (res) {
      holiday.id = res.body.id;
      helpers.api.created(res);
    })
    .catch(helpers.handler);
  });

  it('GET /HOLIDAYS/:ID should not be found for unknown id', function () {
    return agent.get('/holidays/unknownHoliday')
    .then(function (res) {
      helpers.api.errored(res, 404);
    })
    .catch(helpers.handler);
  });

  it('PUT /HOLIDAYS  should update an existing Holiday ', function () {
    console.log('HHH');
    console.log(holiday.id);

    return agent.put('/holidays/'.concat(holiday.id))
      .send({ label : 'Holiday Updated', employee_uuid   : '75e09694-65f2-45a1-a8a2-8b025003d793' })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body.label).to.equal('Holiday Updated');
      })
      .catch(helpers.handler);
  });

  it('GET /HOLIDAYS/:ID returns a single Holiday ', function () {
    return agent.get('/holidays/'.concat(holiday.id))
      .then(function (res) {
        expect(res).to.have.status(200);
      })
      .catch(helpers.handler);
  });

  it('DELETE /HOLIDAYS/:ID will send back a 404 if the Holiday does not exist', function () {
    return agent.delete('/holidays/inknowHoliday')
      .then(function (res) {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('DELETE /HOLIDAYS/:ID should delete a Holiday ', function () {
    return agent.delete('/holidays/'.concat(holiday.id))
      .then(function (res) {
        helpers.api.deleted(res);
      })
      .catch(helpers.handler);
  });
});
