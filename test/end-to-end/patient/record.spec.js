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

// path to the fixtures directory
const fixtures = path.resolve(__dirname, '../../fixtures/');

describe('Patient Record', function () {
  const root = '#/patients/';
  const id = '274c51ae-efcc-4238-98c6-f402bfb39866';

  const patient = {
    name : 'Test 2 Patient',
    id : 'PA.TPA.2',
    hospital_no : '110',
    age : '26',
    gender : 'M'
  };

  const url = root.concat(id);

  before(() => helpers.navigate(url));

  it('downloads and correctly displays patient information', function () {
    FU.hasText(by.id('name'), patient.name);
    FU.hasText(by.id('patientID'), patient.id);
    FU.hasText(by.id('hospitalNo'), patient.hospital_no);
    FU.hasText(by.id('age'), patient.age);
    FU.hasText(by.id('gender'), patient.gender);
 });

  // sub unit tests - these can be moved to individual files if they become too large
  it('displays the correct number of patient visits', function () {
    expect(element.all(by.css('[data-visit-line]')).count()).to.eventually.equal(1);
  });

  it('admits a patient', function () {
    var diagnosisLabel = 'dio';
    element(by.id('submit-visit')).click();

    FU.typeahead('AdmitCtrl.visit.diagnosis', diagnosisLabel);
    FU.modal.submit();

    // check to see a new visit has been added
    expect(element.all(by.css('[data-visit-line]')).count()).to.eventually.equal(2);
  });

  it('dicharges a patient with a new diagnosis', function () {
    var diagnosisLabel = 'iod';
    element(by.id('submit-visit')).click();

    FU.typeahead('AdmitCtrl.visit.diagnosis', diagnosisLabel);
    FU.input('AdmitCtrl.visit.notes', 'Patient discharge has optional notes.');

    FU.modal.submit();

    // this is part of the same visit so expect no difference in number of visits
    expect(element.all(by.css('[data-visit-line]')).count()).to.eventually.equal(2);

  });

  // Upload patient documents
  it('upload a valid image as document', () => {
    let title = '[e2e] New Image As Document';
    let fileToUpload = 'file.jpg';
    let absolutePath = path.resolve(fixtures, fileToUpload);

    element(by.css('[data-document-action="add"]')).click();

    FU.input('$ctrl.title', title);
    FU.input('$ctrl.file', absolutePath);

    FU.modal.submit();
    components.notification.hasSuccess();
  });

  // upload patient documents
  it('upload a PDF document', () => {
    let title = '[e2e] New Document';
    let fileToUpload = 'file.pdf';
    let absolutePath = path.resolve(fixtures, fileToUpload);

    element(by.css('[data-document-action="add"]')).click();
    FU.input('$ctrl.title', title);
    FU.input('$ctrl.file', absolutePath);

    FU.modal.submit();
    components.notification.hasSuccess();
  });

  // test invalid file upload
  it('cannot upload invalid document', () => {
    let title = '[e2e] Invalid Document';
    let fileToUpload = '../shared/upload/file.virus';
    let absolutePath = path.resolve(fileToUpload);

    element(by.css('[data-document-action="add"]')).click();

    FU.input('$ctrl.title', title);
    FU.input('$ctrl.file', absolutePath);

    FU.exists(by.css('[data-error-message]'), true);
    FU.modal.close();
  });

  // change document view
  it('change document view', () => {
    element(by.css('[data-document-action="thumbnail"]')).click();
    FU.exists(by.css('[data-view="thumbnail"]'), true);

    element(by.css('[data-document-action="list"]')).click();
    FU.exists(by.css('[data-view="list"]'), true);
  });

  it('informs the user that there is no patient for invalid request', function () {
    helpers.navigate(root.concat('invalidid'));
    components.notification.hasError();
    FU.exists(by.id('nopatient'), true);
  });
});
