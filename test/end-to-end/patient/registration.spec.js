/* global element, by, browser */
const chai = require('chai');
const FU = require('../shared/FormUtils');
const components = require('../shared/components');
const helpers = require('../shared/helpers');

const { expect } = chai;
helpers.configure(chai);

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

  it('registers a valid patient', () => {
    // patient name
    components.inpuText.set('display_name', mockPatient.display_name);

    // hospital number, etc
    FU.input('PatientRegCtrl.medical.hospital_no', mockPatient.hospital_no);
    FU.input('PatientRegCtrl.medical.dob', mockPatient.dob);

    // set the gender of the patient
    element(by.id('male')).click();

    // set the locations via the "locations" array
    components.locationSelect.set(helpers.data.locations, 'origin-location-id');
    components.locationSelect.set(helpers.data.locations, 'current-location-id');

    // set the debtor group
    components.debtorGroupSelect.set('NGO IMA World Health');


    // submit the patient registration form
    FU.buttons.submit();
    FU.exists(by.id('receipt-confirm-created'), true);
  });

  // This test group assumes the previous mock patient has been successfully registered
  // with the system
  describe('form validation', () => {
    // refresh the page to make sure previous data is cleared
    before(() => browser.refresh());

    it('blocks invalid form submission with relevent error classes', () => {
      // submit the patient registration form
      FU.buttons.submit();

      // verify form has not been submitted
      expect(helpers.getCurrentPath()).to.eventually.equal(path);

      // the following fields should be required
      components.inpuText.validationError('display_name');
      FU.validation.error('$ctrl.debtorGroupUuid');
      FU.validation.error('PatientRegCtrl.medical.dob');

      // first name and title are optional
      components.inpuText.validationOk('title');

      components.notification.hasDanger();
    });

    it('alerts for minimum and maximum dates', () => {
      const testMaxYear = '01/01/9000';
      const validYear = '01/01/2000';
      const testMinYear = '01/01/1000';


      FU.input('PatientRegCtrl.medical.dob', testMaxYear);
      FU.exists(by.css('[data-date-error]'), true);

      FU.input('PatientRegCtrl.medical.dob', validYear);
      FU.exists(by.css('[data-date-error]'), false);

      FU.input('PatientRegCtrl.medical.dob', testMinYear);
      FU.exists(by.css('[data-date-error]'), true);
    });
  });
});
