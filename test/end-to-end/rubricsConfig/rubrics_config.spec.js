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

  it('successfully creates a new rubric configuration', () => {
    page.create(rubricConfig);
  });

  it('successfully edits a rubric configuration', () => {
    page.update(rubricConfig.label, updateRubricConfig);
  });

  it('successfully set rubrics in rubric configuration', () => {
    page.setRubricConfig(updateRubricConfig.label);
  });

  it('successfully unset rubrics in rubric configuration', () => {
    page.unsetRubricConfig(updateRubricConfig.label);
  });

  it('don\'t create when incorrect rubric', () => {
    page.errorOnCreateRubricConfig();
  });

  it('successfully delete a rubric', () => {
    page.remove(updateRubricConfig.label);
  });

  it('should have 1 rubric to end with', () => {
    expect(page.count()).to.eventually.equal(1);
  });
});
