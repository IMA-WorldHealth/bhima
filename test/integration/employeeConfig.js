/* global expect, agent */

const helpers = require('./helpers');

/*
 * The /payroll/employee_configuration  API endpoint
 *
 * This test suite implements full CRUD on the /payroll/employee_configuration  HTTP API endpoint.
 */
describe('(/payroll/account_configuration) The /payroll/employee_configuration  API endpoint', () => {
  // Employee Payroll Configuration we will add during this test suite.

  const employeeConfig = {
    label : 'Employee Configuration 2017',
  };

  const employeeConfigUpdate = {
    label : 'Employee Configuration 2018',
  };

  const defaultEmployeeConfiguration = 1;

  const configEmployee = {
    configuration : [
      '6b4642a7-4577-4768-b6ae-1b3d38f0bbef',
      '75e09694-65f2-45a1-a8a2-8b025003d793',
      '75e69409-562f-a2a8-45a1-3d7938b02500'
      ]
    };

  const NUM_EMPLOYEE_CONFIG = 1;

  it('GET /EMPLOYEE_CONFIG returns a list of Employee Configurations ', () => {
    return agent.get('/employee_config')
      .then((res) => {
        helpers.api.listed(res, NUM_EMPLOYEE_CONFIG);
      })
      .catch(helpers.handler);
  });

  it('POST /EMPLOYEE_CONFIG should create a new Employee Configuration', () => {
    return agent.post('/employee_config')
      .send(employeeConfig)
      .then((res) => {
        employeeConfig.id = res.body.id;
        helpers.api.created(res);
      })
      .catch(helpers.handler);
  });

  it('GET /EMPLOYEE_CONFIG/:ID should not be found for unknown id', () => {
    return agent.get('/employee_config/unknownEmployee')
      .then((res) => {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('PUT /EMPLOYEE_CONFIG should update an existing Employee Configuration', () => {
    return agent.put('/employee_config/'.concat(employeeConfig.id))
      .send(employeeConfigUpdate)
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res.body.label).to.equal('Employee Configuration 2018');
      })
      .catch(helpers.handler);
  });

  it('GET /EMPLOYEE_CONFIG/:ID returns a single Employee Configuration', () => {
    return agent.get('/employee_config/'.concat(employeeConfig.id))
      .then((res) => {
        expect(res).to.have.status(200);
      })
      .catch(helpers.handler);
  });

  it('DELETE /EMPLOYEE_CONFIG/:ID will send back a 404 if the Employee Configuration does not exist', () => {
    return agent.delete('/employee_config/inknowRubric')
      .then((res) => {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('DELETE /EMPLOYEE_CONFIG/:ID should delete an Employee Configuration ', () => {
    return agent.delete('/employee_config/'.concat(employeeConfig.id))
      .then((res) => {
        helpers.api.deleted(res);
      })
      .catch(helpers.handler);
  });

  // INTEGRATION TEST FOR SETTING EMPLOYEE IN CONFIGURATION
  it('POST /EMPLOYEE_CONFIG/:ID/SETTING should Set Employees in Configuration', () => {
    return agent.post(`/employee_config/${defaultEmployeeConfiguration}/setting`)
      .send(configEmployee)
      .then((res) => {
        expect(res).to.have.status(201);
        return agent.get(`/employee_config/${defaultEmployeeConfiguration}/setting`);
      })
      .then(res => {
        helpers.api.listed(res, 3);
        expect(res).to.have.status(200);
        expect(res.body).to.not.be.empty;
      })
      .catch(helpers.handler);
  });


});
