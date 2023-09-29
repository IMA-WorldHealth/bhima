const { chromium } = require('@playwright/test');
const { test } = require('@playwright/test');
const TU = require('../shared/TestUtils');

const components = require('../shared/components');

const RegistrationPage = require('./registration.page');

test.beforeAll(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  TU.registerPage(page);
  await TU.login();
});

test.describe('Update Employees', () => {
  const path = '/#!/employees';
  const registrationPage = new RegistrationPage();
  const employeeReference1 = 'EM.TE.1'; // Test 2 Patient
  const employeeReference2 = 'EM.TE.2'; // Employee Test 1

  test.beforeEach(async () => {
    await TU.navigate(path);
  });

  test(`should update data for employee`, async () => {
    await registrationPage.editEmployee(employeeReference1);

    await registrationPage.setService('Administration');
    await registrationPage.setFunction('Infirmier');
    await registrationPage.setGrade('A1');

    await registrationPage.setCurrencyInput('TPR', 10);
    await registrationPage.setCurrencyInput('v_cher', 50);
    await registrationPage.setCurrencyInput('f_scol', 0);
    await registrationPage.setCurrencyInput('allc', 0);
    await registrationPage.setCurrencyInput('ac_sal', 0);

    await registrationPage.createEmployee();
    await components.notification.hasSuccess();
  });

  test(`blocks validation when the value is already taken when the field must be Unique`, async () => {
    await registrationPage.editEmployee(employeeReference2);
    await registrationPage.setHospitalNumber(110);

    await registrationPage.createEmployee();
    await components.notification.hasDanger();
  });
});
