/* jshint expr: true */
/* describe, it, element, by, beforeEach, inject, browser */

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var uuid = require('node-uuid');

chai.use(chaiAsPromised);
var expect = chai.expect;

var FormUtils = require('../shared/FormUtils');
var components = require('../shared/components');

describe.only('Depots management tests suit :: ', function () {

  var PATH = '#/depots_management';

  var depot = {
    text : 'E2E_new_depot',
    is_warehouse : 0
  };

  var updateDepot = {
    text : ' => E2E_updated_depot',
    is_warehouse : 1
  };

  /** navigate to the depots management module */
  beforeEach(function () {
    browser.get(PATH);
  });

  it('successfully creates a new depot', function () {
    FormUtils.buttons.create();
    FormUtils.input('DepotCtrl.depot.text', depot.text);
    FormUtils.input('DepotCtrl.depot.is_warehouse', depot.is_warehouse);
    FormUtils.buttons.submit();
    expect(element(by.id('create_success')).isPresent()).to.eventually.be.true;
  });

  it('successfully edits a depot', function () {
    element(by.name('depot-' + depot.text )).click();
    element(by.model('DepotCtrl.depot.text')).sendKeys(updateDepot.text);
    element(by.model('DepotCtrl.depot.is_warehouse')).click();
    FormUtils.buttons.submit();
    expect(element(by.id('update_success')).isPresent()).to.eventually.be.true;
  });

});
