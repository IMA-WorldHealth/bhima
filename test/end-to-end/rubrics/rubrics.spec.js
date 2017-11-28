const helpers = require('../shared/helpers');
const RubricPage = require('./rubrics.page');
const chai = require('chai');


/** configuring helpers**/
helpers.configure(chai);

describe('Rubrics Management', () => {
  // navigate to the page
  before(() => helpers.navigate('#!/rubrics'));

  const Page = new RubricPage();

  const rubric = {
    label : 'Rubric Syndical',
    abbr  : 'RuSynd',
    is_discount : 1,
    is_social_care : 1,
    is_percent : 1,
    value : 6.5
  };

  const updateRubric = {
    label : 'Rubric Update',
    is_percent : 0
  };

  it('successfully creates a new Rubric', () => {
    Page.createRubric(rubric);
  });

  it('successfully edits a Rubric', () => {
    Page.editRubric(rubric.label, updateRubric);
  });

  it('don\'t create when incorrect Rubric', () => {
    Page.errorOnCreateRubric();
  });

  it('successfully delete a Rubric', () => {
    Page.deleteRubric(updateRubric.label);
  });

});