/* global element, by, inject, browser */
const chai    = require('chai');
const expect  = chai.expect;

const FU = require('../shared/FormUtils');
const components = require('../shared/components');
const helpers = require('../shared/helpers');
helpers.configure(chai);

describe('Donor Management', function () {
  before(() => browser.get('#/donors'));

  const donor = {
    name : 'IMA WorldHealth (E2E)'
  };

  const updateDonor = {
    name : 'IMA (updated)'
  };

  it('successfully creates a new donor', function () {
    FU.buttons.create();
    FU.input('DonorCtrl.donor.name', donor.name);
    FU.buttons.submit();
    FU.exists(by.id('create_success'), true);
  });

  it('successfully edits a donor', function () {
    element(by.name('edit-' + donor.name)).click();
    FU.input('DonorCtrl.donor.name', updateDonor.name);
    FU.buttons.submit();
    FU.exists(by.id('update_success'), true);
  });

  it('successfully delete a donor', function () {
    element(by.name('delete-' + updateDonor.name)).click();
    FU.buttons.submit();
    FU.exists(by.id('delete_success'), true);
  });

  it('don\'t create when incorrect donor name', function () {
    FU.buttons.create();
    FU.input('DonorCtrl.donor.name', '');
    FU.buttons.submit();
    FU.exists(by.id('create_success'), false);
  });
});
