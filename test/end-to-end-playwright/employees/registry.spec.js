const { chromium } = require('@playwright/test');
const { test } = require('@playwright/test');
const TU = require('../shared/TestUtils');
const EmployeeRegistryPage = require('./registry.page');
const SearchModalPage = require('./searchModal.page');

test.beforeAll(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  TU.registerPage(page);
  await TU.login();
});

test.describe('Employees Registry', () => {
  const path = '/#!/employees';
  const employeeRegistryPage = new EmployeeRegistryPage();
  const searchModalPage = new SearchModalPage();
  const expectEmployeeCount = 4;
  const ONE_EMPLOYEE = 1;
  const parameters = {
    name : 'Employee Test',
    // Note: This was 'Dedrick' which only worked if 'registration.spec.js' ran first.
    //       Since the files in a directory are run in parallel, there was no guarantee
    //       of the order, so this was changed to one of the built-in names
    oneFilter : 1,
    reference : 'EM.TE.2',
    twoFilters : 2,
    threeFilters : 3,
    fourFilters : 4,
  };

  test.beforeEach(async () => {
    await TU.navigate(path);
    await TU.waitForSelector('div.ui-grid-footer', { waitUntil : 'domcontentloaded' });
    await employeeRegistryPage.clearFilters();
  });

  test('list all registered employees', async () => {
    await employeeRegistryPage.expectEmployeeCount(
      expectEmployeeCount,
      `The number of registered employee should be ${expectEmployeeCount}`);
  });

  test(`should find one employee with name "${parameters.name}"`, async () => {
    await employeeRegistryPage.search();
    await searchModalPage.setDisplayName(parameters.name);
    await searchModalPage.submit();
    await employeeRegistryPage.expectEmployeeCount(ONE_EMPLOYEE,
      `The number of filtered employee should be ${ONE_EMPLOYEE}`);
  });

  test(`should find one "female" employee with name "${parameters.name}"`, async () => {
    await employeeRegistryPage.search();
    await searchModalPage.setDisplayName(parameters.name);
    await searchModalPage.selectSex('female');
    await searchModalPage.submit();
    await employeeRegistryPage.expectEmployeeCount(ONE_EMPLOYEE,
      `The number of filtered employee should be ${ONE_EMPLOYEE}`);
  });

  test('should find no female employee registered in the last year.', async () => {
    await employeeRegistryPage.search();
    await searchModalPage.setRegistrationDateRange('year');
    await searchModalPage.selectSex('female');
    await searchModalPage.submit();
    await employeeRegistryPage.expectEmployeeCount(0,
      `The number of filtered employee should be 0`);
  });

  test(`should find one employee With reference "${parameters.reference}"`, async () => {
    await employeeRegistryPage.search();
    await searchModalPage.setReference(parameters.reference);
    // This hack seems to be necessary to prevent hiring date from being added
    await TU.locator('bh-date-interval[date-id="embauche-date"] li a i.fa-eraser + span').click();
    await searchModalPage.submit();
    await employeeRegistryPage.expectEmployeeCount(ONE_EMPLOYEE,
      `The number of filtered employee should be ${ONE_EMPLOYEE}`);
  });

  test('clearing filters restores default number of rows to the grid', async () => {
    await employeeRegistryPage.search();
    await searchModalPage.selectSex('female');
    await searchModalPage.submit();

    await employeeRegistryPage.expectEmployeeCount(
      [1, 2, 3], // @TODO : fix to eliminate problems with parallel execution of patient and employees tests
      `The number of filtered employee should be 1, 2, or 3`);

    await employeeRegistryPage.clearFilters();
    await employeeRegistryPage.expectEmployeeCount(
      [4, 5, 6], // @TODO : fix to eliminate problems with parallel execution of patient and employees tests
      `The number of filtered employee should be 4, 5, or 6`);
  });

  test('should search for employees in service Administration, to function Infirmier and grade 3', async () => {
    await employeeRegistryPage.search();
    await searchModalPage.selectService('Medecine Interne');
    await searchModalPage.selectFunction('Infirmier');
    await searchModalPage.selectGrade('grade 3');
    await searchModalPage.submit();

    await employeeRegistryPage.expectEmployeeCount(1, `The number of filtered employee should be 1`);
  });
});
