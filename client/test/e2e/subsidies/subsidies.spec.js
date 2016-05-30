/* global element, by, browser */
const chai = require('chai');
const expect = chai.expect;
const helpers = require('../shared/helpers');
helpers.configure(chai);

const FU = require('../shared/FormUtils');
const components = require('../shared/components');

describe('Subsidies', function () {
  'use strict';

  const path = '#/subsidies';
  before(() => helpers.navigate(path));

  const subsidy = {
    label : 'IMA SUBSIDY',
    description : 'InterChrurch Medical Assistance',
    value : 12.5
  };

  const defaultSubsidy = 0;
  const subsidyRank = 2;

  it('creates a new subsidy', function () {

    // switch to the create form
    FU.buttons.create();
    FU.input('SubsidyCtrl.subsidy.label', subsidy.label);
    FU.input('SubsidyCtrl.subsidy.value', subsidy.value);
    FU.select('SubsidyCtrl.subsidy.account_id', 'Test Debtor Account');
    FU.input('SubsidyCtrl.subsidy.description', subsidy.description);

    // submit the page to the server
    FU.buttons.submit();

    // expect a nice validation message
    FU.exists(by.id('create_success'), true);
  });


  it('edits an subsidy', function () {
    element(by.id('subsidy-upd-' + subsidyRank)).click();
    // modify the subsidy label
    FU.input('SubsidyCtrl.subsidy.label', 'Updated');
    // modify the subsidy description
    FU.input('SubsidyCtrl.subsidy.description', ' IMCK Tshikaji');

    element(by.id('change_subsidy')).click();

    // make sure the success message appears
    FU.exists(by.id('update_success'), true);
  });

  it('blocks invalid form submission with relevant error classes', function () {
    // switch to the create form
    element(by.id('create')).click();

    // verify form has not been submitted
    expect(helpers.getCurrentPath()).to.eventually.equal(path);

    element(by.id('submit-subsidy')).click();

    // the following fields should be required
    FU.validation.error('SubsidyCtrl.subsidy.label');
    FU.validation.error('SubsidyCtrl.subsidy.value');
    FU.validation.error('SubsidyCtrl.subsidy.account_id');
    // the following fields are not required
    FU.validation.ok('SubsidyCtrl.subsidy.description');
  });

  it('deletes a subsidy', function () {
    element(by.id('subsidy-del-' + subsidyRank)).click();

    // click the alert asking for permission
    components.modalAction.confirm();

    // make sure that the delete message appears
    FU.exists(by.id('delete_success'), true);
  });
});
