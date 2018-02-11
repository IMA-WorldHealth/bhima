const helpers = require('../shared/helpers');
const RubricConfigPage = require('./rubrics_config.page');
const chai = require('chai');


/** configuring helpers**/
helpers.configure(chai);

describe('Rubrics Configuration Management', () => {
  // navigate to the page
  before(() => helpers.navigate('#!/payroll/rubric_configuration'));

  const Page = new RubricConfigPage();

  const rubricConfig = {
    label : 'Configuration 2013',
  };

  const updateRubricConfig = {
    label : 'Configuration 2013 Updated',
  };

  it('successfully creates a new Rubric Configuration', () => {
    Page.createRubricConfig(rubricConfig);
  });

  it('successfully edits a Rubric Configuration', () => {
    Page.editRubricConfig(rubricConfig.label, updateRubricConfig);
  });

  it('successfully Set Rubrics in Rubric Configuration', () => {
    Page.setRubricConfig(updateRubricConfig.label);
  });

  it('successfully InSet Rubrics in Rubric Configuration', () => {
    Page.inSetRubricConfig(updateRubricConfig.label);
  });

  it('don\'t create when incorrect Rubric', () => {
    Page.errorOnCreateRubricConfig();
  });

  it('successfully delete a Rubric', () => {
    Page.deleteRubricConfig(updateRubricConfig.label);
  });

});