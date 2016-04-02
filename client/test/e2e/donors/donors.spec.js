/* jshint expr: true */
/* element, by, inject, browser */

var chai    = require('chai');
var expect  = chai.expect;
var helpers = require('../shared/helpers');

helpers.configure(chai);

var FormUtils = require('../shared/FormUtils');
var components = require('../shared/components');

describe.only('Donor management tests suit :: ', function () {

  var PATH = '#/donors';

  var donor = {
    name : 'IMA WorldHealth (E2E)'
  };

  var updateDonor = {
    name : 'IMA (updated)'
  };

  /** navigate to the donors management module */
  beforeEach(function () {
    browser.get(PATH);
  });

  it('successfully creates a new donor', function () {
    FormUtils.buttons.create();
    FormUtils.input('DonorCtrl.donor.name', donor.name);
    FormUtils.buttons.submit();
    FormUtils.exists(by.id('create_success'), true);
  });

  it('successfully edits a donor', function () {
    element(by.name('edit-' + donor.name )).click();
    FormUtils.input('DonorCtrl.donor.name', '');
    element(by.model('DonorCtrl.donor.name')).sendKeys(updateDonor.name);
    FormUtils.buttons.submit();
    FormUtils.exists(by.id('update_success'), true);
  });

  it('successfully delete a donor', function () {
    element(by.name('delete-' + updateDonor.name )).click();
    FormUtils.buttons.submit();
    FormUtils.exists(by.id('delete_success'), true);
  });

  it('Dont create when incorrect donor name', function () {
    FormUtils.buttons.create();
    FormUtils.input('DonorCtrl.donor.name', '');
    FormUtils.buttons.submit();
    FormUtils.exists(by.id('create_success'), false);
  });

});
