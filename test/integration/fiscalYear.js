/* global expect, chai, agent */
/* jshint expr : true */

const helpers = require('./helpers');

describe('(/fiscal) Fiscal Year', function () {

  var newFiscalYear = {
    label : 'A new Fiscal Year 2017',
    start_date : new Date('2017-01-01 01:00'),
    end_date : new Date('2017-12-31 01:00'),
    number_of_months : 12,
    note : 'Fiscal Year for Integration Test'
  };

  var responseKeys = ['id', 'enterprise_id', 'number_of_months', 'label', 'start_date', 'end_date', 'previous_fiscal_year_id', 'locked', 'note'];

  it('POST /fiscal adds a fiscal year', function () {
    return agent.post('/fiscal')
      .send(newFiscalYear)
      .then(function (res) {
        helpers.api.created(res);
        newFiscalYear.id = res.body.id;
        return agent.get('/fiscal/' + newFiscalYear.id);
      })
      .then(function (res){
        expect(res).to.have.status(200);
        expect(res.body).to.have.all.keys(responseKeys);
      })
     .catch(helpers.handler);
  });

  it('GET /fiscal returns a list of fiscal_years', function () {
    return agent.get('/fiscal')
      .then(function (res) {
        helpers.api.listed(res, 3);
      })
      .catch(helpers.handler);
  });

  it('GET /fiscal/:id returns one fiscal year', function () {
    return agent.get('/fiscal/'+ newFiscalYear.id)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body.id).to.be.equal(newFiscalYear.id);
        expect(res.body).to.have.all.keys(responseKeys);
      })
      .catch(helpers.handler);
  });

  it('PUT /fiscal/:id updates the newly added fiscal year', function () {
    var updateData = {
      label : 'A Fiscal Year Test Update',
      note : 'New note in the test'
    };

    return agent.put('/fiscal/'+ newFiscalYear.id)
      .send(updateData)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
      })
      .catch(helpers.handler);
  });

  it('DELETE /fiscal/:id deletes a fiscal year', function () {
    return agent.delete('/fiscal/' + newFiscalYear.id)
      .then(function (res) {
        helpers.api.deleted(res);
        return agent.get('/fiscal/' + newFiscalYear.id);
      })
      .then(function (res) {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });
});
