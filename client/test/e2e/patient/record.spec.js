/* jshint expr: true */
/* global element, by, browser */
'use strict';

const path    = require('path');
const chai    = require('chai');
const expect  = chai.expect;

const components  = require('../shared/components');
const helpers     = require('../shared/helpers');
const FU          = require('../shared/FormUtils');
helpers.configure(chai);

describe('Patient Record', function () {
  const root = '#/patients/';
  const id = '274c51ae-efcc-4238-98c6-f402bfb39866';

  const patient = {
    name : 'Test Patient 2',
    id : 'TPA1',
    hospital_no : '110',
    age : '26',
    gender : 'M'
  };

  const url = root.concat(id);

  before(() => helpers.navigate(url));

  it('downloads and correctly displays patient information', function () {
    expect(element(by.id('name')).getText()).to.eventually.equal(patient.name);
    expect(element(by.id('patientID')).getText()).to.eventually.equal(patient.id);
    expect(element(by.id('hospitalNo')).getText()).to.eventually.equal(patient.hospital_no);
    expect(element(by.id('age')).getText()).to.eventually.equal(patient.age);
    expect(element(by.id('gender')).getText()).to.eventually.equal(patient.gender);
  });

  // sub unit tests - these can be moved to individual files if they become too large
  it('displays the correct number of check ins', function () {
    expect(element.all(by.css('[data-check-entry]')).count()).to.eventually.equal(1);
  });

  it('checks in a patient', function () {
    element(by.id('checkin')).click();
    components.notification.hasSuccess();

    // verify that the check in has been displayed
    expect(element.all(by.css('[data-check-entry]')).count()).to.eventually.equal(2);
  });

  // Upload patient documents
  it('Upload a valid image as document', () => {
    let title = '[e2e] New Image As Document';
    let fileToUpload = 'client/test/e2e/shared/upload/file.jpg';
    let absolutePath = path.resolve(fileToUpload);

    element(by.css('[data-document-action="add"]')).click();
    element(by.model('$ctrl.title')).clear().sendKeys(title);
    element(by.css('input[type="file"]')).sendKeys(absolutePath);

    FU.modal.submit();
    components.notification.hasSuccess();
  });

  // Upload patient documents
  it('Upload a PDF document', () => {
    let title = '[e2e] New Document';
    let fileToUpload = 'client/test/e2e/shared/upload/file.pdf';
    let absolutePath = path.resolve(fileToUpload);

    element(by.css('[data-document-action="add"]')).click();
    element(by.model('$ctrl.title')).clear().sendKeys(title);
    element(by.css('input[type="file"]')).sendKeys(absolutePath);

    FU.modal.submit();
    components.notification.hasSuccess();
  });

  // test invalid file upload
  it('Cannot upload invalid document', () => {
    let title = '[e2e] Invalid Document';
    let fileToUpload = 'client/test/e2e/shared/upload/file.virus';
    let absolutePath = path.resolve(fileToUpload);

    element(by.css('[data-document-action="add"]')).click();
    element(by.model('$ctrl.title')).clear().sendKeys(title);
    element(by.css('input[type="file"]')).sendKeys(absolutePath);
    element(by.css('[data-error-message]')).isPresent();

    FU.modal.close();
  });

  // change document view
  it('Change document view', () => {
    element(by.css('[data-document-action="thumbnail"]')).click();
    element(by.css('[data-view="thumbnail"]')).isPresent();

    element(by.css('[data-document-action="list"]')).click();
    element(by.css('[data-view="list"]')).isPresent();
  });

  it('informs the user that there is no patient for invalid request', function () {
    helpers.navigate(root.concat('invalidid'));
    components.notification.hasError();
    expect(element(by.id('nopatient')).isPresent()).to.eventually.equal(true);
  });

});
