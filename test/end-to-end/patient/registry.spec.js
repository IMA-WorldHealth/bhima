const helpers = require('../shared/helpers');
const PatientRegistrySearch = require('./registry.search');
const PatientMerge = require('./registry.merge');

// patient registry tests
describe('Patient Registry', () => {
  before(() => helpers.navigate('#/patients'));

  // groups patient search modal queries
  describe('Search', PatientRegistrySearch);

  // merge patients
  describe('Merge patients', PatientMerge);
});
