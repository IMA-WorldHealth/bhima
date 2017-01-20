/* global browser, element, by */

/** loading chai and helpers **/
const chai = require('chai');
const helpers = require('../shared/helpers');

/** loading pages **/
const FeeCenterPage = require('./feeCenter.page.js');
const FeecenterCreateUpdatePage = require('./feeCenterCU.page.js');

/** configuring helpers**/
helpers.configure(chai);

const expect = chai.expect;

describe('Fee Center Management Page', function () {
  'use strict';

  const path = '#/fee_center';
  const feeCenterPage = new FeeCenterPage();
  const feeCenterCreateUpdatePage = new FeecenterCreateUpdatePage();

  const mockFeeCenterCreate = {
    label : 'Fee Center Test',
    project : 'Test Project C',
    isCost : 1,
    isPrincipal :1,
    note : 'end to end test mock for fee center'
  };

  const mockFeeCenterEdit = {
    label : 'Fee Center test edit',
    project : 'Test Project B',
    note : 'end to end test mock for fee center'
  };
  const feeCenterCount = 7;

  before(function () {
    return helpers.navigate(path);
  });

  it('validates form on creation', function () {
    feeCenterPage.createFeeCenter();
    feeCenterCreateUpdatePage.submitFeeCenter();
    expect(feeCenterCreateUpdatePage.isFeeCenterLabelInvalid()).to.eventually.equal(true);
    expect(feeCenterCreateUpdatePage.isProjectInvalid()).to.eventually.equal(true);
    expect(feeCenterCreateUpdatePage.isCostRadioInvalid()).to.eventually.equal(true);
    expect(feeCenterCreateUpdatePage.isProfitRadioInvalid()).to.eventually.equal(true);

    feeCenterCreateUpdatePage.close();
  });

  it('displays all fee center loaded from the database', function () {
    expect(feeCenterPage.getFeeCenterCount()).to.eventually.equal(feeCenterCount);
  });

  it('creates a fee center successfully', function () {
    feeCenterPage.createFeeCenter();
    feeCenterCreateUpdatePage.setFeeCenterLabel(mockFeeCenterCreate.label);
    feeCenterCreateUpdatePage.setProjectValue(mockFeeCenterCreate.project, false);
    feeCenterCreateUpdatePage.chooseCostCenter();
    feeCenterCreateUpdatePage.checkPrincipal();
    feeCenterCreateUpdatePage.setFeeCenterNote(mockFeeCenterCreate.note);
    feeCenterCreateUpdatePage.submitFeeCenter();
    expect(feeCenterPage.getFeeCenterCount()).to.eventually.equal(feeCenterCount + 1);
  });

  it('edits a fee center successfully', function () {
    feeCenterPage.editFeeCenter(4);
    feeCenterCreateUpdatePage.setFeeCenterLabel(mockFeeCenterEdit.label);
    feeCenterCreateUpdatePage.setProjectValue(mockFeeCenterEdit.project);
    feeCenterCreateUpdatePage.chooseCostCenter();
    feeCenterCreateUpdatePage.checkPrincipal();
    feeCenterCreateUpdatePage.setFeeCenterNote(mockFeeCenterEdit.note);

    feeCenterCreateUpdatePage.submitFeeCenter();
    expect(feeCenterCreateUpdatePage.isDisplayed()).to.eventually.equal(false); //if every thing is good, the modal should disappear
  });

  it('refuses to update a fee center when no changes have been made', function () {
    feeCenterPage.editFeeCenter(3);
    feeCenterCreateUpdatePage.submitFeeCenter();
    expect(feeCenterCreateUpdatePage.isSameFeeCenter()).to.eventually.equal(true);
    feeCenterCreateUpdatePage.close();
  });
});
