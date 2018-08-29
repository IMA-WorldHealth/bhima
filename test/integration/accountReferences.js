/* global expect, agent */
const helpers = require('./helpers');

describe('(/accounts/references) Accounts References', () => {
  const numAccountReference = 10;

  const newAccountReference = {
    abbr : 'TX',
    description : 'Test Accounts Reference',
    is_amo_dep : 0,
    accounts : [160, 185], // 311 Marchandises and 571 Caisses Hopital
    accountsException : [163, 188], // 31110011 Medicaments sirop and 57110011 caisse auxiliaire CDF
  };

  const updateAccountReference = {
    abbr : 'TX',
    description : 'Updated Test Accounts Reference',
    is_amo_dep : 1,
    accounts : [160], // 311 Marchandises
    accountsException : [163], // 31110011 Medicaments sirop
  };

  it('POST /accounts/references adds a reference for a set of accounts', () => {
    return agent.post('/accounts/references')
      .send(newAccountReference)
      .then((res) => {
        helpers.api.created(res);
        newAccountReference.id = res.body.id;
      })
      .catch(helpers.handler);
  });

  it('GET /accounts/references/:id returns one accounts reference as detail', () => {
    return agent.get(`/accounts/references/${newAccountReference.id}`)
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res).to.be.a('object');
        expect(res.body).to.have.all.keys('id', 'abbr', 'description', 'parent', 'is_amo_dep', 'accounts', 'accountsException');
      })
      .catch(helpers.handler);
  });

  it('PUT /accounts/references/:id updates the newly added account reference', () => {
    return agent.put(`/accounts/references/${newAccountReference.id}`)
      .send(updateAccountReference)
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res).to.be.a('object');
        expect(res.body.id).to.equal(newAccountReference.id);
      })
      .catch(helpers.handler);
  });

  it('GET /accounts/references returns all accounts references', () => {
    return agent.get(`/accounts/references/`)
      .then((res) => {
        helpers.api.listed(res, numAccountReference);
        console.log('res : ', res.body);
        expect(res.body[0]).to.have.all.keys('id', 'abbr', 'description', 'parent', 'is_amo_dep', 'accounts', 'parent_abbr');
      })
      .catch(helpers.handler);
  });

  it('DELETE /accounts/references/:id deletes an accounts reference', () => {
    return agent.delete(`/accounts/references/${newAccountReference.id}`)
      .then((res) => {
        helpers.api.deleted(res);
        return agent.get(`/accounts/references/${newAccountReference.id}`);
      })
      .then((res) => {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });
});
