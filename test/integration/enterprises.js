/* global expect, agent */

const helpers = require('./helpers');

/*
 * The /enterprises API endpoint
 * This test suite implements full CRUD on the /enterprises HTTP API endpoint.
 */
describe('(/enterprises) Enterprises API', () => {

  const enterprise = {
    name : 'enterprises',
    abbr : 'T.E.S.T',
    email : 'enterprises@test.org',
    po_box : 'enterprises',
    phone : '2016',
    location_id : '1f162a10-9f67-4788-9eff-c1fea42fcc9b',
    logo : null,
    currency_id : 2,
  };

  const updateEnterprise = {
    name : 'updateEnterprises',
    abbr : 'upd',
    phone : '00904940950932016',
    location_id : '1f162a10-9f67-4788-9eff-c1fea42fcc9b',
    currency_id : 1,
    settings : { enable_price_lock : 0 },
  };

  const invalidEnterprise = {
    name : null,
    abbr : null,
    email : 'enterprises@test.org',
    po_box : 'enterprises',
    phone : '2016',
    location_id : null,
    logo : null,
    currency_id : null,
  };

  /*  the number of enterprises registered in the test db */
  const numEnterprises = 2;

  /* response keys from a detailed query */
  const responseKeys = [
    'id', 'name', 'abbr', 'email', 'po_box', 'phone',
    'location_id', 'logo', 'currency_id', 'gain_account_id', 'loss_account_id',
    'settings',
  ];

  it('POST /enterprises will register a valid enterprises', () => {
    return agent.post('/enterprises')
      .send({ enterprise })
      .then(res => {
        helpers.api.created(res);
        enterprise.id = res.body.id;
        return agent.get(`/enterprises/${res.body.id}`);
      })
      .then(res => {
        expect(res).to.have.status(200);
      })
      .catch(helpers.handler);
  });

  it('POST /enterprises will not register an incomplete enterprise', () => {
    return agent.post('/enterprises')
      .send({ enterprise : invalidEnterprise })
      .then(res => {
        helpers.api.errored(res, 400);
      })
      .catch(helpers.handler);
  });

  it('PUT /enterprises/:id should update an existing enterprises', () => {
    return agent.put(`/enterprises/${enterprise.id}`)
      .send(updateEnterprise)
      .then(res => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.have.all.keys(responseKeys);
      })
      .catch(helpers.handler);
  });

  it('GET /enterprises returns a list of enterprises', () => {
    return agent.get('/enterprises')
      .then(res => {
        helpers.api.listed(res, numEnterprises);
      })
      .catch(helpers.handler);
  });

  it('GET /enterprises?detailed=1 returns a enterprises list with all keys', () => {
    return agent.get('/enterprises')
      .query({ detailed : 1 })
      .then(res => {
        helpers.api.listed(res, numEnterprises);
        expect(res.body[0]).to.have.all.keys(responseKeys);
      })
      .catch(helpers.handler);
  });

  it('GET /enterprises/:id returns a single enterprise', () => {
    return agent.get(`/enterprises/${enterprise.id}`)
      .then(res => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
      })
      .catch(helpers.handler);
  });

  it('GET /enterprises/:id returns a 404 error for unknown enterprises', () => {
    return agent.get('/enterprises/unknown')
      .then(res => {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });
});
