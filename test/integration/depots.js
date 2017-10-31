/* global expect, chai, agent */

const helpers = require('./helpers');
const uuid = require('uuid/v4');

// The /depots API endpoint
describe('(/depots) The depots API ', () => {
  // new depot object
  var newDepot = {
    uuid : uuid(),
    // the reference column is auto increment by a trigger
    text : 'New Depot',
    enterprise_id : 1,
    is_warehouse : 0,
  };

  // second depot object
  var secondDepot = {
    text : 'Second Depot',
    enterprise_id : 1,
    is_warehouse : 0,
  };

  // depot object with missing uuid
  var badDepot = {
    text : 'New Depot',
    enterprise_id : 1,
    is_warehouse : 0,
  };

  // update depot
  var editDepot = {
    uuid : uuid(),
    text : 'Edited Depot',
    is_warehouse : 1,
    allow_entry_purchase : 1,
    allow_entry_integration : 1,
    allow_entry_donation : 1,
    allow_entry_transfer : 1,
    allow_exit_debtor : 1,
    allow_exit_service : 1,
    allow_exit_transfer : 1,
    allow_exit_loss : 1,
  };

  // removable depot
  var removableDepot = {
    uuid : uuid(),
    text : 'Removable Depot',
    enterprise_id : 1,
    is_warehouse : 1,
  };

  it('POST /depots create a new depot in the database', () => {
    return agent.post('/depots')
    .send(newDepot)
    .then((res) => {
      helpers.api.created(res);
      expect(res.body.uuid).to.equal(newDepot.uuid);
    })
    .catch(helpers.handler);
  });

  it('POST /depots create a second depot (without sending uuid)', () => {
    return agent.post('/depots')
    .send(secondDepot)
    .then((res) => {
      helpers.api.created(res);
    })
    .catch(helpers.handler);
  });

  it('POST /depots should not create when missing data', () => {
    delete badDepot.text;
    return agent.post('/depots')
    .send(badDepot)
    .then((res) => {
      helpers.api.errored(res, 400);
      expect(res.body.code).to.be.equal('ERRORS.ER_NO_DEFAULT_FOR_FIELD');
    })
    .catch(helpers.handler);
  });

  it('PUT /depots update an existing depot', () => {
    return agent.put(`/depots/${newDepot.uuid}`)
    .send(editDepot)
    .then((res) => {
      expect(res).to.have.status(200);
      expect(res.body[0].text).to.exist;
      expect(res.body[0].text).to.be.equal(editDepot.text);
      expect(res.body[0].is_warehouse).to.exist;
      expect(res.body[0].is_warehouse).to.be.equal(editDepot.is_warehouse);

      expect(res.body[0].allow_entry_purchase).to.exist;
      expect(res.body[0].allow_entry_purchase).to.be.equal(editDepot.allow_entry_purchase);

      expect(res.body[0].allow_entry_integration).to.exist;
      expect(res.body[0].allow_entry_integration).to.be.equal(editDepot.allow_entry_integration);

      expect(res.body[0].allow_entry_donation).to.exist;
      expect(res.body[0].allow_entry_donation).to.be.equal(editDepot.allow_entry_donation);

      expect(res.body[0].allow_entry_transfer).to.exist;
      expect(res.body[0].allow_entry_transfer).to.be.equal(editDepot.allow_entry_transfer);

      expect(res.body[0].allow_exit_debtor).to.exist;
      expect(res.body[0].allow_exit_debtor).to.be.equal(editDepot.allow_exit_debtor);

      expect(res.body[0].allow_exit_service).to.exist;
      expect(res.body[0].allow_exit_service).to.be.equal(editDepot.allow_exit_service);

      expect(res.body[0].allow_exit_transfer).to.exist;
      expect(res.body[0].allow_exit_transfer).to.be.equal(editDepot.allow_exit_transfer);

      expect(res.body[0].allow_exit_loss).to.exist;
      expect(res.body[0].allow_exit_loss).to.be.equal(editDepot.allow_exit_loss);
    })
    .catch(helpers.handler);
  });

  it('GET /depots should returns the list of depots', () => {
    return agent.get('/depots')
    .then((res) => {
      helpers.api.listed(res, 4);
    })
    .catch(helpers.handler);
  });

  it('POST /depots create a removable depot in the database', () => {
    return agent.post('/depots')
    .send(removableDepot)
    .then((res) => {
      helpers.api.created(res);
    })
    .catch(helpers.handler);
  });

  it('DELETE /depots should delete an existing depot', () => {
    return agent.delete(`/depots/${removableDepot.uuid}`)
    .then((res) => {
      helpers.api.deleted(res);
    })
    .catch(helpers.handler);
  });
});
