/* global element, by, browser */
const chai = require('chai');

const FU = require('../shared/FormUtils');
const helpers = require('../shared/helpers');
const components = require('../shared/components');

const expect = chai.expect;
helpers.configure(chai);

describe('Services', () => {
  const path = '#!/services';
  before(() => helpers.navigate(path));

  const SERVICE = {
    name : 'A service E2E',
  };

  const SERVICE_RANK = 4;
  const DELETE_SUCCESS = 1;
  const DELETE_ERROR = 3;

  it('successfully creates a new service', () => {
    FU.buttons.create();

    FU.input('ServicesCtrl.service.name', SERVICE.name);

    // submit the page to the server
    FU.buttons.submit();

    FU.exists(by.id('create_success'), true);
  });

  it('successfully edits an service', () => {
    element(by.id(`service-upd-${SERVICE_RANK}`)).click();
    FU.input('ServicesCtrl.service.name', 'Updated');
    element(by.id('change_service')).click();

    FU.exists(by.id('update_success'), true);
  });

  it('correctly blocks invalid form submission with relevant error classes', () => {
    FU.buttons.create();

    // verify form has not been successfully submitted
    expect(helpers.getCurrentPath()).to.eventually.equal(path);

    element(by.id('submit-service')).click();

    // The following fields should be required
    FU.validation.error('ServicesCtrl.service.name');
  });

  it('successfully delete an service', () => {
    element(by.id(`service-upd-${DELETE_SUCCESS}`)).click();

    // click the "delete" button 
    FU.buttons.delete();

    components.modalAction.confirm();

    FU.exists(by.id('delete_success'), true);
  });

  it('no way to delete a service', () => {
    element(by.id(`service-upd-${DELETE_ERROR}`)).click();

    // click the "delete" button 
    FU.buttons.delete();

    components.modalAction.confirm();
    FU.exists(by.id('delete_error'), true);
  });

  it('cancellation of removal process of a service', () => {
    element(by.id(`service-upd-${DELETE_ERROR}`)).click();

    // click the "delete" button 
    FU.buttons.delete();

    components.modalAction.dismiss();
    FU.exists(by.id('default'), true);
  });
});
