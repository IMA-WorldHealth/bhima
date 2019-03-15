/* global expect, agent */
const helpers = require('./helpers');

describe('(/break_even_reference) Break Even Reference', () => {
  const numBreakEvenReference = 1;

  const newBreakEvenReference = {
    id : 1,
    label : 'Break Even Reference 1',
    is_cost : 1,
    is_variable : 0,
    account_reference_id : 5,
  };

  const updateBreakEvenReference = {
    label : 'Break Even Reference 2',
    is_cost : 0,
    is_turnover : 1,
    account_reference_id : 8,
  };

  it('POST /break_even_reference add Break Even Reference', () => {
    return agent.post('/break_even_reference')
      .send(newBreakEvenReference)
      .then((res) => {
        helpers.api.created(res);
        newBreakEvenReference.id = res.body.id;
      })
      .catch(helpers.handler);
  });

  it('GET /break_even_reference returns all Break Even Reference', () => {
    return agent.get(`/break_even_reference/`)
      .then((res) => {
        helpers.api.listed(res, numBreakEvenReference);
        expect(res.body[0]).to.have.all.keys(
          'id', 'label', 'abbr', 'is_cost', 'is_turnover',
          'is_variable', 'account_reference_id'
        );
      })
      .catch(helpers.handler);
  });

  it('GET /break_even_reference/:id returns one Break Even Reference as detail', () => {
    return agent.get(`/break_even_reference/${newBreakEvenReference.id}`)
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res).to.be.a('object');
        expect(res.body).to.have.all.keys(
          'id', 'label', 'is_turnover', 'is_cost',
          'is_variable', 'account_reference_id'
        );
      })
      .catch(helpers.handler);
  });

  it('PUT /break_even_reference/:id updates the newly added Break Even Reference', () => {
    return agent.put(`/break_even_reference/${newBreakEvenReference.id}`)
      .send(updateBreakEvenReference)
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res).to.be.a('object');
        expect(res.body.id).to.equal(newBreakEvenReference.id);
      })
      .catch(helpers.handler);
  });

  it('DELETE /break_even_reference/:id deletes a Break Even Reference', () => {
    return agent.delete(`/break_even_reference/${newBreakEvenReference.id}`)
      .then((res) => {
        helpers.api.deleted(res);
        return agent.get(`/break_even_reference/${newBreakEvenReference.id}`);
      })
      .then((res) => {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });
});
