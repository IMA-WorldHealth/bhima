/* global element, by, inject, browser */

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
var expect = chai.expect;

var components = require('../shared/components');
var FormUtils = require('../shared/FormUtils');

describe('patient registration', function () {
  // this.timeout(30000);

  var REGISTRATION_PATH = '#/patients/register';

  var mockPatient = {
    first_name : 'Mock',
    middle_name : 'Patient',
    last_name : 'First',
    // dob : '1993-06-01T00:00:00.000Z',
    yob : '1993',
    // current_location_id : 'bda70b4b-8143-47cf-a683-e4ea7ddd4cff',
    // origin_location_id : 'bda70b4b-8143-47cf-a683-e4ea7ddd4cff',
    sex : 'M',
    project_id : 1,
    hospital_no : 120
  };

  /** locations to be used in the patient select */
  var locations = [
   'dbe330b6-5cde-4830-8c30-dc00eccd1a5f', // Democratic Republic of the Congo
   'f6fc7469-7e58-45cb-b87c-f08af93edade', // Bas Congo,
   '0404e9ea-ebd6-4f20-b1f8-6dc9f9313450', // Tshikapa,
   '1f162a10-9f67-4788-9eff-c1fea42fcc9b' // kele
  ];

  var debtorGroupUuid = 'string:66f03607-bfbc-4b23-aa92-9321ca0ff586';
  var uniqueHospitalNumber = 1020;

  beforeEach(function () {
    // navigate to the patient registration page
    browser.get(REGISTRATION_PATH);
  });

  it('registers a valid user', function (done) {
    element(by.model('PatientRegCtrl.medical.last_name')).sendKeys(mockPatient.last_name);
    element(by.model('PatientRegCtrl.medical.middle_name')).sendKeys(mockPatient.middle_name);
    element(by.model('PatientRegCtrl.medical.first_name')).sendKeys(mockPatient.first_name);

    element(by.model('PatientRegCtrl.medical.hospital_no')).sendKeys(mockPatient.hospital_no);

    element(by.model('PatientRegCtrl.yob')).sendKeys(mockPatient.yob);

    // set the locations via the "locations" array
    components.locationSelect.set(locations, 'origin-location-id');
    components.locationSelect.set(locations, 'current-location-id');

    element(by.id('male')).click();
    element(by.id('submitPatient')).click();

    element(by.model('PatientRegCtrl.finance.debitor_group_uuid')).element(by.cssContainingText('option', 'Second Test Debtor Group')).click();

    element(by.id('submitPatient')).click();

    // expect(browser.getCurrentUrl()).to.eventually.contain(browser.baseUrl + '#/invoice/patient/');
    expect(browser.getCurrentUrl()).to.eventually.contain(browser.baseUrl + '#/invoice/patient/')
      .then(function () {
        done();
      });
  });

  it('correctly updates Date of Birth given a valid Year of Birth', function () {
    var validYear = '2000';
    element(by.model('PatientRegCtrl.yob')).sendKeys(validYear);

    var calculatedDOB = element(by.model('PatientRegCtrl.medical.dob')).getText();

    expect(calculatedDOB).to.be.defined;
    expect(calculatedDOB).to.not.be.empty;

    // Expect required DOB (requires known formatting etc.)
  });

  // This test group assumes the previous mock patient has been successfully registered
  // with the system
  describe('form validation', function () {

    it('correctly blocks invalid form submission with relevent error classes', function () {

      element(by.id('submitPatient')).click();

      // Verify form has not been successfully submitted
      expect(browser.getCurrentUrl()).to.eventually.equal(browser.baseUrl + REGISTRATION_PATH);

      // The following fields should be required
      expect(element(by.model('PatientRegCtrl.medical.last_name')).getAttribute('class')).to.eventually.contain('ng-invalid');
      expect(element(by.model('PatientRegCtrl.finance.debitor_group_uuid')).getAttribute('class')).to.eventually.contain('ng-invalid');
      expect(element(by.model('PatientRegCtrl.medical.dob')).getAttribute('class')).to.eventually.contain('ng-invalid');

      // First name is not required
      expect(element(by.model('PatientRegCtrl.medical.first_name')).getAttribute('class')).to.eventually.not.contain('ng-invalid');
      expect(element(by.model('PatientRegCtrl.medical.title')).getAttribute('class')).to.eventually.not.contain('ng-invalid');
    });

    it('correctly alerts for minimum and maximum dates', function () {
      var testMaxYear = '9000';
      var testMinYear = '1000';

      element(by.model('PatientRegCtrl.yob')).sendKeys(testMaxYear);
      expect(element(by.id('date-error')).isPresent()).to.eventually.be.true;

      element(by.model('PatientRegCtrl.yob')).clear();
      element(by.model('PatientRegCtrl.yob')).sendKeys(testMaxYear);
      expect(element(by.id('date-error')).isPresent()).to.eventually.be.true;
    });

    it('correctly identifies duplicate hospital numbers (async)', function () {

      // Resent the (assumed) correctly registered patients hospital number
      element(by.model('PatientRegCtrl.medical.hospital_no')).sendKeys(mockPatient.hospital_no);
      expect(element(by.id('hospitalNumber-alert')).isPresent()).to.eventually.be.true;

      element(by.model('PatientRegCtrl.medical.hospital_no')).clear();
      element(by.model('PatientRegCtrl.medical.hospital_no')).sendKeys(uniqueHospitalNumber);

      expect(element(by.id('hospitalNumber-alert')).isPresent()).to.eventually.be.false;
    });
  });

  // TODO Test attempting to register an invalid patient - look for specific error classes and help blocks
});
