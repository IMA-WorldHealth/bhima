/* global element, by, browser */
const { expect } = require('chai');
const FU = require('../shared/FormUtils');
const components = require('../shared/components');
const helpers = require('../shared/helpers');

describe('Patient Registration', () => {
  const path = '#!/patients/register';
  beforeEach(() => helpers.navigate(path));

  const mockPatient = {
    display_name : 'Mock Patient First',
    dob          : '01/01/1993',
    sex          : 'M',
    project_id   : 1,
    hospital_no  : 120,
  };

  it('registers a valid patient', async () => {
    // patient name
    await components.inpuText.set('display_name', mockPatient.display_name);

    // hospital number, etc
    await FU.input('PatientRegCtrl.medical.hospital_no', mockPatient.hospital_no);
    await FU.input('PatientRegCtrl.medical.dob', mockPatient.dob);

    // set the gender of the patient
    await element(by.id('male')).click();

    // set the locations via the "locations" array
    await components.locationSelect.set(helpers.data.locations, 'origin-location-id');
    await components.locationSelect.set(helpers.data.locations, 'current-location-id');

    // set the debtor group
    await components.debtorGroupSelect.set('NGO IMA World Health');


    // submit the patient registration form
    await FU.buttons.submit();
    await FU.exists(by.id('receipt-confirm-created'), true);
  });

  // This test group assumes the previous mock patient has been successfully registered
  // with the system
  describe('form validation', () => {
    // refresh the page to make sure previous data is cleared
    before(() => browser.refresh());

    it('blocks invalid form submission with relevent error classes', async () => {
      // submit the patient registration form
      await FU.buttons.submit();

      // verify form has not been submitted
      expect(await helpers.getCurrentPath()).to.equal(path);

      // the following fields should be required
      await components.inpuText.validationError('display_name');
      await FU.validation.error('$ctrl.debtorGroupUuid');
      await FU.validation.error('PatientRegCtrl.medical.dob');

      // first name and title are optional
      await components.inpuText.validationOk('title');

      await components.notification.hasDanger();
    });

    it('alerts for minimum and maximum dates', async () => {
      const testMaxYear = '01/01/9000';
      const validYear = '01/01/2000';
      const testMinYear = '01/01/1000';

      await FU.input('PatientRegCtrl.medical.dob', testMaxYear);
      await FU.exists(by.css('[data-date-error]'), true);

      await FU.input('PatientRegCtrl.medical.dob', validYear);
      await FU.exists(by.css('[data-date-error]'), false);

      await FU.input('PatientRegCtrl.medical.dob', testMinYear);
      await FU.exists(by.css('[data-date-error]'), true);
    });
  });
});
