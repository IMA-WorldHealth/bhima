/* global expect, chai, agent */
/* jshint expr : true */

const helpers = require('./helpers');

/*
 * The /purchases API endpoint
 *
 * This test suite implements full CRUD on the /purchases HTTP API endpoint.
 */
describe('(/purchases) Purchases', () => {

  // purchase order we will add during this test suite
  const purchaseOrder = {
    cost: 546.7520,
    date: new Date('2016-02-19'),
    currency_id: 1,
    supplier_uuid: '3ac4e83c-65f2-45a1-8357-8b025003d793',
    project_id: 1,
    user_id: 2,
    items: [{
      inventory_uuid: '289cc0a1-b90f-11e5-8c73-159fdc73ab02',
      quantity: 200,
      unit_price: 0.0538,
      total: 10.7520
    }, {
      inventory_uuid: 'c48a3c4b-c07d-4899-95af-411f7708e296',
      quantity: 16000,
      unit_price: 0.0335,
      total: 536.0000
    }]
  };

  const responseKeys = [
    'uuid', 'reference', 'cost', 'date', 'supplier', 'user_id', 'supplier_uuid', 'note'
  ];

  it('POST /purchases should create a new purchase order', () => {
    return agent.post('/purchases')
      .send(purchaseOrder)
      .then(res => {
        helpers.api.created(res);
        purchaseOrder.uuid = res.body.uuid;
        return agent.get(`/purchases/${purchaseOrder.uuid}`);
      })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body.cost).to.equal(purchaseOrder.cost);
      })
      .catch(helpers.handler);
  });

  it('POST /purchases returns 400 for an invalid purchase order', () => {
    return agent.post('/purchases')
      .send({})
      .then(res => helpers.api.errored(res, 400))
      .catch(helpers.handler);
  });

  it('GET /purchases/:uuid should return a single JSON purchase order', () => {
    return agent.get(`/purchases/${purchaseOrder.uuid}`)
      .then(res => {
        var purchase = res.body;
        expect(res).to.have.status(200);
        expect(res.body).to.not.be.empty;
        expect(purchase.uuid).to.exist;
      })
      .catch(helpers.handler);
  });

  it('GET /purchases?detailed=1 returns a complete list of purchase', () => {
    return agent.get('/purchases')
      .query({ detailed : 1 })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body[0]).to.contain.all.keys(responseKeys);
      })
      .catch(helpers.handler);
  });

  it('GET /purchases/:uuid returns 404 for an invalid purchase order', () => {
    return agent.get('/purchases/unknown')
      .then(res => helpers.api.errored(res, 404))
      .catch(helpers.handler);
  });


  it('PUT /purchases/:uuid unable to update an unknown purchase order', () => {
    return agent.put('/purchases/invalid')
      .send({ note : 'This was canceled a week ago' })
      .then(res => helpers.api.errored(res, 404))
      .catch(helpers.handler);
  });
});
