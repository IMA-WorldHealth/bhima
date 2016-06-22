/* jshint expr: true */
/* global element, by, browser */
const chai = require('chai');
const expect = chai.expect;

const FU = require('../shared/FormUtils');
const components = require('../shared/components');
const helpers = require('../shared/helpers');
helpers.configure(chai);

describe('patient registration', function () {
  'use strict';

  const path = '#/patients/register';
  beforeEach(() => helpers.navigate(path));

  const mockPatient = {
    first_name : 'Mock',
    middle_name : 'Patient',
    last_name : 'First',
    yob : '1993',
    sex : 'M',
    project_id : 1,
    hospital_no : 120
  };

  const uniqueHospitalNumber = 1020;

  it('registers a valid patient', function (done) {

    // patient name
    FU.input('PatientRegCtrl.medical.last_name', mockPatient.last_name);
    FU.input('PatientRegCtrl.medical.middle_name', mockPatient.middle_name);
    FU.input('PatientRegCtrl.medical.first_name', mockPatient.first_name);

    // hospital number, etc
    FU.input('PatientRegCtrl.medical.hospital_no', mockPatient.hospital_no);
    FU.input('PatientRegCtrl.yob', mockPatient.yob);

    // set the gender of the patient
    element(by.id('male')).click();

    // set the locations via the "locations" array
    components.locationSelect.set(helpers.data.locations, 'origin-location-id');
    components.locationSelect.set(helpers.data.locations, 'current-location-id');

    // set the debtor group
    FU.select('PatientRegCtrl.finance.debtor_group_uuid', 'Second Test Debtor Group');

    // submit the patient registration form
    FU.buttons.submit();
    FU.exists(by.id('receipt-confirm-created'), true);
    done();
  });

  it('correctly updates date of birth given a valid year of birth', function () {
    var validYear = '2000';
    FU.input('PatientRegCtrl.yob', validYear);

    var calculatedDOB = element(by.model('PatientRegCtrl.medical.dob')).getText();

    expect(calculatedDOB).to.be.defined;
    expect(calculatedDOB).to.not.be.empty;
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
      FU.validation.error('PatientRegCtrl.medical.last_name');
      FU.validation.error('PatientRegCtrl.finance.debtor_group_uuid');
      FU.validation.error('PatientRegCtrl.medical.dob');

      // first name and title are optional
      FU.validation.ok('PatientRegCtrl.medical.first_name');
      FU.validation.ok('PatientRegCtrl.medical.title');

      components.notification.hasDanger();
    });

    it('alerts for minimum and maximum dates', function () {
      var testMaxYear = '9000';
      var validYear = '2000';
      var testMinYear = '1000';


      FU.input('PatientRegCtrl.yob', testMaxYear);
      FU.exists(by.css('[data-date-error]'), true);

      FU.input('PatientRegCtrl.yob', validYear);
      FU.exists(by.css('[data-date-error]'), false);

      FU.input('PatientRegCtrl.yob', testMinYear);
      FU.exists(by.css('[data-date-error]'), true);
    });
  });
});
