/* global element, by */
const chai = require('chai');
const helpers = require('../shared/helpers');
const components = require('../shared/components');

const RegistrationPage = require('./registration.page.js');

helpers.configure(chai);

describe('Update Employees', () => {
  const path = '#!/employees';
  const registrationPage = new RegistrationPage();
  const employeeName1 = 'Test 2 Patient';
  const employeeName2 = 'Employee Test 1';


  before(() => { helpers.navigate(path); });

  it(`should update data for employee`, () => {
    registrationPage.editEmployeeName(employeeName1);

    registrationPage.setService('Administration');
    registrationPage.setFonction('Infirmier');
    registrationPage.setIsMedical();
    registrationPage.setGrade('A1');

    registrationPage.setCurrencyInput('TPR', 10);
    registrationPage.setCurrencyInput('v_cher', 50);
    registrationPage.setCurrencyInput('f_scol', 0);
    registrationPage.setCurrencyInput('allc', 0);
    registrationPage.setCurrencyInput('ac_sal', 0);

    registrationPage.createEmployee();
    components.notification.hasSuccess();

  });

  it(`blocks validation when the value is already taken when the field must be Unique`, () => {
    registrationPage.editEmployeeName(employeeName2);

    registrationPage.setHospitalNumber(110);

    registrationPage.createEmployee();
    components.notification.hasDanger();
  });
});
