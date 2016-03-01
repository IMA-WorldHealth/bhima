/*global it, element, by, beforeEach, inject, browser */

var chai = require('chai');
var expect = chai.expect;

var FormUtils = require('../shared/FormUtils');
var helpers = require('../shared/helpers');
helpers.configure(chai);

describe('Services Module', function () {

  // shared methods
  var path = '#/services';
  var SERVICE = {
    name : 'Zebra Service',
  };

  var DEFAULT_SERVICE = 4;
  var SERVICE_RANK = helpers.random(DEFAULT_SERVICE);

  var DELETE_SUCCESS = 4;
  var DELETE_ERROR = 3;

  // navigate to the Service module before each test
  beforeEach(function () {
    browser.get(path);
  });

  it('successfully creates a new service', function () {
    FormUtils.buttons.create();

    FormUtils.input('ServicesCtrl.service.name', SERVICE.name);

    // select a random, enterprise
    FormUtils.select('ServicesCtrl.service.enterprise_id')
      .enabled()
      .first()
      .click();

    // select a random, cost center
    FormUtils.select('ServicesCtrl.service.cost_center_id')
      .enabled()
      .first()
      .click();

    // select a random, profit center
    FormUtils.select('ServicesCtrl.service.profit_center_id')
      .enabled()
      .first()
      .click();

    // submit the page to the server
    FormUtils.buttons.submit();

    FormUtils.exists(by.id('create_success'), true);
  });

  it('successfully edits an service', function () {
    element(by.id('service-upd-' + SERVICE_RANK )).click();
    FormUtils.input('ServicesCtrl.service.name', 'Updated');
    element(by.id('change_service')).click();

    FormUtils.exists(by.id('update_success'), true);
  });

  it('correctly blocks invalid form submission with relevent error classes', function () {
    FormUtils.buttons.create();
    // Verify form has not been successfully submitted
    expect(browser.getCurrentUrl()).to.eventually.equal(browser.baseUrl + path);

    element(by.id('submit-service')).click();

    // The following fields should be required
    FormUtils.validation.error('ServicesCtrl.service.name');
    FormUtils.validation.error('ServicesCtrl.service.enterprise_id');

    // The following fields is not required
    FormUtils.validation.ok('ServicesCtrl.service.cost_center_id');
    FormUtils.validation.ok('ServicesCtrl.service.profit_center_id');
  });

  it('successfully delete an service', function () {
    element(by.id('service-del-' + DELETE_SUCCESS )).click();
    browser.switchTo().alert().accept();
    FormUtils.exists(by.id('delete_success'), true);
  });

  it('no way to delete a service', function () {
    element(by.id('service-del-' + DELETE_ERROR )).click();
    browser.switchTo().alert().accept();
    FormUtils.exists(by.id('delete_error'), true);
  });

  it('cancellation of removal process of a service', function () {
    element(by.id('service-del-' + DELETE_ERROR )).click();
    browser.switchTo().alert().dismiss();
    FormUtils.exists(by.id('default'), true);
  });
});
