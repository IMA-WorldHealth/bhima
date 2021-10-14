const helpers = require('../shared/helpers');
const CostCenterPage = require('./fee_center.page');

describe('Cost Center Management', () => {
  // navigate to the page
  before(() => helpers.navigate('#!/cost_center'));

  const Page = new CostCenterPage();

  const costCenter = {
    label : 'Special Cost Center',
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

  const updateCostCenter = {
    label : 'Updated Cost Center',
  };

  const updateAuxiliary = {
    label : 'Updated Cost Center',
    is_principal : 0,
    is_update_reference : 1,
    is_profit : 1,
    reference_profit_id : 'Profit Test 4',
  };

  const updateProfitToCost = {
    label : 'Updated Cost Center',
    is_update_reference : 1,
    is_profit : 0,
    reference_cost_id : 'Cost Test 2',
  };

  const ErrorcostCenterUpdate = {
    label : 'Principale TPA',
    is_principal : 0,
    is_update_reference : 1,
    is_profit : 0,
    reference_cost_id : 'Cost Test 3',
  };

  const ErrorcostCenterInsert = {
    label : 'Special Cost Center',
    is_principal : 1,
    has_profit_center : 1,
    reference_profit_id : 'Profit Administration',
    has_cost_center : 1,
    reference_cost_id : 'Cost Test 1',
  };

  it('creates a new Cost Center', async () => {
    await Page.createCostCenter(costCenter);
  });

  it('edits a Cost Center label', async () => {
    await Page.editCostCenter(costCenter.label, updateCostCenter);
  });

  it('change of the Principal Cost Center to Auxiliary and the modification of the expense center', async () => {
    await Page.editCostCenter(updateAuxiliary.label, updateAuxiliary);
  });

  it('deletes a Cost Center', async () => {
    await Page.deleteCostCenter(updateProfitToCost.label);
  });

  it('unable to assign an expense center a reference already used during creation', async () => {
    await Page.errorCreateCostCenter(ErrorcostCenterInsert);
  });

  it('unable to assign an expense center a reference already used during update', async () => {
    await Page.errorEditCostCenter(ErrorcostCenterUpdate.label, ErrorcostCenterUpdate);
  });

  it('does not create a Cost Center with incorrect information', async () => {
    await Page.errorOnCreateCostCenter();
  });
});
