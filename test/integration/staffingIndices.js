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


  it('POST /staffing_indices add a new staffing indice', () => {
    return agent.post('/staffing_indices')
      .send(newIndice)
      .then(res => {
        expect(res).to.have.status(201);
      })
      .catch(helpers.handler);
  });


  it('GET /staffing_indices returns a list of indices with one indice', () => {
    return agent.get('/staffing_indices')
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array');
        expect(res.body).to.have.length(1);
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
});
