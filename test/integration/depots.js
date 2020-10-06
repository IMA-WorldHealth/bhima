/* global expect, agent */

const helpers = require('./helpers');

// The /depots API endpoint
describe('(/depots) The depots API ', () => {
  const principalDepotUuid = 'F9CAEB16168443C5A6C447DBAC1DF296';
  const secondaryDepotUuid = 'D4BB1452E4FA4742A281814140246877';
  // new depot object
  const newDepot = {
    // the reference column is auto increment by a trigger
    text : 'New Depot',
    enterprise_id : 1,
    is_warehouse : 0,
    parent_uuid : 0,
  };

  // second depot object
  const secondDepot = {
    text : 'Second Depot',
    enterprise_id : 1,
    is_warehouse : 0,
    parent_uuid : 0,
  };

  // depot object with missing uuid
  const badDepot = {
    text : 'New Depot',
    enterprise_id : 1,
    is_warehouse : 0,
    parent_uuid : 0,
  };

  // removable depot
  const removableDepot = {
    text : 'Removable Depot',
    enterprise_id : 1,
    is_warehouse : 1,
    parent_uuid : 0,
  };

  // depot with distribution depots
  const newDepotWithDistribution = {
    text : 'Depot With Distribution Restriction',
    enterprise_id : 1,
    is_warehouse : 1,
    parent_uuid : 0,
    allowed_distribution_depots : [principalDepotUuid, secondaryDepotUuid],
  };

  const editDepot = {
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
    parent_uuid : secondaryDepotUuid,
  };

  it('POST /depots create a new depot in the database', () => {
    return agent.post('/depots')
      .send(newDepot)
      .then((res) => {
        helpers.api.created(res);
        newDepot.uuid = res.body.uuid;
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

  it('POST /depots create a new depot with distribution restriction ', () => {
    return agent.post('/depots')
      .send(newDepotWithDistribution)
      .then((res) => {
        helpers.api.created(res);
        return agent.get(`/depots/${res.body.uuid}`);
      })
      .then(res => {
        // with enable_strict_depot_distribution = 0 by default, we cannot assign
        // allowed_distribution_depots, and the correct comparison must be
        // res.body.allowed_distribution_depots = newDepotWithDistribution.allowed_distribution_depots;
        expect(res.body.allowed_distribution_depots).to.have.length(0);
      })
      .catch(helpers.handler);
  });

  it('PUT /depots update an existing depot', () => {
    return agent.put(`/depots/${newDepot.uuid}`)
      .send(editDepot)
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res.body[0].text).to.be.equal(editDepot.text);
        expect(res.body[0].is_warehouse).to.be.equal(editDepot.is_warehouse);

        expect(res.body[0].allow_entry_purchase).to.be.equal(editDepot.allow_entry_purchase);

        expect(res.body[0].allow_entry_integration).to.be.equal(editDepot.allow_entry_integration);

        expect(res.body[0].allow_entry_donation).to.be.equal(editDepot.allow_entry_donation);

        expect(res.body[0].allow_entry_transfer).to.be.equal(editDepot.allow_entry_transfer);

        expect(res.body[0].allow_exit_debtor).to.be.equal(editDepot.allow_exit_debtor);

        expect(res.body[0].allow_exit_service).to.be.equal(editDepot.allow_exit_service);

        expect(res.body[0].allow_exit_transfer).to.be.equal(editDepot.allow_exit_transfer);

        expect(res.body[0].allow_exit_loss).to.be.equal(editDepot.allow_exit_loss);

        expect(res.body[0].parent_uuid).to.be.equal(editDepot.parent_uuid);
      })
      .catch(helpers.handler);
  });

  it('GET /depots should returns the list of depots', () => {
    return agent.get('/depots')
      .then((res) => {
        helpers.api.listed(res, 6);
      })
      .catch(helpers.handler);
  });

  it('POST /depots create a removable depot in the database', () => {
    return agent.post('/depots')
      .send(removableDepot)
      .then((res) => {
        helpers.api.created(res);
        removableDepot.uuid = res.body.uuid;
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
