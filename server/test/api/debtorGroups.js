/* jshint expr: true */
var chai = require('chai');
var expect = chai.expect;

var helpers = require('./helpers');
var uuid    = require('node-uuid');
helpers.configure(chai);

describe('(/debtor_groups) The debtor groups HTTP API', function () {
  var agent = chai.request.agent(helpers.baseUrl);

  var debtorGroup = {
    enterprise_id : 1,
    uuid : uuid.v4(),
    name : 'New Debtor Group (Test)',
    account_id : 3638,
    location_id : '03a329b2-03fe-4f73-b40f-56a2870cc7e6',
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

  var updateGroup = {
    enterprise_id : 1,
    name : 'Updated Debtor Group (Test)',
    account_id : 3638,
    location_id : '03b44338-a38b-4450-b12d-3acc4f3d3465',
    phone : '0818061031',
    email : 'update@info.com',
    note : 'Updated debtor group de test',
    locked : 1,
    max_credit : 1000,
    is_convention : 1,
    price_list_uuid : '2e39c855-6f2b-48d7-af7f-746f0552f7b7',
    apply_discounts : 1,
    apply_billing_services : 1,
    apply_subsidies : 1
  };

  var lockedGroup = {
    enterprise_id : 1,
    uuid : uuid.v4(),
    name : 'Locked Debtor Group (Test)',
    account_id : 3638,
    location_id : '03a329b2-03fe-4f73-b40f-56a2870cc7e6',
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

  var conventionGroup = {
    enterprise_id : 1,
    uuid : uuid.v4(),
    name : 'Convention Debtor Group (Test)',
    account_id : 3638,
    location_id : '03a329b2-03fe-4f73-b40f-56a2870cc7e6',
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

  var lockedConventionGroup = {
    enterprise_id : 1,
    uuid : uuid.v4(),
    name : 'Locked Convention Debtor Group (Test)',
    account_id : 3638,
    location_id : '03a329b2-03fe-4f73-b40f-56a2870cc7e6',
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

  var invalidGroup = {
    enterprise_id : 1,
    name : 'Invalid Debtor Group (Test)',
    location_id : '03a329b2-03fe-4f73-b40f-56a2870cc7e6',
    phone : '0811838662',
    email : 'debtorgroup@info.com',
    note : 'Nouveau debtor group de test'
  };

  var allDebtorGroups;

  // Logs in before each test
  before(helpers.login(agent));

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
    return agent.post('/debtor_groups/')
    .send(invalidGroup)
    .then(function (res) {
      helpers.api.errored(res, 400);
    })
    .catch(helpers.handler);
  });

  it('GET /debtor_groups returns a list of debtor groups', function () {
    return agent.get('/debtor_groups')
      .then(function (res) {
        helpers.api.listed(res, 6);
        allDebtorGroups = res.body;
      })
      .catch(helpers.handler);
  });

  it('GET /debtor_groups/:uuid returns all details for a valid debtor group', function () {
    return agent.get('/debtor_groups/' + debtorGroup.uuid)
      .then(function (res) {
        var expectedKeySubset = ['uuid', 'account_id', 'name', 'location_id', 'is_convention'];
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
    var totalLockedGroup = getTotal(allDebtorGroups, 'locked', 1);
    var totalUnlockedGroup = getTotal(allDebtorGroups, 'locked', 0);

    return agent.get('/debtor_groups?locked=1')
      .then(function (res) {
        helpers.api.listed(res, totalLockedGroup);
        expect(res.body[0].locked).to.exist;
        expect(res.body[0].locked).to.be.equal(1);
        return agent.get('/debtor_groups/?locked=0');
      })
      .then(function (res) {
        helpers.api.listed(res, totalUnlockedGroup);
        expect(res.body[0].locked).to.exist;
        expect(res.body[0].locked).to.be.equal(0);
      })
      .catch(helpers.handler);
  });

  it('GET /debtor_groups?is_convention={1|0} returns only conventions or not conventions debtor groups', function () {
    var totalConvention = getTotal(allDebtorGroups, 'is_convention', 1);
    var totalNotConvention = getTotal(allDebtorGroups, 'is_convention', 0);

    return agent.get('/debtor_groups?is_convention=1')
      .then(function (res) {
        helpers.api.listed(res, totalConvention);
        expect(res.body[0].is_convention).to.exist;
        expect(res.body[0].is_convention).to.be.equal(1);
        return agent.get('/debtor_groups/?is_convention=0');
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
      expect(res).to.have.status(200);
      expect(res.body).to.be.an('object');
      expect(res.body).to.have.deep.equal(updateGroup);
    })
    .catch(helpers.handler);
  });

  it('GET /debtor_groups/:uuid/invoices returns all invoices for a debtor group', function () {
    return agent.get('/debtor_groups/' + debtorGroup.uuid + '/invoices')
      .then(function (res) {
        expect(res).to.have.status(200);
      })
      .catch(helpers.handler);
  });

  it('GET /debtor_groups/:uuid/invoices returns a NOT FOUND (404) for an unknow {uuid}', function () {
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

  /**
  * @function getTotal
  *
  * @desc Get number of element in {array} by criteria and value
  *
  * @param {array} array The array of objects
  * @param {string} criteria A property of item in {array}
  * @param {mixed} value A value of the property
  *
  */
  function getTotal(array, criteria, value) {
    return array.filter(function (item) {
      return item[criteria] == value;
    }).length;
  }
});
