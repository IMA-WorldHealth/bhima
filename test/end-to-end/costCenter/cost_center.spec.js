const { chromium } = require('@playwright/test');
const { test } = require('@playwright/test');
const TU = require('../shared/TestUtils');

const CostCenterPage = require('./cost_center.page');

test.beforeAll(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  TU.registerPage(page);
  await TU.login();
});

test.describe('Cost Center Management', () => {

  test.beforeEach(async () => {
    await TU.navigate('#!/cost_center');
  });

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
    allocation_basis : 'Direct Cost',
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

  test.skip('creates a new Cost Center', async () => {
    // @TODO : THis is broken (see the page definition)
    await Page.createCostCenter(costCenter);
  });

  test.skip('edits a Cost Center label', async () => {
    // @TODO: Get creation working first
    await Page.editCostCenter(costCenter.label, updateCostCenter);
  });

  test.skip('change of the Principal Cost Center to Auxiliary and the modification of the expense center', async () => {
    // @TODO: needs fixing
    await Page.editCostCenter(updateAuxiliary.label, updateAuxiliary);
  });

  test.skip('deletes a Cost Center', async () => {
    // @TODO: needs fixing
    await Page.deleteCostCenter(updateProfitToCost.label);
  });

  test.skip('unable to assign an expense center a reference already used during creation', async () => {
    // @TODO: needs fixing
    await Page.errorCreateCostCenter(ErrorcostCenterInsert);
  });

  test.skip('unable to assign an expense center a reference already used during update', async () => {
    // @TODO: needs fixing
    await Page.errorEditCostCenter(ErrorcostCenterUpdate.label, ErrorcostCenterUpdate);
  });

  test.skip('does not create a Cost Center with incorrect information', async () => {
    // @TODO: needs fixing
    await Page.errorOnCreateCostCenter();
  });
});
