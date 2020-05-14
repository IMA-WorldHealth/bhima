/* global expect, agent */
/* eslint-disable no-unused-expressions */

const helpers = require('./helpers');

/*
 * The /exchange API endpoint
 */
describe('(/exchange) The /exchange API endpoint', () => {

  // constants
  const RATE = {
    enterprise_id : 1, // Enterprise ID
    currency_id  : 1, // FC in test database
    rate         : 930,
    date         : new Date('2015-10-10'),
  };

  const RATE_KEY = [
    'id', 'enterprise_id', 'currency_id', 'enterprise_currency_id', 'rate', 'date',
  ];

  it('GET /exchange returns a list of exchange rates', () => {
    return agent.get('/exchange')
      .then((res) => {
        helpers.api.listed(res, 2);
      })
      .catch(helpers.handler);
  });


  it('GET /exchange?limit=1 only returns one exchange rate', () => {
    return agent.get('/exchange')
      .query({ limit : 1 })
      .then((res) => {
        helpers.api.listed(res, 1);
      })
      .catch(helpers.handler);
  });

  it('POST /exchange creates a new exchange rate', () => {
    return agent.post('/exchange')
      .send({ rate : RATE })
      .then((res) => {

        // make sure the API conforms to app standards
        helpers.api.created(res);

        RATE.id = res.body.id;
        return agent.get('/exchange');
      })
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.not.be.empty;
        expect(res.body[0]).to.not.be.empty;
        expect(res.body[0]).to.contain.keys('currency_id', 'date', 'rate');
      })
      .catch(helpers.handler);
  });

  it('PUT /exchange should update an existing exchange rate', () => {
    return agent.put(`/exchange/${RATE.id}`)
      .send({ rate : 925 })
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.keys(RATE_KEY);
        expect(res.body.rate).to.not.equal(RATE.rate);
      })
      .catch(helpers.handler);
  });

  it('PUT /exchange will send back a 404 if the exchange rate does not exist', () => {
    return agent.put('/exchange/123456789')
      .send({ rate : 1000000 })
      .then((res) => {

        // make sure the API conforms to app standards
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('PUT /exchange will send back a 404 if the exchange rate is a string', () => {
    return agent.put('/exchange/str')
      .send({ rate : 1000000 })
      .then((res) => {

        // make sure the API conforms to app standards
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('DELETE /exchange/:id will send back a 404 if the exchange rate does not exist', () => {
    return agent.delete('/exchange/123456789')
      .then((res) => {

        // make sure the API conforms to app standards
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('DELETE /exchange/:id will send back a 404 if the exchange rate id is a string', () => {
    return agent.delete('/exchange/str')
      .then((res) => {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('DELETE /exchange/:id should delete an exchange rate ', () => {
    return agent.delete(`/exchange/${RATE.id}`)
      .then((res) => {
        helpers.api.deleted(res);
      })
      .catch(helpers.handler);
  });
});
