/* global expect, agent */
/* eslint-disable no-unused-expressions */
const moment = require('moment');
const helpers = require('./helpers');
const SearchTests = require('./purchase.search.js');

/*
 * The /purchases API endpoint
 *
 * This test suite implements full CRUD on the /purchases HTTP API endpoint.
 */
describe('(/purchases) Purchases', () => {
  const datePurchase1 = moment(new Date(), 'YYYY-MM-DD').subtract(1725, 'days');
  const datePurchaseFormat1 = moment(datePurchase1).format('YYYY-MM-DD');

  const datePurchase2 = moment(new Date(), 'YYYY-MM-DD').subtract(1665, 'days');
  const datePurchaseFormat2 = moment(datePurchase2).format('YYYY-MM-DD');

  const datePurchase3 = moment(new Date(), 'YYYY-MM-DD').subtract(1542, 'days');
  const datePurchaseFormat3 = moment(datePurchase3).format('YYYY-MM-DD');

  const datePurchase4 = moment(new Date(), 'YYYY-MM-DD').subtract(1512, 'days');
  const datePurchaseFormat4 = moment(datePurchase4).format('YYYY-MM-DD');

  const datePurchase5 = moment(new Date(), 'YYYY-MM-DD').subtract(1421, 'days');
  const datePurchaseFormat5 = moment(datePurchase5).format('YYYY-MM-DD');

  // purchase order we will add during this test suite
  const purchaseOrder = {
    cost          : 546.7520,
    date          : new Date(datePurchaseFormat1),
    currency_id   : 1,
    supplier_uuid : '3ac4e83c-65f2-45a1-8357-8b025003d793',
    project_id    : 1,
    user_id       : 2,
    status_id     : 1,
    items         : [{
      inventory_uuid : helpers.data.QUININE,
      quantity       : 200,
      unit_price     : 0.0538,
      total          : 10.7520,
    }, {
      inventory_uuid : helpers.data.PREDNISONE,
      quantity       : 16000,
      unit_price     : 0.0335,
      total          : 536.0000,
    }],
  };

  const purchaseOrder2 = {
    cost          : 536.0000,
    date          : new Date(datePurchaseFormat2),
    currency_id   : 1,
    supplier_uuid : '3ac4e83c-65f2-45a1-8357-8b025003d793',
    project_id    : 1,
    user_id       : 2,
    status_id     : 2,
    items         : [{
      inventory_uuid : helpers.data.PREDNISONE,
      quantity       : 16000,
      unit_price     : 0.0335,
      total          : 536.0000,
    }],
  };

  const purchaseOrder3 = {
    cost          : 10.7520,
    date          : new Date(datePurchaseFormat3),
    currency_id   : 1,
    supplier_uuid : '3ac4e83c-65f2-45a1-8357-8b025003d793',
    project_id    : 1,
    user_id       : 2,
    status_id     : 2,
    items         : [{
      inventory_uuid : helpers.data.QUININE,
      quantity       : 200,
      unit_price     : 0.0538,
      total          : 10.7520,
    }],
  };

  const purchaseOrder4 = {
    cost          : 546.7520,
    date          : new Date(datePurchaseFormat4),
    currency_id   : 1,
    supplier_uuid : '3ac4e83c-65f2-45a1-8357-8b025003d793',
    project_id    : 1,
    user_id       : 2,
    status_id     : 2,
    items         : [{
      inventory_uuid : helpers.data.QUININE,
      quantity       : 200,
      unit_price     : 0.0538,
      total          : 10.7520,
    }, {
      inventory_uuid : helpers.data.PREDNISONE,
      quantity       : 16000,
      unit_price     : 0.0335,
      total          : 536.0000,
    }],
  };

  const purchaseOrder5 = {
    cost          : 546.7520,
    date          : new Date(datePurchaseFormat5),
    currency_id   : 1,
    supplier_uuid : '3ac4e83c-65f2-45a1-8357-8b025003d793',
    project_id    : 1,
    user_id       : 2,
    status_id     : 2,
    items         : [{
      inventory_uuid : helpers.data.QUININE,
      quantity       : 200,
      unit_price     : 0.0538,
      total          : 10.7520,
    }, {
      inventory_uuid : helpers.data.PREDNISONE,
      quantity       : 16000,
      unit_price     : 0.0335,
      total          : 536.0000,
    }],
  };

  const responseKeys = [
    'uuid', 'reference', 'cost', 'date', 'supplier', 'user_id', 'supplier_uuid', 'note',
    'status_id',
  ];

  it('POST /purchases should create a new purchase order', () => {
    return agent.post('/purchases')
      .send(purchaseOrder)
      .then((res) => {
        helpers.api.created(res);
        purchaseOrder.uuid = res.body.uuid;
        return agent.get(`/purchases/${purchaseOrder.uuid}`);
      })
      .then((res) => {
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
      .then((res) => {
        const purchase = res.body;
        expect(res).to.have.status(200);
        expect(res.body).to.not.be.empty;
        expect(purchase.uuid).to.exist;
      })
      .catch(helpers.handler);
  });

  it('GET /purchases?detailed=1 returns a complete list of purchase', () => {
    return agent.get('/purchases')
      .query({ detailed : 1 })
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body[0]).to.contain.all.keys(responseKeys);
      })
      .catch(helpers.handler);
  });

  it('GET /purchases/:uuid will send back a 404 if the purchases id does not exist', () => {
    return agent.get('/purchases/123456789')
      .then(res => helpers.api.errored(res, 404))
      .catch(helpers.handler);
  });

  it('GET /purchases/:uuid will send back a 404 if the purchases id is a string', () => {
    return agent.get('/purchases/str')
      .then(res => helpers.api.errored(res, 404))
      .catch(helpers.handler);
  });

  it('PUT /purchases/:uuid unable to update an unknown purchase order', () => {
    return agent.put('/purchases/invalid')
      .send({ note : 'This was canceled a week ago' })
      .then(res => helpers.api.errored(res, 404))
      .catch(helpers.handler);
  });

  it('GET /purchases?inventory_uuid=X returns purchases by inventory_uuid', () => {
    return agent.get('/purchases')
      .query({ inventory_uuid : helpers.data.QUININE })
      .then((res) => {
        helpers.api.listed(res, 2);

        return agent.get('/purchases')
          .query({ inventory_uuid : helpers.data.PREDNISONE });
      })
      .then((res) => {
        helpers.api.listed(res, 3);
      })
      .catch(helpers.handler);
  });

  // Integration test to test the calculation of the average command interval
  it('POST /purchases create confirmed purchase order 2', () => {
    return agent.post('/purchases')
      .send(purchaseOrder2)
      .catch(helpers.handler);
  });

  it('POST /purchases create confirmed purchase order 3', () => {
    return agent.post('/purchases')
      .send(purchaseOrder3)
      .then((res) => {
        purchaseOrder3.uuid = res.body.uuid;
      })
      .catch(helpers.handler);
  });

  it('POST /purchases create confirmed purchase order 4', () => {
    return agent.post('/purchases')
      .send(purchaseOrder4)
      .catch(helpers.handler);
  });

  it('POST /purchases create confirmed purchase order 5', () => {
    return agent.post('/purchases')
      .send(purchaseOrder5)
      .catch(helpers.handler);
  });

  it(`GET /inventory/metadata/:uuid downloads
    Checking the calculation of the order interval for inventory: ${helpers.data.QUININE_TEXT}`, () => {
    return agent.get(`/inventory/metadata/${helpers.data.QUININE}`)
      .then(res => {
        expect(res.body.purchase_interval).to.be.equal(2);
        expect(res.body.num_purchase).to.be.equal(3);
      })
      .catch(helpers.handler);
  });

  it(`GET /inventory/metadata/:uuid downloads
    Checking the calculation of the order interval for inventory: ${helpers.data.PREDNISONE_TEXT}`, () => {
    return agent.get(`/inventory/metadata/${helpers.data.PREDNISONE}`)
      .then(res => {
        expect(res.body.purchase_interval).to.be.equal(3.7700);
        expect(res.body.num_purchase).to.be.equal(4);
      })
      .catch(helpers.handler);
  });

  it(`PUT /purchases/:uuid Modification of the status of the purchase order
    in order to verify the modifications on the calculation of the order interval and the number of orders`, () => {
    return agent.put(`/purchases/${purchaseOrder3.uuid}`)
      .send({ status_id : 1, date : new Date(datePurchaseFormat3) })
      .catch(helpers.handler);
  });

  it(`GET /inventory/metadata/:uuid downloads
    Checking the calculation of the order interval for inventory
    After Updating status:: ${helpers.data.QUININE_TEXT}`, () => {
    return agent.get(`/inventory/metadata/${helpers.data.QUININE}`)
      .then(res => {
        expect(res.body.purchase_interval).to.be.equal(2.99);
        expect(res.body.num_purchase).to.be.equal(2);
      })
      .catch(helpers.handler);
  });

  describe('/purchases/search', SearchTests);
});
