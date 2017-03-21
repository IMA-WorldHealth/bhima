const helpers = require('../shared/helpers');

const PatientRegistrySearch = require('./registry.search');
// const PatientRegistryActions = require('./registry.actions');
// const PatientRegistryPrint = require('./registry.print');

// patient registry tests
describe.only('Patient Registry', function () {
  'use strict';

  before(() => helpers.navigate('#/patients'));

  // groups patient search modal queries
  describe('Search', PatientRegistrySearch);

  // groups the actions associated with the patient registry.
  // describe('Actions', PatientRegistryActions);

  // groups patient registry printing assertions
  //describe('Print', PatientRegistryPrint);
});
