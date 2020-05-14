/* global expect, agent */

const helpers = require('./helpers');

/*
 * The /payroll/account_configuration  API endpoint
 *
 * This test suite implements full CRUD on the /payroll/account_configuration  HTTP API endpoint.
 */
describe('(/payroll/account_configuration) The /payroll/account_configuration  API endpoint', () => {
  // Account Payroll Configuration we will add during this test suite.

  const accountConfig = {
    label : 'Account Configuration 2017',
    account_id : 175,
  };

  const accountConfigUpdate = {
    label : 'Account Configuration 2015',
  };

  const NUM_ACCOUNTING = 1;

  it('GET /ACCOUNT_CONFIG returns a list of Account Configurations ', () => {
    return agent.get('/account_config')
      .then((res) => {
        helpers.api.listed(res, NUM_ACCOUNTING);
      })
      .catch(helpers.handler);
  });

  it('POST /ACCOUNT_CONFIG should create a new Account Configuration', () => {
    return agent.post('/account_config')
      .send(accountConfig)
      .then((res) => {
        accountConfig.id = res.body.id;
        helpers.api.created(res);
      })
      .catch(helpers.handler);
  });

  it('GET /ACCOUNT_CONFIG/:ID should not be found for unknown id', () => {
    return agent.get('/account_config/123456789')
      .then((res) => {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('GET /ACCOUNT_CONFIG/:ID will send back a 404 if the Account Configuration is a string', () => {
    return agent.get('/account_config/str')
      .then((res) => {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('PUT /ACCOUNT_CONFIG  should update an existing Account Configuration', () => {
    return agent.put('/account_config/'.concat(accountConfig.id))
      .send(accountConfigUpdate)
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res.body.label).to.equal('Account Configuration 2015');
      })
      .catch(helpers.handler);
  });

  it('GET /ACCOUNT_CONFIG/:ID returns a single Account Configuration', () => {
    return agent.get('/account_config/'.concat(accountConfig.id))
      .then((res) => {
        expect(res).to.have.status(200);
      })
      .catch(helpers.handler);
  });

  it('DELETE /ACCOUNT_CONFIG/:ID will send back a 404 if the Account Configuration does not exist', () => {
    return agent.delete('/account_config/123456789')
      .then((res) => {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('DELETE /ACCOUNT_CONFIG/:ID will send back a 404 if the Account Configuration is a string', () => {
    return agent.delete('/account_config/str')
      .then((res) => {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('DELETE /ACCOUNT_CONFIG/:ID should delete an Account Configuration ', () => {
    return agent.delete('/account_config/'.concat(accountConfig.id))
      .then((res) => {
        helpers.api.deleted(res);
      })
      .catch(helpers.handler);
  });

});
