const chai = require('chai');
const helpers = require('../shared/helpers');

const EmployeeRegistryPage = require('./registry.page.js');
const SearchModalPage = require('./searchModal.page.js');

helpers.configure(chai);

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

  before(() => { helpers.navigate(path); });

  it('list all registered employees', () => {
    employeeRegistryPage.employeeCount(
      employeeCount,
      `The number of registered employee should be ${employeeCount}`
    );
  });

  it(`should find one employee with name "${parameters.name}"`, () => {
    employeeRegistryPage.search();
    searchModalPage.setDisplayName(parameters.name);
    searchModalPage.submit();
    employeeRegistryPage.employeeCount(ONE_EMPLOYEE, `The number of filtered employee should be ${ONE_EMPLOYEE}`);
    employeeRegistryPage.clearFilter();
  });

  it(`should find one "male" employee with name "${parameters.name}"`, () => {
    employeeRegistryPage.search();
    searchModalPage.setDisplayName(parameters.name);
    searchModalPage.selectSex('male');
    searchModalPage.submit();

    employeeRegistryPage.employeeCount(ONE_EMPLOYEE, `The number of filtered employee should be ${ONE_EMPLOYEE}`);
    employeeRegistryPage.clearFilter();
  });

  it('should find no female employee registered in the last year.', () => {
    employeeRegistryPage.search();
    searchModalPage.setRegistrationDateRange('year');
    searchModalPage.selectSex('female');
    searchModalPage.submit();

    employeeRegistryPage.employeeCount(0, `The number of filtered employee should be 0`);
    employeeRegistryPage.clearFilter();
  });

  it(`should find One employee With reference "${parameters.reference}"`, () => {
    employeeRegistryPage.search();
    searchModalPage.setReference(parameters.reference);
    searchModalPage.submit();
    employeeRegistryPage.employeeCount(ONE_EMPLOYEE, `The number of filtered employee should be ${ONE_EMPLOYEE}`);
    employeeRegistryPage.clearFilter();  
  });

  it('clearing filters restores default number of rows to the grid', () => {
    employeeRegistryPage.search();
    searchModalPage.selectSex('male');
    searchModalPage.submit();

    employeeRegistryPage.employeeCount(parameters.twoFilters, `The number of filtered employee should be ${parameters.twoFilters}`);
    employeeRegistryPage.clearFilter();
    employeeRegistryPage.employeeCount(employeeCount, `The number of filtered employee should be ${employeeCount}`);
  });

  it('should find Search for employees belonging to Service Administration, to funtion Infirmier and Grade 1.1', () => {
    employeeRegistryPage.search();

    searchModalPage.selectService('Administration');
    searchModalPage.selectFonction('Infirmier');
    searchModalPage.selectGrade('1.1');
    searchModalPage.submit();

    employeeRegistryPage.employeeCount(2, `The number of filtered employee should be 1`);
    employeeRegistryPage.clearFilter();
  });
});
