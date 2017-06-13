/* global expect, chai, agent */
const expect = require('chai').expect;

describe('Account Statement Report', () => {

  it('Returns data given a well formed request', () => {
    return agent.get('/users')
      .then((result) => {
        console.log(result);

      });
  });
});
