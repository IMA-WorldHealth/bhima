const helpers = require('../shared/helpers');
const ServicePage = require('./services.page');

describe('Services', () => {
  const path = '#!/services';
  before(() => helpers.navigate(path));

  const Page = new ServicePage();

  const service = {
    name : 'Pharmacie d\'Usage',
    project : 'Test Project A',
  };

  const updatedServiceName = 'Pharmacie de la Nuit';
  const oldServiceName = 'Medecine Interne';

  const alternativeProject = 'Test Project B';

  it('successfully creates a new service', async () => {
    await Page.createService(service.name, service.project);
  });

  it('successfully edits a service', async () => {
    await Page.editService(service.name, updatedServiceName, alternativeProject);
  });

  it('correctly blocks invalid form submission with relevant error classes', async () => {
    await Page.errorOnCreateService();
  });

  it('successfully delete a service', async () => {
    await Page.deleteService(updatedServiceName);
  });

  it('cancellation of removal process of a service', async () => {
    await Page.cancelDeleteService(oldServiceName);
  });

  it('no way to delete a service', async () => {
    await Page.errorOnDeleteService(oldServiceName);
  });
});
