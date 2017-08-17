/* global expect, agent */

const helpers = require('./helpers');

/*
 * The /trial_balance API endpoint
 */
describe('(/journal/trialbalance) API endpoint', () => {
  const GOOD_TXNS = ['957e4e79-a6bb-4b4d-a8f7-c42152b2c2f6', 'c44619e0-3a88-4754-a750-a414fc9567bf']; // TRANS1, TRANS2
  const EMPTY_TXNS = [];
  const ERROR_TXNS = ['3688e9ce-85ea-4b5c-9144-688177edcb63']; // TRANS5
  const POSTING_TXNS = ['957e4e79-a6bb-4b4d-a8f7-c42152b2c2f6'];

  const formatParams = transactions => ({ transactions });

  it('POST /journal/trialbalance handles empty select with a 400 error', () => {
    return agent.post('/journal/trialbalance')
      .send(formatParams(EMPTY_TXNS))
      .then((res) => {
        helpers.api.errored(res, 400, 'POSTING_JOURNAL.ERRORS.MISSING_TRANSACTIONS');
      })
      .catch(helpers.handler);
  });

  it('POST /journal/trialbalance returns an object with errors and summary information', () => {
    return agent.post('/journal/trialbalance')
      .send(formatParams(ERROR_TXNS))
      .then((res) => {
        expect(res).to.have.status(201);
        expect(res).to.be.json;

        // assert that the returned object has errors and summary properties
        expect(res.body).to.have.keys(['errors', 'summary']);

        // make sure that TRANS5 sends back an incorrect date error
        const err = res.body.errors[0];
        expect(err.code).to.equal('POSTING_JOURNAL.ERRORS.DATE_IN_WRONG_PERIOD');
      })
      .catch(helpers.handler);
  });


  it('POST /journal/trialbalance returns summary information grouped by account', () => {
    return agent.post('/journal/trialbalance')
      .send(formatParams(GOOD_TXNS))
      .then((res) => {
        expect(res).to.have.status(201);
        expect(res).to.be.json;

        // assert that the returned object has errors and summary properties
        expect(res.body).to.have.keys(['errors', 'summary']);

        // the errors property should be empty
        expect(res.body.errors).to.have.length(0);

        // The transactions TRANS1, TRANS2 hit 2 accounts and should have the following profiles
        const summary = res.body.summary;
        expect(summary).to.have.length(2);

        // all accounts have 0 balance before
        expect(summary[0].balance_before).to.equal(25);
        expect(summary[1].balance_before).to.equal(-25);

        expect(summary[0].debit_equiv).to.equal(75);
        expect(summary[1].debit_equiv).to.equal(0);

        expect(summary[0].credit_equiv).to.equal(0);
        expect(summary[1].credit_equiv).to.equal(75)

        expect(summary[0].balance_final).to.equal(100);
        expect(summary[1].balance_final).to.equal(-100);
      })
      .catch(helpers.handler);
  });

  it('POST /journal/transactions posts the a transaction to general_ledger and remove it form the posting_general', () => {
    return agent.post('/journal/transactions')
      .send(formatParams(POSTING_TXNS))
      .then((res) => {
        expect(res).to.have.status(201);
        return agent.get(`/journal/${POSTING_TXNS[0]}`);
      })
      .then((res) => {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });
});
