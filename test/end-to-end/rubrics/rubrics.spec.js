const helpers = require('../shared/helpers');
const RubricPage = require('./rubrics.page');
const chai = require('chai');


/** configuring helpers**/
helpers.configure(chai);

describe('Rubrics Management', () => {
  // navigate to the page
  before(() => helpers.navigate('#!/payroll/rubrics'));

  const Page = new RubricPage();

  const rubric = {
    label : 'Rubric Syndical',
    abbr  : 'CoSynd',
    is_employee : 1,
    is_percent : 1,
    third_party_account_id : '40111002',
    costs_account_id : '60310015',
    is_discount : 1,
    is_tax : 1,
    value : 6.5
  };

  const updateRubric = {
    label : 'Chef Comptable',
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