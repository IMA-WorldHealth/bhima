/* global element, by, browser */
const chai = require('chai');
const FU = require('../shared/FormUtils');
const components = require('../shared/components');
const helpers = require('../shared/helpers');

const expect = chai.expect;
helpers.configure(chai);

describe('Patient Registration', function () {

  const path = '#!/patients/register';
  beforeEach(() => helpers.navigate(path));

  const mockPatient = {
    display_name : 'Mock Patient First',
    dob          : '01/01/1993',
    sex          : 'M',
    project_id   : 1,
    hospital_no  : 120,
  };

  const uniqueHospitalNumber = 1020;

  it('registers a valid patient', function () {

    // patient name
    FU.input('PatientRegCtrl.medical.display_name', mockPatient.display_name);

    // hospital number, etc
    FU.input('PatientRegCtrl.medical.hospital_no', mockPatient.hospital_no);
    FU.input('PatientRegCtrl.medical.dob', mockPatient.dob);

    // set the gender of the patient
    element(by.id('male')).click();

    // set the locations via the "locations" array
    components.locationSelect.set(helpers.data.locations, 'origin-location-id');
    components.locationSelect.set(helpers.data.locations, 'current-location-id');

    // set the debtor group
    FU.uiSelect('PatientRegCtrl.finance.debtor_group_uuid', 'Second Test Debtor Group');

    // submit the patient registration form
    FU.buttons.submit();
    FU.exists(by.id('receipt-confirm-created'), true);
  });

  // This test group assumes the previous mock patient has been successfully registered
  // with the system
  describe('form validation', function () {

    // refresh the page to make sure previous data is cleared
    before(() => browser.refresh());

    it('blocks invalid form submission with relevent error classes', function () {

      // submit the patient registration form
      FU.buttons.submit();

      // verify form has not been submitted
      expect(helpers.getCurrentPath()).to.eventually.equal(path);

      // the following fields should be required
      FU.validation.error('PatientRegCtrl.medical.display_name');
      FU.validation.error('PatientRegCtrl.finance.debtor_group_uuid');
      FU.validation.error('PatientRegCtrl.medical.dob');

      // first name and title are optional
      FU.validation.ok('PatientRegCtrl.medical.title');

      components.notification.hasDanger();
    });

    it('alerts for minimum and maximum dates', function () {
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
