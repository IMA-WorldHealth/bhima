const helpers = require('../shared/helpers');

const EmployeeRegistryPage = require('./registry.page.js');
const SearchModalPage = require('./searchModal.page.js');

describe('Employees Registry', () => {
  const path = '#!/employees';
  const employeeRegistryPage = new EmployeeRegistryPage();
  const searchModalPage = new SearchModalPage();
  const employeeCount = 4;
  const ONE_EMPLOYEE = 1;
  const parameters = {
    name : 'Dedrick',
    oneFilter : 1,
    reference : 'EM.TE.2',
    twoFilters : 2,
    threeFilters : 3,
    fourFilters : 4,
  };

  before(() => helpers.navigate(path));

  it('list all registered employees', async () => {
    await employeeRegistryPage.employeeCount(
      employeeCount,
      `The number of registered employee should be ${employeeCount}`
    );
  });

  it(`should find one employee with name "${parameters.name}"`, async () => {
    await employeeRegistryPage.search();
    await searchModalPage.setDisplayName(parameters.name);
    await searchModalPage.submit();
    await employeeRegistryPage.employeeCount(ONE_EMPLOYEE, `The number of filtered employee should be ${ONE_EMPLOYEE}`);
    await employeeRegistryPage.clearFilter();
  });

  it(`should find one "male" employee with name "${parameters.name}"`, async () => {
    await employeeRegistryPage.search();
    await searchModalPage.setDisplayName(parameters.name);
    await searchModalPage.selectSex('male');
    await searchModalPage.submit();

    await employeeRegistryPage.employeeCount(ONE_EMPLOYEE, `The number of filtered employee should be ${ONE_EMPLOYEE}`);
    await employeeRegistryPage.clearFilter();
  });

  it('should find no female employee registered in the last year.', async () => {
    await employeeRegistryPage.search();
    await searchModalPage.setRegistrationDateRange('year');
    await searchModalPage.selectSex('female');
    await searchModalPage.submit();

    await employeeRegistryPage.employeeCount(0, `The number of filtered employee should be 0`);
    await employeeRegistryPage.clearFilter();
  });

  it(`should find One employee With reference "${parameters.reference}"`, async () => {
    await employeeRegistryPage.search();
    await searchModalPage.setReference(parameters.reference);
    await searchModalPage.submit();
    await employeeRegistryPage.employeeCount(ONE_EMPLOYEE, `The number of filtered employee should be ${ONE_EMPLOYEE}`);
    await employeeRegistryPage.clearFilter();
  });

  it('clearing filters restores default number of rows to the grid', async () => {
    await employeeRegistryPage.search();
    await searchModalPage.selectSex('male');
    await searchModalPage.submit();

    await employeeRegistryPage.employeeCount(
      parameters.twoFilters,
      `The number of filtered employee should be ${parameters.twoFilters}`
    );

    await employeeRegistryPage.clearFilter();
    await employeeRegistryPage.employeeCount(
      employeeCount,
      `The number of filtered employee should be ${employeeCount}`
    );
  });

  it('should search for employees in service Administration, to function Infirmier and grade 1.1', async () => {
    await employeeRegistryPage.search();

    await searchModalPage.selectService('Administration');
    await searchModalPage.selectFonction('Infirmier');
    await searchModalPage.selectGrade('1.1');
    await searchModalPage.submit();

    await employeeRegistryPage.employeeCount(2, `The number of filtered employee should be 1`);
    await employeeRegistryPage.clearFilter();
  });
});
