const helpers = require('../shared/helpers');

const JournalConfigurationTests = require('./ConfigurationModal.test');
const TrialBalanceTests = require('./TrialBalance.test');
const JournalSearchTests = require('./SearchModal.test');

describe('Posting Journal', () => {
  const path = '#!/journal';
  before(() => helpers.navigate(path));

  describe('Configuration Modal Tests', JournalConfigurationTests);

  describe('Search Tests', JournalSearchTests);

  describe('Trial Balance Tests', TrialBalanceTests);
});
