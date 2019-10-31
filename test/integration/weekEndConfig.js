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
    daysChecked : [ 0, 5, 6 ],
  };

  const weekEndConfigUpdate = {
    label : 'Configuration Week end 2013 Updated',
    daysChecked : [],
  };

  const configWeekEnd = { configuration : [0, 5, 6] };
  const configWeekEndEmpty = { configuration : [] };

  const NUM_CONFIG_WEEKEND = 3;

  // INTEGRATION TEST FOR WEEK_END_ CONFIGURATION
  it('POST /WEEKEND__CONFIG should create a new WeekEnd Configuration', () => {
    return agent.post('/weekend_config')
      .send(weekEndConfig)
      .then((res) => {
        console.log('RES BODY NEW');
        console.log(res.body);

        weekEndConfig.id = res.body.id;
        helpers.api.created(res);
      })
      .catch(helpers.handler);
  });

  it('GET /WEEKEND__CONFIG returns a list of Weekend Configured ', () => {
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

  it('DELETE /WEEKEND_CONFIG/:ID should delete a WeekEnd ', () => {
    return agent.delete('/weekend_config/'.concat(weekEndConfig.id))
      .then((res) => {
        helpers.api.deleted(res);
      })
      .catch(helpers.handler);
  });

});
