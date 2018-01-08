/* global expect, agent */

const helpers = require('./helpers');

// cheeky method to duplicate an array
function clone(array) {
  return array.slice();
}

describe('(/accounts) Accounts', () => {
  const newAccount = {
    type_id : 1,
    enterprise_id : 1,
    number : 4000400,
    label : 'Account for integration test',
    parent : 0,
    locked : 0,
    cc_id : null,
    pc_id : null,
    classe : 4,
    is_asset : 0,
    reference_id : null,
    is_brut_link : 0,
    is_charge : 0,
    is_title : 0,
  };

  const FETCHABLE_ACCOUNT_ID = 117;
  const CHURCH_ACCOUNT_ID = 174;

  const NUM_ACCOUNTS = 230;

  const responseKeys = [
    'id', 'enterprise_id', 'locked', 'cc_id', 'pc_id', 'created', 'classe', 'is_asset',
    'reference_id', 'is_brut_link', 'is_charge', 'number',
    'label', 'parent', 'type_id', 'is_title', 'type', 'translation_key',
    'cost_center_text', 'profit_center_text',
  ];

  it('GET /accounts?detailed=1 returns the full list of account', () => {
    return agent.get('/accounts?detailed=1')
      .then(res => {
        helpers.api.listed(res, NUM_ACCOUNTS);
      })
      .catch(helpers.handler);
  });

  it('GET /accounts returns a simple list of account', () => {
    return agent.get('/accounts')
      .then(res => {
        helpers.api.listed(res, NUM_ACCOUNTS);
      })
      .catch(helpers.handler);
  });

  it('GET /accounts?locked=0 returns a list of unlocked accounts', () => {
    return agent.get('/accounts?locked=0')
      .then(res => {
        const list = res.body.filter(item => item.locked === 0);
        expect(res).to.have.status(200);
        expect(res.body).to.not.be.empty;
        expect(res.body).to.deep.have.same.members(list);
      })
      .catch(helpers.handler);
  });


  it('GET /accounts returns the accounts in sorted order by number', () => {
    return agent.get('/accounts')
      .then(res => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;

        // clone the accounts for comparison
        const accounts = res.body;
        const sorted = clone(accounts);

        sorted.sort((a, b) => Number(a.number) - Number(b.number));

        expect(accounts).to.deep.equal(sorted);
      })
      .catch(helpers.handler);
  });

  it('GET /accounts/:id returns one account', () => {
    return agent.get(`/accounts/${FETCHABLE_ACCOUNT_ID}`)
      .then(res => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.not.be.empty;
        expect(res.body).to.have.all.keys(responseKeys);
        expect(res.body.id).to.be.equal(FETCHABLE_ACCOUNT_ID);
      })
      .catch(helpers.handler);
  });

  it('GET /accounts/:id returns a 404 error for unknown id', () => {
    return agent.get('/accounts/unknown')
      .then(res => {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('GET /accounts/:id/balance returns an object with zero as balance, debit and credit', () => {
    return agent.get(`/accounts/${FETCHABLE_ACCOUNT_ID}/balance`)
      .then(function (res){
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.not.be.empty;
        expect(res.body).to.have.all.keys('account_id', 'debit', 'credit', 'balance');
        expect(res.body.debit).to.equal(0);
        expect(res.body.credit).to.equal(0);
        expect(res.body.balance).to.equal(0);
      })
      .catch(helpers.handler);
  });

  it('GET /accounts/:id/balance?journal=1 returns the balance of a provided account_id, scans the journal also', () => {
    return agent.get('/accounts/:id/balance?journal=1'.replace(':id', CHURCH_ACCOUNT_ID))
      .then(res => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.not.be.empty;
        expect(res.body).to.have.all.keys('account_id', 'debit', 'credit', 'balance');

        // FIXME(@jniles) - why is this out of balance?!
        expect(res.body.debit).to.equal(105.13);
        expect(res.body.credit).to.equal(125);
        expect(res.body.balance).to.equal(75);
      })
      .catch(helpers.handler);
  });

  it('POST /accounts a adds an account', () => {
    return agent.post('/accounts')
      .send(newAccount)
      .then(res => {
        helpers.api.created(res);
        newAccount.id = res.body.id;
        return agent.get(`/accounts/${newAccount.id}`);
      })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.all.keys(responseKeys);
      })
      .catch(helpers.handler);
  });

  it('PUT /accounts/:id updates the newly added account', () => {
    const updateInfo = { label : 'updated value for testing account' };
    return agent.put(`/accounts/${newAccount.id}`)
      .send(updateInfo)
      .then(res => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body.id).to.equal(newAccount.id);
        expect(res.body.label).to.equal(updateInfo.label);
        expect(res.body).to.have.all.keys(responseKeys);
      })
      .catch(helpers.handler);
  });

  it('PUT /accounts/:id returns a 404 for unknown account id', () => {
    const updateInfo = { label : 'updated value for testing account unknown ' };
    return agent.put('/accounts/undefined')
      .send(updateInfo)
      .then(res => {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('DELETE /accounts/:id Deletes the newly added account', () => {
    return agent.delete(`/accounts/${newAccount.id}`)
      .then(res => {
        helpers.api.deleted(res);
      })
      .catch(helpers.handler);
  });

  it('DELETE /accounts/:id prevents the deletion of accounts with children', () => {
    return agent.delete(`/accounts/${FETCHABLE_ACCOUNT_ID}`)
      .then(res => {
        expect(res).to.have.status(400);
      })
      .catch(helpers.handler);
  });
});
