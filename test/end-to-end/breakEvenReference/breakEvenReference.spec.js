const { expect } = require('chai');
const helpers = require('../shared/helpers');
const BreakEvenReference = require('./breakEvenReference.page');

describe('Break Even Reference', () => {
  before(() => helpers.navigate('#!/break_even_reference'));

  const page = new BreakEvenReference();

  const newBreakEvenReference = {
    label : 'New Break Even Reference',
    account_reference_id : 'Cost Test 2',
    is_cost : '1',
    is_variable : '1',
  };

  const updateAccountReferenceType = {
    label : 'Update Break Even Reference',
    account_reference_id : 'Profit Test 2',
    is_revenue : '1',
    is_turnover : '1',
  };

  it('successfully creates a new Break Even Reference', async () => {
    await page.create(newBreakEvenReference);
  });

  it('successfully edits a Break Even Reference', async () => {
    await page.update(newBreakEvenReference.label, updateAccountReferenceType);
  });

  it('errors when missing Break Even Reference create when incorrect Break Even Reference', async () => {
    await page.errorOnCreateBreakEvenReference();
  });

  it('begins with 1 Break Even Reference', async () => {
    expect(await page.count()).to.equal(1);
  });

  it('successfully delete Break Even Reference', async () => {
    await page.remove(updateAccountReferenceType.label);
  });
});
