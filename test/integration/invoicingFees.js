/* global expect, agent */

const helpers = require('./helpers');

/*
 * The /invoicing_fees API endpoint
 */
describe('(/invoicing_fees) Billing Services API', () => {
  const billingServiceA = {
    account_id :  260, // 75881010 - Autres revenus
    label :       'Test Billing Service A',
    description : 'This is definitely a billing service.',
    value :       13.0,
  };

  // test negative values
  const billingServiceB = {
    account_id :  260, // 75881010 - Autres revenus
    label :       'Test Billing Service B',
    description : 'Billing Services should not have negative values, right?',
    value :       -15.0,
  };

  const responseKeys = [
    'id', 'account_id', 'label', 'description', 'value', 'number', 'created_at',
    'updated_at',
  ];

  it('GET /invoicing_fees should return a list of two billing service', () => {
    return agent.get('/invoicing_fees')
      .then(res => {
        helpers.api.listed(res, 2);
      })
      .catch(helpers.handler);
  });

  it('GET /invoicing_fees/undefined should reject (404) an unknown id', () => {
    return agent.get('/invoicing_fees/undefined')
      .then(res => {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('POST /invoicing_fees should create a new, valid billing service', () => {
    return agent.post('/invoicing_fees')
      .send({ billingService : billingServiceA })
      .then(res => {
        helpers.api.created(res);

        // bind the database-generated ID
        billingServiceA.id = res.body.id;
        return agent.get('/invoicing_fees/' + billingServiceA.id);
      })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.contain.all.keys(responseKeys);

        // these props should be identical
        expect(res.body.id).to.equal(billingServiceA.id);
        expect(res.body.label).to.equal(billingServiceA.label);
        expect(res.body.description).to.equal(billingServiceA.description);
        expect(res.body.value).to.equal(billingServiceA.value);
      })
      .catch(helpers.handler);
  });

  it('POST /invoicing_fees should reject an invalid billing service', () => {
    return agent.post('/invoicing_fees')
      .send({ billingService : billingServiceB })
      .then(res => {
        helpers.api.errored(res, 400);
      })
      .catch(helpers.handler);
  });

  it('PUT /invoicing_fees should update a billing service', () => {
    const label = 'Yadaya, I changed the label!';

    return agent.put(`/invoicing_fees/${billingServiceA.id}`)
      .send({ billingService : { label } })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;

        // these props should be identical
        expect(res.body.id).to.equal(billingServiceA.id);
        expect(res.body.label).to.equal(label);
        expect(res.body.description).to.equal(billingServiceA.description);
        expect(res.body.value).to.equal(billingServiceA.value);
      })
      .catch(helpers.handler);
  });

  it('GET /invoicing_fees?detailed=1 should return a detailed list of three billing services', () => {
    return agent.get('/invoicing_fees?detailed=1')
      .then(res => {
        helpers.api.listed(res, 3);
        expect(res.body[0]).to.contain.all.keys(responseKeys);
      })
      .catch(helpers.handler);
  });

  it('DELETE /invoicing_fees/undefined should return a 404 error', () => {
    return agent.delete('/invoicing_fees/undefined')
      .then(res => {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('DELETE /invoicing_fees/:id should delete an existing billing service', () => {
    return agent.delete(`/invoicing_fees/${billingServiceA.id}`)
      .then(res => {
        helpers.api.deleted(res);
        return agent.get(`/invoicing_fees/${billingServiceA.id}`);
      })
      .then(res => {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });
});
