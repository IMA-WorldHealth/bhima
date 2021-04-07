const { expect } = require('chai');
const helpers = require('../shared/helpers');
const RubricConfigPage = require('./rubrics_config.page');

describe('Rubrics Configuration Management', () => {
  before(() => helpers.navigate('#!/payroll/rubric_configuration'));

  const page = new RubricConfigPage();

  const rubricConfig = {
    label : 'Configuration 2013',
  };

  const updateRubricConfig = {
    label : 'Configuration 2013 Updated',
  };

  it('successfully creates a new rubric configuration', async () => {
    await page.create(rubricConfig);
  });

  it('successfully edits a rubric configuration', async () => {
    await page.update(rubricConfig.label, updateRubricConfig);
  });

  it('successfully set rubrics in rubric configuration', async () => {
    await page.setRubricConfig(updateRubricConfig.label);
  });

  it('successfully unset rubrics in rubric configuration', async () => {
    await page.unsetRubricConfig(updateRubricConfig.label);
  });

  it('don\'t create when incorrect rubric', async () => {
    await page.errorOnCreateRubricConfig();
  });

  it('successfully delete a rubric', async () => {
    await page.remove(updateRubricConfig.label);
  });

  it('should have 2 rubrics to end with', async () => {
    expect(await page.count()).to.equal(2);
  });
});
