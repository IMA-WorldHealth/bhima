/* global element, by */
const chai = require('chai');
const helpers = require('../shared/helpers');
const components = require('../shared/components');

const RegistrationPage = require('./registration.page.js');

helpers.configure(chai);

describe('Update Employees', () => {
  const path = '#!/employees';
  const registrationPage = new RegistrationPage();


  before(() => { helpers.navigate(path); });

  it(`should update data for employee`, () => {
    element.all(by.css('[data-method="action"]')).get(1).click();
    element.all(by.css('[data-method="edit"]')).get(1).click();

    registrationPage.setService('Administration');
    registrationPage.setFonction('Infirmier');
    registrationPage.setIsMedical();
    registrationPage.setGrade('A1');
    registrationPage.createEmployee();
    components.notification.hasSuccess();
  });

  it(`blocks validation when the value is already taken when the field must be Unique`, () => {
    element.all(by.css('[data-method="action"]')).get(0).click();
    element.all(by.css('[data-method="edit"]')).get(1).click();

    registrationPage.setHospitalNumber(110);

    registrationPage.createEmployee();
    components.notification.hasDanger();
  });
});
