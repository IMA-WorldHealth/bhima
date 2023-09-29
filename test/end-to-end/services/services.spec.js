const { chromium } = require('@playwright/test');
const { test } = require('@playwright/test');
const TU = require('../shared/TestUtils');

const ServicePage = require('./services.page');

test.beforeAll(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  TU.registerPage(page);
  await TU.login();
});

test.describe('Services', () => {
  const path = '#!/services';

  test.beforeEach(async () => {
    await TU.navigate(path);
  });

  const Page = new ServicePage();

  const service = {
    name : 'Pharmacie d\'Usage',
    project : 'Test Project A',
    costCenter : 'Principale TPA',
  };

  const updatedServiceName = 'Pharmacie de la Nuit';
  const oldServiceName = 'Medecine Interne';

  const alternativeProject = 'Test Project B';

  test('successfully creates a new service', async () => {
    await Page.createService(service.name, service.project, service.costCenter);
  });

  test('successfully edits a service', async () => {
    await Page.editService(service.name, updatedServiceName, alternativeProject);
  });

  test('correctly blocks invalid form submission with relevant error classes', async () => {
    await Page.errorOnCreateService();
  });

  test('successfully delete a service', async () => {
    await Page.deleteService(updatedServiceName);
  });

  test('cancellation of removal process of a service', async () => {
    await Page.cancelDeleteService(oldServiceName);
  });

  test('no way to delete a service', async () => {
    await Page.errorOnDeleteService(oldServiceName);
  });
});
