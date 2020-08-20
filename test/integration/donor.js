/* eslint no-unused-expressions:off */
/* global expect, agent */

const helpers = require('./helpers');

/*
 * The /donors API endpoint
 *
 * This test suite implements full CRUD on the /donor HTTP API endpoint.
 */
describe('(/donors) The donros API endpoint', () => {

  // donor we will add during this test suite.
  const newDonor = {
    id : 2,
    display_name : 'IMA',
  };

  const updatedDonor = {
    display_name : 'DFID',
  };

  // default donor in data.sql
  it('GET /donors returns a list of one donor', async () => {
    try {
      const res = await agent.get('/donors');
      expect(res).to.have.status(200);
      expect(res.body).to.be.an('array');
      expect(res.body).to.have.length(1);
    } catch (error) {
      helpers.handler(error);
    }
  });

  it('POST /donors add a new donor', async () => {
    try {
      const res = await agent.post('/donors').send(newDonor);
      expect(res).to.have.status(201);
    } catch (error) {
      helpers.handler(error);
    }

  });

  it('GET /donors/:id  find donor by id', async () => {

    try {
      const res = await agent.get(`/donors/${newDonor.id}`);
      expect(res).to.have.status(200);
      expect(newDonor).to.deep.equal(res.body);
    } catch (error) {
      helpers.handler(error);
    }
  });

  it('PUT /donors update donors\'s display_name', async () => {

    try {
      const res = await agent.put(`/donors/${newDonor.id}`).send(updatedDonor);
      expect(res).to.have.status(200);
    } catch (error) {
      helpers.handler(error);
    }
  });

});
