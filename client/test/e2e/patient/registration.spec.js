/* jshint expr:true */
/* global element, by, browser */

var chai = require('chai');
var expect = chai.expect;

var helpers = require('../shared/helpers');
helpers.configure(chai);

var components = require('../shared/components');
var FU = require('../shared/FormUtils');

describe('patient registration', function () {
  'use strict';

  var registrationPath = '#/patients/register';

  var mockPatient = {
    first_name : 'Mock',
    middle_name : 'Patient',
    last_name : 'First',
    yob : '1993',
    sex : 'M',
    project_id : 1,
    hospital_no : 120
  };

  /** locations to be used in the patient select */
  var locations = [
   'dbe330b6-5cde-4830-8c30-dc00eccd1a5f', // Democratic Republic of the Congo
   'f6fc7469-7e58-45cb-b87c-f08af93edade', // Bas Congo,
   '0404e9ea-ebd6-4f20-b1f8-6dc9f9313450', // Tshikapa,
   '1f162a10-9f67-4788-9eff-c1fea42fcc9b'  // kele
  ];

  var uniqueHospitalNumber = 1020;

  // navigate to the patient registration page
  beforeEach(function () {
    browser.get(registrationPath);
  });

  it('successfully registers a valid patient', function (done) {

    // patient name
    FU.input('PatientRegCtrl.medical.last_name', mockPatient.last_name);
    FU.input('PatientRegCtrl.medical.middle_name', mockPatient.middle_name);
    FU.input('PatientRegCtrl.medical.first_name', mockPatient.first_name);

    // hospital number, etc
    FU.input('PatientRegCtrl.medical.hospital_no', mockPatient.hospital_no);
    FU.input('PatientRegCtrl.yob', mockPatient.yob);

    // set the locations via the "locations" array
    components.locationSelect.set(locations, 'origin-location-id');
    components.locationSelect.set(locations, 'current-location-id');

    // set the gender of the patient
    element(by.id('male')).click();

    // set the debtor group
    var select = element(by.model('PatientRegCtrl.finance.debtor_group_uuid'));
    var option = select.element(by.cssContainingText('option', 'Second Test Debtor Group'));
    option.click();

    // submit the patient registration form
    FU.buttons.submit();

    expect(browser.getCurrentUrl()).to.eventually.contain(browser.baseUrl + '#/patients/edit/')
    .then(function () {
      done();
    });
  });

  it('correctly updates date of birth given a valid year of birth', function () {
    var validYear = '2000';
    FU.input('PatientRegCtrl.yob', validYear);

    var calculatedDOB = element(by.model('PatientRegCtrl.medical.dob')).getText();
    expect(calculatedDOB).to.be.defined;
    expect(calculatedDOB).to.not.be.empty;

    // Expect required DOB (requires known formatting etc.)
  });

  // This test group assumes the previous mock patient has been successfully registered
  // with the system
  describe('form validation', function () {

    it('correctly blocks invalid form submission with relevent error classes', function () {

      // submit the patient registration form
      FU.buttons.submit();

      // verify form has not been successfully submitted
      expect(browser.getCurrentUrl()).to.eventually.equal(browser.baseUrl + registrationPath);

      // the following fields should be required
      FU.validation.error('PatientRegCtrl.medical.last_name');
      FU.validation.error('PatientRegCtrl.finance.debtor_group_uuid');
      FU.validation.error('PatientRegCtrl.medical.dob');

      // first name is not and title
      FU.validation.ok('PatientRegCtrl.medical.first_name');
      FU.validation.ok('PatientRegCtrl.medical.title');
    });

    it('correctly alerts for minimum and maximum dates', function () {
      var testMaxYear = '9000';
      var testMinYear = '1000';
      var validYear = '2000';

      FU.input('PatientRegCtrl.yob', testMaxYear);
      FU.exists(by.css('[data-date-error]'), true);

      FU.input('PatientRegCtrl.yob', validYear);
      FU.exists(by.css('[data-date-error]'), false);

      FU.input('PatientRegCtrl.yob', testMinYear);
      FU.exists(by.css('[data-date-error]'), true);
    });

    it('correctly identifies duplicate hospital numbers (async)', function () {

      // resend the (assumed) correctly registered patients hospital number
      FU.input('PatientRegCtrl.medical.hospital_no', mockPatient.hospital_no);
      FU.exists(by.id('unique-error-icon'), true);

      // put in a unique hospital number
      FU.input('PatientRegCtrl.medical.hospital_no', uniqueHospitalNumber);
      FU.exists(by.id('unique-error-icon'), false);
    });
  });

  /** @TODO Test attempting to register an invalid patient - look for specific error classes and help blocks */
});
