/* global element, by, browser */
const chai = require('chai');

const helpers = require('../shared/helpers');

helpers.configure(chai);

const ServicePage = require('./services.page');

describe('Services', () => {
  const path = '#!/services';
  before(() => helpers.navigate(path));

  const Page = new ServicePage();

  const service = {
    name : 'Service E2E',
  };

  const NEW_RECORD_ROW = 2; // based on alphabetical sort and position
  const OLD_RECORD_ROW = 2; // after the deletion of the latest the index is 2

  it('successfully creates a new service', () => {
    Page.createService(service.name);
  });

  it('successfully edits a service', () => {
    Page.editService(NEW_RECORD_ROW, service.name.concat(' updated'));
  });

  it('correctly blocks invalid form submission with relevant error classes', () => {
    Page.errorOnCreateService();
  });

  it('successfully delete a service', () => {
    Page.deleteService(NEW_RECORD_ROW);
  });

  it('no way to delete a service', () => {
    Page.errorOnDeleteService(OLD_RECORD_ROW);
  });

  it('cancellation of removal process of a service', () => {
    Page.cancelDeleteService(OLD_RECORD_ROW);
  });
});
