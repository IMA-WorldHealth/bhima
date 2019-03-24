/* global expect, agent */
/* eslint-disable no-unused-expressions */

const helpers = require('./helpers');

/*
 * The /payroll/weekend_configuration  API endpoint
 *
 * This test suite implements full CRUD on the /payroll/weekend_configuration  HTTP API endpoint.
 */
describe('(/payroll/weekend_configuration) The /payroll/weekend_configuration  API endpoint', () => {
  const weekEndConfig = {
    label : 'Configuration Week end 2013',
  };

  const weekEndConfigUpdate = {
    label : 'Configuration Week end 2013 Updated',
  };

  const NUM_CONFIG_WEEKEND = 3;

  const configWeekEnd = { configuration : [0, 5, 6] };
  const configWeekEndEmpty = { configuration : [] };


  // INTEGRATION TEST FOR WEEK_END_ CONFIGURATION
  it('POST /WEEKEND__CONFIG should create a new WeekEnd Configuration', () => {
    return agent.post('/weekend_config')
      .send(weekEndConfig)
      .then((res) => {
        weekEndConfig.id = res.body.id;
        helpers.api.created(res);
      })
      .catch(helpers.handler);
  });

  it('GET /WEEKEND__CONFIG returns a list of function ', () => {
    return agent.get('/weekend_config')
      .then((res) => {
        helpers.api.listed(res, NUM_CONFIG_WEEKEND);
      })
      .catch(helpers.handler);
  });


  it('GET /WEEKEND__CONFIG/:ID should not be found for unknown id', () => {
    return agent.get('/weekend_config/unknownWeekEnd')
      .then((res) => {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('PUT /WEEKEND__CONFIG should update an existing WeekEnd Configuration', () => {
    return agent.put('/weekend_config/'.concat(weekEndConfig.id))
      .send(weekEndConfigUpdate)
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res.body.label).to.equal(weekEndConfigUpdate.label);
      })
      .catch(helpers.handler);
  });

  it('GET /WEEKEND__CONFIG/:ID returns a single WeekEnd Configuration', () => {
    return agent.get('/weekend_config/'.concat(weekEndConfig.id))
      .then((res) => {
        expect(res).to.have.status(200);
      })
      .catch(helpers.handler);
  });

  it('DELETE /WEEKEND__CONFIG/:ID will send back a 404 if the WeekEnd Configuration does not exist', () => {
    return agent.delete('/weekend_config/unknownWeekEnd')
      .then((res) => {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  // INTEGRATION TEST FOR SETTING WEEKEND IN CONFIGURATION

  it('POST /WEEKEND__CONFIG/:ID/DAYS should Set WeekEnds in Configuration', () => {
    return agent.post(`/weekend_config/${weekEndConfig.id}/days`)
      .send(configWeekEnd)
      .then((res) => {
        expect(res).to.have.status(201);
        return agent.get(`/weekend_config/${weekEndConfig.id}/days`);
      })
      .then(res => {
        helpers.api.listed(res, 3);
        expect(res).to.have.status(200);
        expect(res.body).to.not.be.empty;
      })
      .catch(helpers.handler);
  });

  it('POST /WEEKEND_CONFIG/:ID/DAYS Update Rubrucs Configuration', () => {
    return agent.post(`/weekend_config/${weekEndConfig.id}/days`)
      .send(configWeekEndEmpty)
      .then((res) => {
        expect(res).to.have.status(201);
        return agent.get(`/weekend_config/${weekEndConfig.id}/days`);
      })
      .then(res => {
        helpers.api.listed(res, 0);
        expect(res).to.have.status(200);
      })
      .catch(helpers.handler);
  });

  it('DELETE /WEEKEND_CONFIG/:ID should delete a WeekEnd ', () => {
    return agent.delete('/weekend_config/'.concat(weekEndConfig.id))
      .then((res) => {
        helpers.api.deleted(res);
      })
      .catch(helpers.handler);
  });

});
