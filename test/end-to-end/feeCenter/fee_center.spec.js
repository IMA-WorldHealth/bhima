const helpers = require('../shared/helpers');
const FeeCenterPage = require('./fee_center.page');
const chai = require('chai');


/** configuring helpers**/
helpers.configure(chai);

describe('Fee Center Management', () => {
  // navigate to the page
  before(() => helpers.navigate('#!/fee_center'));

  const Page = new FeeCenterPage();

  const feeCenter = {
    label : 'Special Fee Center',
    is_principal : 1,
    has_profit_center : 1,
    reference_profit_id : 'Profit Test 2',
    has_cost_center : 1,
    reference_cost_id : 'Cost Test 3',
  };

  const updateFeeCenter = {
    label : 'Updated Fee Center',
  };

  const updateAuxiliary = {
    label : 'Updated Fee Center',
    is_principal : 0,
    is_update_reference : 1,
    is_profit : 1,
    reference_profit_id : 'Profit Test 3',
  };

  const updateProfitToCost = {
    label : 'Updated Fee Center',
    is_update_reference : 1,
    is_profit : 0,
    reference_cost_id : 'Cost Test 1',
  };

  const ErrorfeeCenterUpdate = {
    label : 'Principale TPA',
    is_principal : 0,
    is_update_reference : 1,
    is_profit : 0,
    reference_cost_id : 'Section Administration',
  };

  const ErrorfeeCenterInsert = {
    label : 'Special Fee Center',
    is_principal : 1,
    has_profit_center : 1,
    reference_profit_id : 'Profit Administration',
    has_cost_center : 1,
    reference_cost_id : 'Cost Test 1',
  };

  it('successfully creates a new Fee Center', () => {
    Page.createFeeCenter(feeCenter);
  });

  it('successfully edits a Fee Center label', () => {
    Page.editFeeCenter(feeCenter.label, updateFeeCenter);
  });

  it('successfully Change of the Principal Fee Center to Auxiliary and the modification of the expense center', () => {
    Page.editFeeCenter(updateAuxiliary.label, updateAuxiliary);
  });

  it('successfully delete a Fee Center', () => {
    Page.deleteFeeCenter(updateProfitToCost.label);
  });

  it('unable to assign to another expense center a reference already used in another expense center when creating', () => {
    Page.errorCreateFeeCenter(ErrorfeeCenterInsert);
  });

  it('unable to assign to another expense center a reference already used in another expense center when updating', () => {
    Page.errorEditFeeCenter(ErrorfeeCenterUpdate.label, ErrorfeeCenterUpdate);
  });

  it('don\'t create when incorrect Fee Center', () => {
    Page.errorOnCreateFeeCenter();
  });
});
