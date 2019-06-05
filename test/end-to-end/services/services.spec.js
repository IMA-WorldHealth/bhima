const helpers = require('../shared/helpers');
const ServicePage = require('./services.page');

describe('Services', () => {
  const path = '#!/services';
  before(() => helpers.navigate(path));

  const Page = new ServicePage();

  const service = {
    name : 'Service E2E',
    project : 'Test Project A',
  };

  const alternativeProject = 'Test Project B';

  const NEW_RECORD_ROW = 2; // based on alphabetical sort and position
  const OLD_RECORD_ROW = 2; // after the deletion of the latest the index is 2

  it('successfully creates a new service', async () => {
    await Page.createService(service.name, service.project);
  });

  it('successfully edits a service', async () => {
    await Page.editService(NEW_RECORD_ROW, service.name.concat(' updated'), alternativeProject);
  });

  it('correctly blocks invalid form submission with relevant error classes', async () => {
    await Page.errorOnCreateService();
  });

  it('successfully delete a service', async () => {
    await Page.deleteService(NEW_RECORD_ROW);
  });

  it('no way to delete a service', async () => {
    await Page.errorOnDeleteService(OLD_RECORD_ROW);
  });

  it('cancellation of removal process of a service', async () => {
    await Page.cancelDeleteService(OLD_RECORD_ROW);
  });
});
