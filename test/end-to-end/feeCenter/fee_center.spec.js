const helpers = require('../shared/helpers');
const FeeCenterPage = require('./fee_center.page');

describe('Fee Center Management', () => {
  // navigate to the page
  before(() => helpers.navigate('#!/fee_center'));

  const Page = new FeeCenterPage();

  const feeCenter = {
    label : 'Special Fee Center',
    is_principal : 1,
    has_profit_center : 1,
    reference_profit_id : 'Cost Test 2',
    has_cost_center : 1,
    reference_cost_id : 'Profit Test 4',
    has_service : 1,
    services : ['Administration', 'Test Service'],
    assigned_project : 1,
    project_id : 'Test Project C',
  };

  const updateFeeCenter = {
    label : 'Updated Fee Center',
  };

  const updateAuxiliary = {
    label : 'Updated Fee Center',
    is_principal : 0,
    is_update_reference : 1,
    is_profit : 1,
    reference_profit_id : 'Profit Test 4',
  };

  const updateProfitToCost = {
    label : 'Updated Fee Center',
    is_update_reference : 1,
    is_profit : 0,
    reference_cost_id : 'Cost Test 2',
  };

  const ErrorfeeCenterUpdate = {
    label : 'Principale TPA',
    is_principal : 0,
    is_update_reference : 1,
    is_profit : 0,
    reference_cost_id : 'Cost Test 3',
  };

  const ErrorfeeCenterInsert = {
    label : 'Special Fee Center',
    is_principal : 1,
    has_profit_center : 1,
    reference_profit_id : 'Profit Administration',
    has_cost_center : 1,
    reference_cost_id : 'Cost Test 1',
  };

  it('creates a new Fee Center', async () => {
    await Page.createFeeCenter(feeCenter);
  });

  it('edits a Fee Center label', async () => {
    await Page.editFeeCenter(feeCenter.label, updateFeeCenter);
  });

  it('change of the Principal Fee Center to Auxiliary and the modification of the expense center', async () => {
    await Page.editFeeCenter(updateAuxiliary.label, updateAuxiliary);
  });

  it('deletes a Fee Center', async () => {
    await Page.deleteFeeCenter(updateProfitToCost.label);
  });

  it('unable to assign an expense center a reference already used during creation', async () => {
    await Page.errorCreateFeeCenter(ErrorfeeCenterInsert);
  });

  it('unable to assign an expense center a reference already used during update', async () => {
    await Page.errorEditFeeCenter(ErrorfeeCenterUpdate.label, ErrorfeeCenterUpdate);
  });

  it('does not create a Fee Center with incorrect information', async () => {
    await Page.errorOnCreateFeeCenter();
  });
});
