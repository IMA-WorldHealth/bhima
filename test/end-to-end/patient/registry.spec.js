const { test } = require('@playwright/test');

const PatientRegistrySearch = require('./registry.search');
const PatientMerge = require('./registry.merge');

// patient registry tests
test.describe('Patient Registry', () => {

  // groups patient search modal queries
  test.describe('Search', PatientRegistrySearch);

  // merge patients
  test.describe('Merge patients', PatientMerge);
});
