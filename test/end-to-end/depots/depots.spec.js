/* global element, by, inject, browser */
const chai   = require('chai');
const expect = chai.expect;

const FU = require('../shared/FormUtils');
const helpers = require('../shared/helpers');
helpers.configure(chai);

describe.skip('Depots Management', function () {

  // navigate to the page
  before(() => helpers.navigate('#/depots'));

  const depot = {
    text : 'E2E_new_depot',
    is_warehouse : 0
  };

  const updateDepot = {
    text : 'E2E_updated_depot',
    is_warehouse : 1
  };

  it('successfully creates a new depot', function () {
    FU.buttons.create();
    FU.input('DepotCtrl.depot.text', depot.text);
    FU.buttons.submit();
    FU.exists(by.id('create_success'), true);
  });

  it('successfully edits a depot', function () {
    element(by.name('depot-' + depot.text)).click();
    FU.input('DepotCtrl.depot.text', updateDepot.text);
    element(by.model('DepotCtrl.depot.is_warehouse')).click();
    FU.buttons.submit();
    FU.exists(by.id('update_success'), true);
  });

  it('don\'t create when incorrect depot name', function () {
    FU.buttons.create();
    FU.input('DepotCtrl.depot.text', '');
    FU.buttons.submit();
    FU.exists(by.id('create_success'), false);
  });

  it('successfully delete a depot', function () {
    element(by.name('delete-' + updateDepot.text)).click();
    FU.buttons.submit();
    FU.exists(by.id('delete_success'), true);
  });
});
