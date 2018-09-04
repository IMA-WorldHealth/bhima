/* global expect, chai, agent */

const helpers = require('./helpers');

/*
 * The /functions  API endpoint
 *
 * This test suite implements full CRUD on the /functions  HTTP API endpoint.
 */
describe('(/functions) The /functions  API endpoint', () => {

  // Function we will add during this test suite.
  const fonction = {
    fonction_txt : 'Anestiologiste',
  };

  const FUNCTION_KEY = ['id', 'fonction_txt'];
  const NUM_FUNCTIONS = 2;

  it('GET /FUNCTIONS returns a list of function ', () => {
    return agent.get('/functions')
      .then((res) => {
        helpers.api.listed(res, NUM_FUNCTIONS);
      })
      .catch(helpers.handler);
  });

  it('POST /FUNCTIONS should create a new Function', () => {
    return agent.post('/functions')
      .send(fonction)
      .then((res) => {
        fonction.id = res.body.id;
        helpers.api.created(res);
      })
      .catch(helpers.handler);
  });

  it('GET /FUNCTIONS/:ID should not be found for unknown id', () => {
    return agent.get('/functions/unknownFunction')
      .then((res) => {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('PUT /FUNCTIONS  should update an existing Function ', () => {
    return agent.put(`/functions/${fonction.id}`)
      .send({ fonction_txt : 'Imagerie Medicale' })
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.keys(FUNCTION_KEY);
        expect(res.body.fonction_txt).to.equal('Imagerie Medicale');
      })
      .catch(helpers.handler);
  });

  it('GET /FUNCTIONS/:ID returns a single Function ', () => {
    return agent.get(`/functions/${fonction.id}`)
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
      })
      .catch(helpers.handler);
  });

  it('DELETE /FUNCTIONS/:ID will send back a 404 if the Function does not exist', () => {
    return agent.delete('/functions/inknowFunction')
      .then((res) => {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('DELETE /FUNCTIONS/:ID should delete a Function ', () => {
    return agent.delete(`/functions/${fonction.id}`)
      .then((res) => {
        helpers.api.deleted(res);
      })
      .catch(helpers.handler);
  });
});
