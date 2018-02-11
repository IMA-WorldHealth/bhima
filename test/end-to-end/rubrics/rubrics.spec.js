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
    is_percent : 1,
    debtor_account_id : '40111002', //SUPPLIER'S ACCOUNT 1
    expense_account_id : '60310015', // Achat Produit  de Perfusion
    value : 6.5,
    is_discount : 1,
    is_membership_fee : 0,
    is_tax : 1,
    is_employee : 1,
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