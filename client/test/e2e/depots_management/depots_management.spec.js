/* jshint expr: true */
/* element, by, inject, browser */

var chai    = require('chai');
var expect  = chai.expect;
var helpers = require('../shared/helpers');

helpers.configure(chai);

var FormUtils = require('../shared/FormUtils');
var components = require('../shared/components');

describe('Depots management tests suit :: ', function () {

  var PATH = '#/depots_management';

  var depot = {
    text : 'E2E_new_depot',
    is_warehouse : 0
  };

  var updateDepot = {
    text : 'E2E_updated_depot',
    is_warehouse : 1
  };

  /** navigate to the depots management module */
  beforeEach(function () {
    browser.get(PATH);
  });

  it('successfully creates a new depot', function () {
    FormUtils.buttons.create();
    FormUtils.input('DepotCtrl.depot.text', depot.text);
    FormUtils.buttons.submit();
    FormUtils.exists(by.id('create_success'), true);
  });

  it('successfully edits a depot', function () {
    element(by.name('depot-' + depot.text )).click();
    FormUtils.input('DepotCtrl.depot.text', updateDepot.text);
    element(by.model('DepotCtrl.depot.is_warehouse')).click();
    FormUtils.buttons.submit();
    FormUtils.exists(by.id('update_success'), true);
  });

  it('Dont create when incorrect depot name', function () {
    FormUtils.buttons.create();
    FormUtils.input('DepotCtrl.depot.text', '');
    FormUtils.buttons.submit();
    FormUtils.exists(by.id('create_success'), false);
  });

  it('successfully delete a depot', function () {
    element(by.name('delete-' + updateDepot.text )).click();
    FormUtils.buttons.submit();
    FormUtils.exists(by.id('delete_success'), true);
  });

});
