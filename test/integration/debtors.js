/* global expect, chai, agent */

const helpers = require('./helpers');
const uuid = require('node-uuid');

describe('(/debtors) The /debtors API', function () {
  'use strict';

  const debtorKeys = ['uuid', 'group_uuid', 'text'];
  const debtorUuid = '3be232f9-a4b9-4af6-984c-5d3f87d5c107';
  const emptyDebtorUuid = 'a11e6b7f-fbbb-432e-ac2a-5312a66dccf4';

  let newDebtor = {
    uuid : uuid.v4(),
    group_uuid : '4de0fe47-177f-4d30-b95f-cff8166400b4',
    text : 'Debtor for Test'
  };


 it('GET /debtors/:uuid/invoices returns a list of all invoices of a given debtor', function () {
    return agent.get(`/debtors/${debtorUuid}/invoices`)
      .then(function (res) {
        helpers.api.listed(res, 2);
      })
      .catch(helpers.handler);
  });

  it('GET /debtors/:uuid/invoices?balanced=0 returns a list of unbalanced invoices of a given debtor', function () {
    return agent.get(`/debtors/${debtorUuid}/invoices?balanced=0`)
      .then(function (res) {
        helpers.api.listed(res, 1);
      })
      .catch(helpers.handler);
  });

  it('GET /debtors/:uuid/invoices?balanced=1 returns a list of balanced invoices of a given debtor', function () {
    return agent.get(`/debtors/${debtorUuid}/invoices?balanced=1`)
      .then(function (res) {
        helpers.api.listed(res, 1);
      })
      .catch(helpers.handler);
  });

  it('GET /debtors/:uuid/invoice should return an empty list if the debtor does not have any invoices', function () {
    return agent.get(`/debtors/${emptyDebtorUuid}/invoices`)
      .then(function (res) {
        helpers.api.listed(res, 0);
      })
      .catch(helpers.handler);
  });

  it('GET /debtors should return a list of all debtors', function () {
    return agent.get('/debtors')
      .then(function (res) {
        helpers.api.listed(res, 3);
      })
      .catch(helpers.handler);
  });

  // FIXME - incredibly hard coded!!
  it('GET /debtors/:uuid should return detail of a specifying debtor', function () {
    return agent.get(`/debtors/${debtorUuid}`)
      .then(function (res) {
        expect(res.body).to.contain.all.keys(debtorKeys);
        expect(res.body.uuid).to.be.equal(debtorUuid);
        expect(res.body.group_uuid).to.be.equal('66f03607-bfbc-4b23-aa92-9321ca0ff586');
        expect(res.body.text).to.be.equal('Patient/2/Patient');
      })
      .catch(helpers.handler);
  });

});
