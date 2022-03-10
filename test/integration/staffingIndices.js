/* eslint no-unused-expressions:off */
/* global expect, agent */

const helpers = require('./helpers');

/*
 * The /staffing_indices API endpoint
 *
 * This test suite implements full CRUD on the /staffing_indices HTTP API endpoint.
 */
describe('(/staffing_indices) The staffing indices API endpoint', () => {
  const newIndice = {
    uuid : 'd2f7ef71-6f3e-44bd-8056-378c5ca26e20',
    grade_uuid : '9EE06E4A7B5948E6812CC0F8A00CF7D3',
    employee_uuid : '75E0969465F245A1A8A28B025003D793',
    fonction_id : 2,
    function_indice : 125,
    grade_indice : 125,
  };

  const newIndiceUpdate = {
    uuid : 'd2f7ef71-6f3e-44bd-8056-378c5fa26e20',
    grade_uuid : '71E9F21CD9B111E58AB778EB2F2A46E0',
    employee_uuid : '75E69409562FA2A845A13D7938B02500',
    fonction_id : 1,
    function_indice : 10,
    grade_indice : 20,
  };

  const newIndiceTest = {
    uuid : 'a2g7ef71-6f3e-44bd-8056-378c5fa26e30',
    employee_uuid : '75E69409562FA2A845A13D7938B02500',
    grade_uuid : '71E9F21CD9B111E58AB778EB2F2A46E0',
    fonction_id : 1,
    function_indice : 100,
    grade_indice : 20,
  };

  const staffingGradeIndice = {
    uuid : '71e9f21c-d9b1-11e5-8ab7-78eb2f2a46e0',
    grade_uuid : '9ee06e4a-7b59-48e6-812c-c0f8a00cf7d3',
    value : 80,
  };

  const staffingFunctionIndice = {
    uuid : '9ee06e4a-7b59-48e6-812c-c0f8a00cf7d3',
    fonction_id : 1,
    value : 80,
  };

  const dataSetUpConfiguration = {
    payroll_configuration_id : 6,
    pay_envelope : 1200,
    working_days : '26',
  };

  const paramsMultipayrollIndice = {
    currency_id : 2,
    payroll_configuration_id : 6,
  };

  it('POST /staffing_indices add a new staffing indice', () => {
    return agent.post('/staffing_indices')
      .send(newIndice)
      .then(res => {
        expect(res).to.have.status(201);
      })
      .catch(helpers.handler);
  });

  it('GET /staffing_indices returns a list of indices with five indice', () => {
    return agent.get('/staffing_indices')
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array');
        expect(res.body).to.have.length(4);
      })
      .catch(helpers.handler);
  });

  it('PUT /staffing_indices update value', () => {
    return agent.put(`/staffing_indices/${newIndice.uuid}`)
      .send(newIndiceUpdate)
      .then(res => {
        expect(res).to.have.status(200);
      })
      .catch(helpers.handler);
  });

  it('POST /staffing_indices add a test indice', () => {
    return agent.post('/staffing_indices')
      .send(newIndiceTest)
      .then(res => {
        expect(res).to.have.status(201);
      })
      .catch(helpers.handler);
  });

  it('DELETE /staffing_indices add a test indice', () => {
    return agent.delete(`/staffing_indices/${newIndiceTest.uuid}`)
      .then(res => {
        expect(res).to.have.status(200);
      })
      .catch(helpers.handler);
  });

  // staffing_grade_indices
  it('DELETE /staffing_grade_indices delete a test indice', () => {
    return agent.delete(`/staffing_grade_indices/${staffingGradeIndice.uuid}`)
      .then(res => {
        expect(res).to.have.status(200);
      })
      .catch(helpers.handler);
  });

  it('POST /staffing_grade_indices add a new staffing indice', () => {
    return agent.post('/staffing_grade_indices')
      .send(staffingGradeIndice)
      .then(res => {
        expect(res).to.have.status(201);
      })
      .catch(helpers.handler);
  });

  it('GET /staffing_grade_indices returns a list of staffing grade indices(3 records)', () => {
    return agent.get('/staffing_grade_indices')
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array');
        expect(res.body).to.have.length(3);
      })
      .catch(helpers.handler);
  });

  // staffing function indices
  it('DELETE /staffing_function_indices delete a test indice', () => {
    return agent.delete(`/staffing_function_indices/${staffingFunctionIndice.uuid}`)
      .then(res => {
        expect(res).to.have.status(200);
      })
      .catch(helpers.handler);
  });

  it('POST /staffing_function_indices add a new staffing indice', () => {
    return agent.post('/staffing_function_indices')
      .send(staffingFunctionIndice)
      .then(res => {
        expect(res).to.have.status(201);
      })
      .catch(helpers.handler);
  });

  it('GET /staffing_function_indices returns a list of staffing function indices(2 records)', () => {
    return agent.get('/staffing_function_indices')
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array');
        expect(res.body).to.have.length(2);
      })
      .catch(helpers.handler);
  });

  it('POST /multiple_payroll_indice/parameters/ should create staffing indices Set up for payment', () => {
    return agent.post('/multiple_payroll_indice/parameters/')
      .send(dataSetUpConfiguration)
      .then((res) => {
        expect(res).to.have.status(201);
      })
      .catch(helpers.handler);
  });

  it('GET /multiple_payroll_indice/ returns a list of ', () => {
    return agent.get('/multiple_payroll_indice/')
      .query(paramsMultipayrollIndice)
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.employees[0].rubrics[1].rubric_abbr).to.equal('Salaire brute');
        expect(res.body.employees[0].rubrics[1].rubric_value).to.equal(682.87);

        expect(res.body.employees[1].rubrics[3].rubric_abbr).to.equal('Salaire brute');
        expect(res.body.employees[1].rubrics[3].rubric_value).to.equal(517.13);
      })
      .catch(helpers.handler);
  });
});
