/* global expect, chai, agent */
/* jshint expr : true */

'use strict';

const helpers = require('./helpers');

describe('(/transaction_type) Transaction Type API :: ', () => {

  // default number of transaction type (TT)
  const TT_DEFAULT = 10;

  let newTT = {
    text: 'My New Transaction Type',
    description: 'Description for the new transaction type',
    type: 'income',
    prefix: 'NEW_TT',
    fixed: 0
  };

  let updateTT = {
    text: 'My Updated Transaction Type',
    description: 'Description for the updated transaction type',
    type: 'expense',
    prefix: 'UPDATED_TT'
  };

  it('GET /transaction_type returns all transaction type', () => {
    return agent.get('/transaction_type')
      .then(res => {
        helpers.api.listed(res, TT_DEFAULT);
      })
      .catch(helpers.handler);
  });

  it('POST /transaction_type create a particular transaction type', () => {
    return agent.post('/transaction_type')
      .send(newTT)
      .then(res => {
        newTT.id = res.body.id;
        helpers.api.created(res);
      })
      .catch(helpers.handler);
  });

  it('GET /transaction_type/:id returns a particular transaction type', () => {
    return agent.get('/transaction_type/' + newTT.id)
      .then(res => {
        expect(helpers.identical(res.body, newTT)).to.be.true;
      })
      .catch(helpers.handler);
  });

  it('PUT /transaction_type/:id updates a particular transaction type', () => {
    return agent.put('/transaction_type/' + newTT.id)
      .send(updateTT)
      .then(res => {
        let changedKeys = Object.keys(updateTT);
        helpers.api.updated(res, updateTT, changedKeys);
      })
      .catch(helpers.handler);
  });

  it('DELETE /transaction_type/:id delete a particular transaction type', () => {
    return agent.delete('/transaction_type/' + newTT.id)
      .then(res => {
        helpers.api.deleted(res);
      })
      .catch(helpers.handler);
  });

});
