const { expect } = require('chai');
const helpers = require('../shared/helpers');
const ConfigurationAnalysisTools = require('./configurationAnalysisTools.page');

describe('Configuration Analysis Tools', () => {
  before(() => helpers.navigate('#!/configuration_analysis_tools'));

  const page = new ConfigurationAnalysisTools();

  const newConfiguration = {
    label : 'Subvention d\'exploitation',
    account_reference_id : 'Profits',
    analysis_tool_type_id : 'Profits',
  };

  const updateConfiguration = {
    label : 'Update Subvention Error',
    account_reference_id : 'Créditeurs',
    analysis_tool_type_id : 'Dettes (Fournisseurs, Personnels et comptes rattachés)',
  };

  it('successfully creates a new Configuration Analysis', async () => {
    await page.create(newConfiguration);
  });

  it('successfully edits a Configuration Analysis', async () => {
    await page.update(newConfiguration.label, updateConfiguration);
  });

  it('errors when missing Configuration Analysis create when incorrect Configuration', async () => {
    await page.errorOnCreateConfigurationAnalysis();
  });

  it('begins with 5 Configuration Analysis', async () => {
    expect(await page.count()).to.equal(5);
  });

  it('successfully delete Configuration Analysis', async () => {
    await page.remove(updateConfiguration.label);
  });
});
