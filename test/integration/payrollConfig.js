/* global expect, agent */

const helpers = require('./helpers');

/*
 * The /payroll API endpoint
 *
 * This test suite implements full CRUD on the /payroll  HTTP API endpoint.
 */
describe('(/payroll) The /payroll  API endpoint', function () {
  //Payroll Configuration we will add during this test suite.

  const payrollConfig = {
    label : 'Account Configuration 2017',
    dateFrom : '2017-12-01',
    dateTo : '2017-12-31',
    config_rubric_id : 1,
    config_accounting_id : 1,
    config_weekend_id : 1,
    config_employee_id : 1,
  };

  const PayrollConfigUpdate = {
    label : 'Janvier 2018',
    dateFrom : '2018-01-01',
    dateTo : '2018-01-31',
  };

  const NUM_CONFIG_PAYROLL = 1;
  
  it('GET /PAYROLL_CONFIG returns a list of Payroll Configurations ', function () {
    return agent.get('/payroll_config')
      .then(function (res) {
        helpers.api.listed(res, NUM_CONFIG_PAYROLL);
      })
      .catch(helpers.handler);
  });

  it('POST /PAYROLL_CONFIG should create a new Account Configuration', function () {
    return agent.post('/payroll_config')
      .send(payrollConfig)
      .then(function (res) {
        payrollConfig.id = res.body.id;
        helpers.api.created(res);
      })
      .catch(helpers.handler);
  });

  it('GET /PAYROLL_CONFIG/:ID should not be found for unknown id', function () {
    return agent.get('/payroll_config/unknownPayrollConfig')
      .then(function (res) {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('PUT /PAYROLL_CONFIG  should update an existing Account Configuration', function () {
    return agent.put('/payroll_config/'.concat(payrollConfig.id))
      .send(PayrollConfigUpdate)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body.label).to.equal(PayrollConfigUpdate.label);
      })
      .catch(helpers.handler);
  });

  it('GET /PAYROLL_CONFIG/:ID returns a single Account Configuration', function () {
    return agent.get('/payroll_config/'.concat(payrollConfig.id))
      .then(function (res) {
        expect(res).to.have.status(200);
      })
      .catch(helpers.handler);
  });

  it('DELETE /PAYROLL_CONFIG/:ID will send back a 404 if the Account Configuration does not exist', function () {
    return agent.delete('/payroll_config/inknowRubric')
      .then(function (res) {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('DELETE /PAYROLL_CONFIG/:ID should delete an Account Configuration ', function () {
    return agent.delete('/payroll_config/'.concat(payrollConfig.id))
      .then(function (res) {
        helpers.api.deleted(res);
      })
      .catch(helpers.handler);
  });

});