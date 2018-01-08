/* global expect, agent */

const helpers = require('./helpers');

describe('(/fiscal) Fiscal Year', () => {
  const newFiscalYear = {
    label : 'A New Fiscal Year 2019',
    start_date : new Date('2019-01-01 01:00'),
    end_date : new Date('2019-12-31 01:00'),
    number_of_months : 12,
    note : 'Fiscal Year for Integration Test',
    closing_account: 3627, // what is this account?
  };

  const responseKeys = [
    'id', 'enterprise_id', 'number_of_months', 'label', 'start_date',
    'end_date', 'previous_fiscal_year_id', 'locked', 'note',
  ];

  it('POST /fiscal adds a fiscal year', () => {
    return agent.post('/fiscal')
      .send(newFiscalYear)
      .then(res => {
        helpers.api.created(res);
        newFiscalYear.id = res.body.id;
        return agent.get(`/fiscal/${newFiscalYear.id}`);
      })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.all.keys(responseKeys);
      })
      .catch(helpers.handler);
  });

  it('POST /fiscal throws errors with invalid data', () => {
    return agent.post('/fiscal')
      .send({ label : 'Broken Year', end_date : new Date() })
      .then(res => {
        helpers.api.errored(res, 400);
      })
      .catch(helpers.handler);
  });

  it('GET /fiscal returns a list of fiscal_years', () => {
    return agent.get('/fiscal')
      .then(res => {
        helpers.api.listed(res, 5);
      })
      .catch(helpers.handler);
  });

  it('GET /fiscal/:id returns one fiscal year', () => {
    return agent.get(`/fiscal/${newFiscalYear.id}`)
      .then(res => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body.id).to.be.equal(newFiscalYear.id);
        expect(res.body).to.have.all.keys(responseKeys);
      })
      .catch(helpers.handler);
  });

  it('PUT /fiscal/:id updates the newly added fiscal year', () => {
    const updateData = {
      label : 'A Fiscal Year Test Update',
      note : 'New note in the test',
    };

    return agent.put(`/fiscal/${newFiscalYear.id}`)
      .send(updateData)
      .then(res => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
      })
      .catch(helpers.handler);
  });

  it('PUT /fiscal/:id/closing closing a fiscal year', () => {
    const closingAccount = { account_id : newFiscalYear.closing_account };

    return agent.put(`/fiscal/${newFiscalYear.id}/closing`)
      .send({ params: closingAccount })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        const value = parseInt(res.body.id, 10);
        expect(value).to.be.equal(newFiscalYear.id);
      })
      .catch(helpers.handler);
  });

  it('DELETE /fiscal/:id deletes a fiscal year', () => {
    return agent.delete(`/fiscal/${newFiscalYear.id}`)
      .then(res => {
        helpers.api.deleted(res);
        return agent.get(`/fiscal/${newFiscalYear.id}`);
      })
      .then(res => {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });
});
