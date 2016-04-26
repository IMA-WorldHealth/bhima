/* global element, by, browser */
const chai = require('chai');
const expect = chai.expect;

const FormUtils = require('../shared/FormUtils');
const helpers = require('../shared/helpers');
helpers.configure(chai);

describe('Services Module', function () {

  // shared methods
  const path = '#/services';
  before(() => browser.get(path));

  const SERVICE = {
    name : 'A service E2E',
  };

  const DEFAULT_SERVICE = 4;
  const SERVICE_RANK = 4;
  const DELETE_SUCCESS = 1;
  const DELETE_ERROR = 3;

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
    element(by.id('service-upd-' + SERVICE_RANK)).click();
    FormUtils.input('ServicesCtrl.service.name', 'Updated');
    element(by.id('change_service')).click();

    FormUtils.exists(by.id('update_success'), true);
  });

  it('correctly blocks invalid form submission with relevant error classes', function () {
    FormUtils.buttons.create();

    // verify form has not been successfully submitted
    expect(helpers.getCurrentPath()).to.eventually.equal(path);

    element(by.id('submit-service')).click();

    // The following fields should be required
    FormUtils.validation.error('ServicesCtrl.service.name');
    FormUtils.validation.error('ServicesCtrl.service.enterprise_id');

    // The following fields is not required
    FormUtils.validation.ok('ServicesCtrl.service.cost_center_id');
    FormUtils.validation.ok('ServicesCtrl.service.profit_center_id');
  });

  it('successfully delete an service', function () {
<<<<<<< 1e8712e9d81e1c86381b1247b3c2e22f11a86119
    element(by.id('service-del-' + DELETE_SUCCESS)).click();
    browser.switchTo().alert().accept();
=======
    element(by.id('service-del-' + DELETE_SUCCESS )).click();
    element(by.id('confirm_modal')).click();
>>>>>>> replacement for $window.confirm() By Modal service
    FormUtils.exists(by.id('delete_success'), true);
  });

  it('no way to delete a service', function () {
<<<<<<< 1e8712e9d81e1c86381b1247b3c2e22f11a86119
    element(by.id('service-del-' + DELETE_ERROR)).click();
    browser.switchTo().alert().accept();
=======
    element(by.id('service-del-' + DELETE_ERROR )).click();
    element(by.id('confirm_modal')).click();
>>>>>>> replacement for $window.confirm() By Modal service
    FormUtils.exists(by.id('delete_error'), true);
  });

  it('cancellation of removal process of a service', function () {
<<<<<<< 1e8712e9d81e1c86381b1247b3c2e22f11a86119
    element(by.id('service-del-' + DELETE_ERROR)).click();
    browser.switchTo().alert().dismiss();
=======
    element(by.id('service-del-' + DELETE_ERROR )).click();
    element(by.id('dismiss_modal')).click();
>>>>>>> replacement for $window.confirm() By Modal service
    FormUtils.exists(by.id('default'), true);
  });
});
