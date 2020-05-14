/* global expect, agent */

const helpers = require('./helpers');

/*
 * The /ipr_tax  API endpoint
 *
 * This test suite implements full CRUD on the /ipr_tax  HTTP API endpoint.
 */
describe('(/ipr_tax) The /ipr_tax  API endpoint', () => {
  // IPR TAX we will add during this test suite.

  const iprTax = {
    label         : 'IPR 2012',
    description   : 'Impot Professionnel sur le revenu 2012',
    currency_id   : 1,
  };

  const iprTaxConfig = {
    rate    : 0,
    tranche_annuelle_debut    : 0,
    tranche_annuelle_fin      : 524160,
    tranche_mensuelle_debut   : 0,
    tranche_mensuelle_fin     : 43680,
    ecart_annuel              : 524160,
    ecart_mensuel             : 43680,
    impot_annuel              : 0,
    impot_mensuel             : 0,
    cumul_annuel              : 0,
    cumul_mensuel             : 0,
  };

  const NUM_IPRTAX = 1;
  const NUM_CONFIG = 11;

  it('GET /IPRTAX returns a list of Ipr tax ', () => {
    return agent.get('/iprTax')
      .then((res) => {
        helpers.api.listed(res, NUM_IPRTAX);
      })
      .catch(helpers.handler);
  });

  it('POST /iprTax should create a new Ipr Tax', () => {
    return agent.post('/iprTax')
      .send(iprTax)
      .then((res) => {
        iprTax.id = res.body.id;
        iprTaxConfig.taxe_ipr_id = res.body.id;
        helpers.api.created(res);
      })
      .catch(helpers.handler);
  });

  it('GET /IPRTAX/:ID will send back a 404 if the Ipr tax id does not exist', () => {
    return agent.get('/iprTax/123456789')
      .then((res) => {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('GET /IPRTAX/:ID will send back a 404 if the Ipr tax id is a string', () => {
    return agent.get('/iprTax/str')
      .then((res) => {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('PUT /IPRTAX  should update an existing Ipr tax ', () => {
    return agent.put('/iprTax/'.concat(iprTax.id))
      .send({ label : 'Ipr Tax Updated' })
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res.body.label).to.equal('Ipr Tax Updated');
      })
      .catch(helpers.handler);
  });

  it('GET /IPRTAX/:ID returns a single Ipr Tax', () => {
    return agent.get('/iprTax/'.concat(iprTax.id))
      .then((res) => {
        expect(res).to.have.status(200);
      })
      .catch(helpers.handler);
  });

  it('POST /iprTaxiprTaxConfig should create a new Ipr Tax Configuration', () => {
    return agent.post('/iprTaxConfig')
      .send(iprTaxConfig)
      .then((res) => {
        iprTaxConfig.id = res.body.id;
        helpers.api.created(res);
      })
      .catch(helpers.handler);
  });

  it('GET /IPRTAXCONFIG returns a list of Ipr Configuration By tax ', () => {
    return agent.get('/iprTaxConfig')
      .then((res) => {
        helpers.api.listed(res, NUM_CONFIG);
      })
      .catch(helpers.handler);
  });

  it('GET /IPRTAXCONFIG/:ID will send back a 404 if the Ipr tax Configuration id does not exist', () => {
    return agent.get('/iprTaxConfig/123456789')
      .then((res) => {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('GET /IPRTAXCONFIG/:ID will send back a 404 if the Ipr tax Configuration id is a string', () => {
    return agent.get('/iprTaxConfig/str')
      .then((res) => {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('PUT /IPRTAXCONFIG  should update an existing scale of Ipr tax Configuration', () => {
    return agent.put('/iprTaxConfig/'.concat(iprTaxConfig.id))
      .send({ rate : 15 })
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res.body.rate).to.equal(15);
      })
      .catch(helpers.handler);
  });

  it('GET /IPRTAXCONFIG/:ID returns a scale of Ipr Tax Configuration', () => {
    return agent.get('/iprTaxConfig/'.concat(iprTaxConfig.id))
      .then((res) => {
        expect(res).to.have.status(200);
      })
      .catch(helpers.handler);
  });

  it('DELETE /IPRTAXCONFIG/:ID will send back a 404 if the Ipr Tax Configuration id does not exist', () => {
    return agent.delete('/iprTaxConfig/123456789')
      .then((res) => {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('DELETE /IPRTAXCONFIG/:ID will send back a 404 if the Ipr Tax Configuration id is a string', () => {
    return agent.delete('/iprTaxConfig/str')
      .then((res) => {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('DELETE /IPRTAXCONFIG/:ID should delete a scale of Ipr Tax Configuration', () => {
    return agent.delete('/iprTaxConfig/'.concat(iprTaxConfig.id))
      .then((res) => {
        helpers.api.deleted(res);
      })
      .catch(helpers.handler);
  });

  it('DELETE /IPRTAX/:ID will send back a 404 if the Ipr Tax id does not exist', () => {
    return agent.delete('/iprTax/123456789')
      .then((res) => {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('DELETE /IPRTAX/:ID will send back a 404 if the Ipr Tax id is a string', () => {
    return agent.delete('/iprTax/str')
      .then((res) => {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('DELETE /IPRTAX/:ID should delete a Ipr Tax', () => {
    return agent.delete('/iprTax/'.concat(iprTax.id))
      .then((res) => {
        helpers.api.deleted(res);
      })
      .catch(helpers.handler);
  });
});
