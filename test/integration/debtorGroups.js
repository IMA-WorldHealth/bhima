/* global expect, chai, agent */
/* jshint expr : true */
'use strict';

const helpers = require('./helpers');
const uuid = require('node-uuid');

describe('(/debtor_groups) The debtor groups API', function () {

  const numDebtorGroups = 7;

  let debtorGroup = {
    enterprise_id : 1,
    uuid : uuid.v4(),
    name : 'New Debtor Group (Test)',
    account_id : 3638,
    location_id : '1f162a10-9f67-4788-9eff-c1fea42fcc9b',
    phone : '0811838662',
    email : 'debtorgroup@info.com',
    note : 'Nouveau debtor group de test',
    locked : 0,
    max_credit : null,
    is_convention : 0,
    price_list_uuid : null,
    apply_discounts : 0,
    apply_billing_services : 0,
    apply_subsidies : 0
  };

  let updateGroup = {
    enterprise_id : 1,
    name : 'Updated Debtor Group (Test)',
    account_id : 3638,
    location_id : '1f162a10-9f67-4788-9eff-c1fea42fcc9b',
    phone : '0818061031',
    email : 'update@info.com',
    note : 'Updated debtor group de test',
    locked : 1,
    max_credit : 1000,
    is_convention : 1,
    price_list_uuid : helpers.data.PRICE_LIST,
    apply_discounts : 1,
    apply_billing_services : 1,
    apply_subsidies : 1
  };

  let lockedGroup = {
    enterprise_id : 1,
    uuid : uuid.v4(),
    name : 'Locked Debtor Group (Test)',
    account_id : 3638,
    location_id : '1f162a10-9f67-4788-9eff-c1fea42fcc9b',
    phone : '0811838662',
    email : 'debtorgroup@info.com',
    note : 'Nouveau debtor group de test',
    locked : 1,
    max_credit : null,
    is_convention : 0,
    price_list_uuid : null,
    apply_discounts : 0,
    apply_billing_services : 0,
    apply_subsidies : 0
  };

  let conventionGroup = {
    enterprise_id : 1,
    uuid : uuid.v4(),
    name : 'Convention Debtor Group (Test)',
    account_id : 3638,
    location_id : '1f162a10-9f67-4788-9eff-c1fea42fcc9b',
    phone : '0811838662',
    email : 'debtorgroup@info.com',
    note : 'Nouveau debtor group de test',
    locked : 0,
    max_credit : null,
    is_convention : 1,
    price_list_uuid : null,
    apply_discounts : 0,
    apply_billing_services : 0,
    apply_subsidies : 0
  };

  let lockedConventionGroup = {
    enterprise_id : 1,
    uuid : uuid.v4(),
    name : 'Locked Convention Debtor Group (Test)',
    account_id : 3638,
    location_id : '1f162a10-9f67-4788-9eff-c1fea42fcc9b',
    phone : '0811838662',
    email : 'debtorgroup@info.com',
    note : 'Nouveau debtor group de test',
    locked : 1,
    max_credit : null,
    is_convention : 1,
    price_list_uuid : null,
    apply_discounts : 0,
    apply_billing_services : 0,
    apply_subsidies : 0
  };

  let invalidGroup = {
    enterprise_id : 1,
    name : 'Invalid Debtor Group (Test)',
    location_id : '1f162a10-9f67-4788-9eff-c1fea42fcc9b',
    phone : '0811838662',
    email : 'debtorgroup@info.com',
    note : 'Nouveau debtor group de test'
  };

  let allDebtorGroups;

  it('POST /debtor_groups/ create a new debtor group (unlocked)', function () {
    return agent.post('/debtor_groups/')
    .send(debtorGroup)
    .then(function (res) {
      helpers.api.created(res);
      expect(res.body.uuid).to.be.equal(debtorGroup.uuid);
    })
    .catch(helpers.handler);
  });

  it('POST /debtor_groups/ create a new debtor group (locked)', function () {
    return agent.post('/debtor_groups/')
    .send(lockedGroup)
    .then(function (res) {
      helpers.api.created(res);
      expect(res.body.uuid).to.be.equal(lockedGroup.uuid);
    })
    .catch(helpers.handler);
  });

  it('POST /debtor_groups/ create a new debtor group (convention)', function () {
    return agent.post('/debtor_groups/')
    .send(conventionGroup)
    .then(function (res) {
      helpers.api.created(res);
      expect(res.body.uuid).to.be.equal(conventionGroup.uuid);
    })
    .catch(helpers.handler);
  });

  it('POST /debtor_groups/ create a new debtor group (locked convention)', function () {
    return agent.post('/debtor_groups/')
    .send(lockedConventionGroup)
    .then(function (res) {
      helpers.api.created(res);
      expect(res.body.uuid).to.be.equal(lockedConventionGroup.uuid);
    })
    .catch(helpers.handler);
  });

  it('POST /debtor_groups don\'t create when with missing data', function () {
    return agent.post('/debtor_groups')
    .send(invalidGroup)
    .then(function (res) {
      helpers.api.errored(res, 400);
    })
    .catch(helpers.handler);
  });

  it('GET /debtor_groups returns a list of debtor groups', function () {
    return agent.get('/debtor_groups')
      .then(function (res) {
        helpers.api.listed(res, numDebtorGroups);
        allDebtorGroups = res.body;
      })
      .catch(helpers.handler);
  });

  it('GET /debtor_groups?detailed=1 returns a more complex (detailed) list', function () {
    return agent.get('/debtor_groups')
      .query({ detailed : 1 })
      .then(function (res) {

        // expects status + type JSON
        helpers.api.listed(res, numDebtorGroups);

        let sampleDebtorGroup = res.body[1];
        let expectedDebtors = 3;

        // verify complex query attributes returned
        expect(sampleDebtorGroup).to.contain.all.keys('total_debtors');

        // according to the test SQL data this debtor group should have 3 debtors assigned
        /* @todo verify that the order of data sent back from the server is managed/ known */
        // expect(sampleDebtorGroup.total_debtors).to.equal(expectedDebtors);
      })
      .catch(helpers.handler);
  });

  it('GET /debtor_groups/:uuid returns all details for a valid debtor group', function () {
    return agent.get('/debtor_groups/' + debtorGroup.uuid)
      .then(function (res) {
        let expectedKeySubset = ['uuid', 'account_id', 'name', 'location_id', 'is_convention'];
        expect(res).to.have.status(200);
        expect(res.body).to.contain.all.keys(expectedKeySubset);
      })
      .catch(helpers.handler);
  });

  it('GET /debtor_groups/:id returns NOT FOUND (404) for invalid id', function () {
    return agent.get('/debtor_groups/invalid')
      .then(function (res) {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('GET /debtor_groups?locked={1|0} returns only locked or not locked debtor groups', function () {
    let totalLockedGroup = getTotal(allDebtorGroups, 'locked', 1);
    let totalUnlockedGroup = getTotal(allDebtorGroups, 'locked', 0);

    return agent.get('/debtor_groups').query({ locked: 1 })
      .then(function (res) {
        helpers.api.listed(res, totalLockedGroup);
        expect(res.body[0].locked).to.exist;
        expect(res.body[0].locked).to.be.equal(1);
        return agent.get('/debtor_groups/?locked=0').query({ locked: 1 });
      })
      .then(function (res) {
        helpers.api.listed(res, totalUnlockedGroup);
        expect(res.body[0].locked).to.exist;
        expect(res.body[0].locked).to.be.equal(0);
      })
      .catch(helpers.handler);
  });

  it('GET /debtor_groups?is_convention={1|0} returns only conventions or not conventions debtor groups', function () {
    let totalConvention = getTotal(allDebtorGroups, 'is_convention', 1);
    let totalNotConvention = getTotal(allDebtorGroups, 'is_convention', 0);

    return agent.get('/debtor_groups').query({ is_convention : 1 })
      .then(function (res) {
        helpers.api.listed(res, totalConvention);
        expect(res.body[0].is_convention).to.exist;
        expect(res.body[0].is_convention).to.be.equal(1);
        return agent.get('/debtor_groups').query({ is_convention : 0 });
      })
      .then(function (res) {
        helpers.api.listed(res, totalNotConvention);
        expect(res.body[0].is_convention).to.exist;
        expect(res.body[0].is_convention).to.be.equal(0);
      })
      .catch(helpers.handler);
  });

  it('GET /debtor_groups/?locked={1|0}&is_convention={1|0} returns either locked or convention debtor groups', function () {
    return agent.get('/debtor_groups/?locked=1&is_convention=1')
      .then(function (res) {
        helpers.api.listed(res, 1);
        expect(res.body[0].locked).to.exist;
        expect(res.body[0].locked).to.be.equal(1);
        expect(res.body[0].is_convention).to.exist;
        expect(res.body[0].is_convention).to.be.equal(1);
        return agent.get('/debtor_groups/?locked=1&is_convention=0');
      })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.not.be.empty;
        expect(res.body[0].locked).to.exist;
        expect(res.body[0].locked).to.be.equal(1);
        expect(res.body[0].is_convention).to.exist;
        expect(res.body[0].is_convention).to.be.equal(0);
        return agent.get('/debtor_groups/?locked=0&is_convention=1');
      })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.not.be.empty;
        expect(res.body[0].locked).to.exist;
        expect(res.body[0].locked).to.be.equal(0);
        expect(res.body[0].is_convention).to.exist;
        expect(res.body[0].is_convention).to.be.equal(1);
        return agent.get('/debtor_groups/?locked=0&is_convention=0');
      })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.not.be.empty;
        expect(res.body[0].locked).to.exist;
        expect(res.body[0].locked).to.be.equal(0);
        expect(res.body[0].is_convention).to.exist;
        expect(res.body[0].is_convention).to.be.equal(0);
      })
      .catch(helpers.handler);
  });

  it('PUT /debtor_groups/:uuid update a debtor group', function () {
    return agent.put('/debtor_groups/' + debtorGroup.uuid)
    .send(updateGroup)
    .then(function (res) {
      updateGroup.uuid = debtorGroup.uuid;

      // data provided by the server; always blank for new debtor groups
      updateGroup.billingServices = [];
      updateGroup.subsidies = [];

      expect(res).to.have.status(200);
      expect(res.body).to.be.an('object');
      expect(res.body).to.have.deep.equal(updateGroup);
    })
    .catch(helpers.handler);
  });

  it('DELETE /debtor_groups/:uuid should delete an existing debtor group', function () {
    return agent.delete('/debtor_groups/' + lockedConventionGroup.uuid)
      .then(function (res) {
        helpers.api.deleted(res);
        return agent.get('/debtor_groups/' + lockedConventionGroup.uuid);
      })
      .then(function (res) {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });


  /**
   * @todo: Need to be implemented at the server side in
   * /server/controllers/debtors/groups/index.js  #function invoices
   */
  describe.skip(':: /debtor_groups/:uuid/invoices :: ', function () {

    it('GET /debtor_groups/:uuid/invoices returns all invoices for a debtor group', function () {
      return agent.get('/debtor_groups/' + debtorGroup.uuid + '/invoices')
        .then(function (res) {
          expect(res).to.have.status(200);
        })
        .catch(helpers.handler);
    });

    it('GET /debtor_groups/:uuid/invoices returns a 404 for an unknown uuid', function () {
      return agent.get('/debtor_groups/unknown/invoices')
        .then(function (res) {
          helpers.api.errored(res, 404);
        })
        .catch(helpers.handler);
    });

    it('GET /debtor_groups/:uuid/invoices returns only balanced invoices for a debtor group', function () {
      return agent.get('/debtor_groups/' + debtorGroup.uuid + '/invoices?balanced=1')
        .then(function (res) {
          helpers.api.listed(res, 0);
        })
        .catch(helpers.handler);
    });

  });

  /**
   * @function getTotal
   *
   * @desc Get number of element in {array} by criteria and value
   *
   * @param {array} array The array of objects
   * @param {string} criteria A property of item in {array}
   * @param {mixed} value A value of the property
   */
  function getTotal(array, criteria, value) {
    return array.filter(function (item) {
      return item[criteria] == value;
    }).length;
  }
});
