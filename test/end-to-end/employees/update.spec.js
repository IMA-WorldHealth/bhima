const helpers = require('../shared/helpers');
const components = require('../shared/components');
const RegistrationPage = require('./registration.page.js');

describe('Update Employees', () => {
  const path = '#!/employees';
  const registrationPage = new RegistrationPage();
  const employeeReference1 = 'EM.TE.1'; // Test 2 Patient
  const employeeReference2 = 'EM.TE.2'; // Employee Test 1

  before(() => helpers.navigate(path));

  it(`should update data for employee`, async () => {
    await registrationPage.editEmployee(employeeReference1);

    await registrationPage.setService('Administration');
    await registrationPage.setFonction('Infirmier');
    await registrationPage.setIsMedical();
    await registrationPage.setGrade('A1');

    await registrationPage.setCurrencyInput('TPR', 10);
    await registrationPage.setCurrencyInput('v_cher', 50);
    await registrationPage.setCurrencyInput('f_scol', 0);
    await registrationPage.setCurrencyInput('allc', 0);
    await registrationPage.setCurrencyInput('ac_sal', 0);

    await registrationPage.createEmployee();
    await components.notification.hasSuccess();
  });

  it(`blocks validation when the value is already taken when the field must be Unique`, async () => {
    await registrationPage.editEmployee(employeeReference2);
    await registrationPage.setHospitalNumber(110);

    await registrationPage.createEmployee();
    await components.notification.hasDanger();
  });
});
