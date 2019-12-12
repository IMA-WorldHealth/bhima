const helpers = require('../shared/helpers');
const RubricPage = require('./rubrics.page');

describe('Rubrics Management', () => {
  before(() => helpers.navigate('#!/payroll/rubrics'));

  const page = new RubricPage();

  const rubric = {
    label : 'RUBRIC SYNDICAL',
    abbr  : 'CoSynd',
    is_percent : 1,
    debtor_account_id : '40111002', // SUPPLIER'S ACCOUNT 1
    expense_account_id : '60310015', // Achat Produit  de Perfusion
    value : 6.5,
    is_discount : 1,
    is_membership_fee : 0,
    is_tax : 1,
    is_employee : 1,
  };

  const updateRubric = {
    label : 'CHEF COMPTABLE',
    is_percent : 0,
  };

  it('successfully creates a new rubric', async () => {
    await page.create(rubric);
  });

  it('successfully edits a rubric', async () => {
    await page.update(rubric.label, updateRubric);
  });

  it('don\'t create when incorrect rubric', async () => {
    await page.errorOnCreateRubric();
  });

  it('successfully deletes a rubric', async () => {
    await page.remove(updateRubric.label);
  });

  it('successfully import indexes rubrics', async () => {
    await page.importIndexesRubric();
  });
});
