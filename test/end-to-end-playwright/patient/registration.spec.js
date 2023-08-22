const { chromium } = require('@playwright/test');
const { test, expect } = require('@playwright/test');
const TU = require('../shared/TestUtils');
const { by } = require('../shared/TestUtils');

test.beforeAll(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  TU.registerPage(page);
  await TU.login();
});

const components = require('../shared/components');
const helpers = require('../shared/helpers');

test.describe('Patient Registration', () => {
  const path = '/#!/patients/register';
  test.beforeEach(async () => {
    await TU.navigate(path);
  });

  const mockPatient = {
    display_name : 'Mock Patient First',
    dob          : '01/01/1993',
    sex          : 'M',
    project_id   : 1,
    hospital_no  : 120,
  };

  test('registers a valid patient', async () => {
    // patient name
    await components.inputText.set('display_name', mockPatient.display_name);

    // hospital number, etc
    await TU.input('PatientRegCtrl.medical.hospital_no', mockPatient.hospital_no);
    await TU.input('PatientRegCtrl.medical.dob', mockPatient.dob);

    // set the gender of the patient
    await TU.locator(by.id('male')).click();

    // set the locations via the "locations" array
    await components.locationSelect.set(helpers.data.locations, 'origin-location-id');
    await components.locationSelect.set(helpers.data.locations, 'current-location-id');

    // set the debtor group
    await components.debtorGroupSelect.set('NGO IMA World Health');

    // submit the patient registration form
    await TU.buttons.submit();
    await TU.waitForSelector(by.id('receipt-confirm-created'));
  });

  // This test group assumes the previous mock patient has been successfully registered
  // with the system
  test.describe('form validation', () => {

    test.beforeEach(async () => {
      // refresh the page to make sure previous data is cleared
      await TU.reloadPage();
    });

    test('blocks invalid form submission with relevant error classes', async () => {
      // submit the patient registration form
      await TU.buttons.submit();

      // verify form has not been submitted
      expect(await TU.getCurrentPath()).toBe(path);

      // the following fields should be required
      await components.inputText.validationError('display_name');
      await TU.validation.error('$ctrl.debtorGroupUuid');
      await TU.validation.error('PatientRegCtrl.medical.dob');

      // first name and title are optional
      await components.inputText.validationOk('title');

      await components.notification.hasDanger();
    });

    test('alerts for minimum and maximum dates', async () => {
      const testMaxYear = '01/01/9000';
      const validYear = '01/01/2000';
      const testMinYear = '01/01/1000';

      await TU.input('PatientRegCtrl.medical.dob', testMaxYear);
      await TU.locator(by.model('PatientRegCtrl.medical.dob')).press('Enter');
      await TU.exists('[data-date-error]', true);

      await TU.input('PatientRegCtrl.medical.dob', validYear);
      await TU.locator(by.model('PatientRegCtrl.medical.dob')).press('Enter');
      await TU.exists('[data-date-error]', false);

      await TU.input('PatientRegCtrl.medical.dob', testMinYear);
      await TU.locator(by.model('PatientRegCtrl.medical.dob')).press('Enter');
      await TU.exists('[data-date-error]', true);
    });
  });
});
