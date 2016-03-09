/* jshint expr:true */
/* global element, by, beforeEach, inject, browser */

var chai = require('chai');
var expect = chai.expect;

var FU = require('../shared/FormUtils');
var helpers = require('../shared/helpers');
var components = require('../shared/components');

helpers.configure(chai);

describe('Subsidies Module', function () {
  'use strict';

  var path = '#/subsidies';

  var subsidy = {
      label : 'IMA SUBSIDY',
      description : 'InterChrurch Medical Assistance',
      value : 12.5
  };

  var defaultSubsidy = 0;
  var subsidyRank = 1;


  // navigate to the Subsidy module before each test
  beforeEach(function () {
    browser.get(path);
  });

  it('successfully creates a new Subsidy', function () {

    // swtich to the create form
    FU.buttons.create();
    FU.input('SubsidyCtrl.subsidy.label', subsidy.label);
    FU.input('SubsidyCtrl.subsidy.value', subsidy.value);

    // select an Account
    FU.select('SubsidyCtrl.subsidy.account_id')
      .enabled()
      .first()
      .click(); 

    FU.input('SubsidyCtrl.subsidy.description', subsidy.description);
  
    // submit the page to the server
    FU.buttons.submit();

    // expect a nice validation message
    FU.exists(by.id('create_success'), true);
  });


  it('successfully edits an subsidy', function () {

    element(by.id('subsidy-upd-' + subsidyRank )).click();
    // modify the subsidy label
    FU.input('SubsidyCtrl.subsidy.label', 'Updated');
    // modify the subsidy description
    FU.input('SubsidyCtrl.subsidy.description', ' IMCK Tshikaji');

    element(by.id('change_subsidy')).click();

    // make sure the success message appears
    FU.exists(by.id('update_success'), true);
  });

  it('correctly blocks invalid form submission with relevant error classes', function () {
    // switch to the create form
    element(by.id('create')).click();

    // Verify form has not been successfully submitted
    expect(browser.getCurrentUrl()).to.eventually.equal(browser.baseUrl + path);

    element(by.id('submit-subsidy')).click();

    // the following fields should be required
    FU.validation.error('SubsidyCtrl.subsidy.label');
    FU.validation.error('SubsidyCtrl.subsidy.value');
    FU.validation.error('SubsidyCtrl.subsidy.account_id');
    // the following fields are not required
    FU.validation.ok('SubsidyCtrl.subsidy.description');
  });

  it('successfully delete a Subsidy', function () {
    element(by.id('subsidy-del-' + subsidyRank )).click();

    // click the alert asking for permission
    browser.switchTo().alert().accept();

    // make sure that the delete message appears
    FU.exists(by.id('delete_success'), true);
  });

});
