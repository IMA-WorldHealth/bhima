/* global expect, chai, agent */
/* jshint expr : true */

const helpers = require('./helpers');

/*
 * The /exchange API endpoint
 */
describe('(/exchange) The /exchange API endpoint', function () {

  // constants
  const RATE = {
    enterprise_id: 1,    // Enterprise ID
    currency_id  : 1,    // FC in test database
    rate         : 930,
    date         : new Date('2015-10-10')
  };

  const RATE_KEY = [
    'id', 'enterprise_id', 'currency_id', 'enterprise_currency_id', 'rate', 'date'
  ];

  it('GET /exchange returns a list of exchange rates', function () {
    return agent.get('/exchange')
      .then(function (res) {
        helpers.api.listed(res, 2);
      })
      .catch(helpers.handler);
  });


  it('GET /exchange?limit=1 only returns one exchange rate', function () {
    return agent.get('/exchange')
      .query({ limit : 1 })
      .then(function (res) {
        helpers.api.listed(res, 1);
      })
      .catch(helpers.handler);
  });

  it('POST /exchange creates a new exchange rate', function () {
    return agent.post('/exchange')
      .send({ rate : RATE })
      .then(function (res) {

        // make sure the API conforms to app standards
        helpers.api.created(res);

        RATE.id = res.body.id;
        return agent.get('/exchange');
      })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.not.be.empty;
        expect(res.body[0]).to.not.be.empty;
        expect(res.body[0]).to.contain.keys('currency_id', 'date', 'rate');
      })
      .catch(helpers.handler);
  });

  it('PUT /exchange should update an existing exchange rate', function () {
    return agent.put('/exchange/' + RATE.id)
      .send({ rate : 925 })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.have.keys(RATE_KEY);
        expect(res.body.rate).to.not.equal(RATE.rate);
      })
      .catch(helpers.handler);
  });

  it('PUT /exchange should update an unknown exchange rate', function () {
    return agent.put('/exchange/unknownexchangerate')
      .send({ rate : 1000000 })
      .then(function (res) {

        // make sure the API conforms to app standards
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });


  it('DELETE /exchange/:id will send back a 404 if the exchage rate does not exist', function () {
    return agent.delete('/exchange/unknownexchangerate')
      .then(function (res) {

        // make sure the API conforms to app standards
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('DELETE /exchange/:id should delete an exchange rate ', function () {
    return agent.delete('/exchange/' + RATE.id)
      .then(function (res) {
        helpers.api.deleted(res);
      })
      .catch(helpers.handler);
  });
});
