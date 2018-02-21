/* global expect, agent */

const helpers = require('./helpers');

/*
 * The /ipr_tax  API endpoint
 *
 * This test suite implements full CRUD on the /ipr_tax  HTTP API endpoint.
 */
describe('(/ipr_tax) The /ipr_tax  API endpoint', function () {
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

  it('GET /IPRTAX returns a list of Ipr tax ', function () {
    return agent.get('/iprTax')
      .then(function (res) {
        helpers.api.listed(res, NUM_IPRTAX);
      })
      .catch(helpers.handler);
  });

  it('POST /iprTax should create a new Ipr Tax', function () {
    return agent.post('/iprTax')
      .send(iprTax)
      .then(function (res) {
        iprTax.id = res.body.id;
        iprTaxConfig.taxe_ipr_id = res.body.id; 
        helpers.api.created(res);
      })
      .catch(helpers.handler);
  });

  it('GET /IPRTAX/:ID should not be found for unknown id', function () {
    return agent.get('/iprTax/unknownOffday')
      .then(function (res) {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('PUT /IPRTAX  should update an existing Ipr tax ', function () {
    return agent.put('/iprTax/'.concat(iprTax.id))
      .send({ label : 'Ipr Tax Updated' })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body.label).to.equal('Ipr Tax Updated');
      })
      .catch(helpers.handler);
  });

  it('GET /IPRTAX/:ID returns a single Ipr Tax', function () {
    return agent.get('/iprTax/'.concat(iprTax.id))
      .then(function (res) {
        expect(res).to.have.status(200);
      })
      .catch(helpers.handler);
  });

  it('POST /iprTaxiprTaxConfig should create a new Ipr Tax Configuration', function () {
    return agent.post('/iprTaxConfig')
      .send(iprTaxConfig)
      .then(function (res) {
        iprTaxConfig.id = res.body.id;
        helpers.api.created(res);
      })
      .catch(helpers.handler);
  });

  it('GET /IPRTAXCONFIG returns a list of Ipr Configuration By tax ', function () {
    return agent.get('/iprTaxConfig')
      .then(function (res) {
        helpers.api.listed(res, NUM_CONFIG);
      })
      .catch(helpers.handler);
  });

  it('GET /IPRTAXCONFIG/:ID should not be found for unknown id', function () {
    return agent.get('/iprTaxConfig/unknownOffday')
      .then(function (res) {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('PUT /IPRTAXCONFIG  should update an existing scale of Ipr tax Confuguration', function () {
    return agent.put('/iprTaxConfig/'.concat(iprTaxConfig.id))
      .send({ rate : 15 })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body.rate).to.equal(15);
      })
      .catch(helpers.handler);
  });

  it('GET /IPRTAXCONFIG/:ID returns a scale of Ipr Tax Configuration', function () {
    return agent.get('/iprTaxConfig/'.concat(iprTaxConfig.id))
      .then(function (res) {
        expect(res).to.have.status(200);
      })
      .catch(helpers.handler);
  });

  it('DELETE /IPRTAXCONFIG/:ID will send back a 404 if the Ipr Tax does not exist', function () {
    return agent.delete('/iprTaxConfig/inknowOffday')
      .then(function (res) {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('DELETE /IPRTAXCONFIG/:ID should delete a scale of Ipr Tax Configuration', function () {
    return agent.delete('/iprTaxConfig/'.concat(iprTaxConfig.id))
      .then(function (res) {
        helpers.api.deleted(res);
      })
      .catch(helpers.handler);
  });

  it('DELETE /IPRTAX/:ID will send back a 404 if the Ipr Tax does not exist', function () {
    return agent.delete('/iprTax/inknowOffday')
      .then(function (res) {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('DELETE /IPRTAX/:ID should delete a Ipr Tax', function () {
    return agent.delete('/iprTax/'.concat(iprTax.id))
      .then(function (res) {
        helpers.api.deleted(res);
      })
      .catch(helpers.handler);
  });
});
