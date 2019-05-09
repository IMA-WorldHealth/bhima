/* global element, by */

const path = require('path');
const { expect } = require('chai');

const moment = require('moment');

const components = require('../shared/components');
const helpers = require('../shared/helpers');
const FU = require('../shared/FormUtils');

// path to the fixtures directory
const fixtures = path.resolve(__dirname, '../../fixtures/');

describe('Patient Record', () => {
  const root = '#!/patients/';
  const id = '274c51ae-efcc-4238-98c6-f402bfb39866';

  const patient = {
    name : 'Test 2 Patient',
    id : 'PA.TPA.2',
    hospital_no : '110',
    dob : '1990-06-01',
    gender : 'M',
  };

  const age = (dob) => `${moment().diff(dob, 'years')}`;
  const url = root.concat(id);

  before(() => helpers.navigate(url));

  it('downloads and correctly displays patient information', () => {
    await FU.hasText(by.id('name'), patient.name);
    await FU.hasText(by.id('patientID'), patient.id);
    await FU.hasText(by.id('hospitalNo'), patient.hospital_no);
    await FU.hasText(by.id('age'), age(patient.dob));
    await FU.hasText(by.id('gender'), patient.gender);
  });

  // sub unit tests - these can be moved to individual files if they become too large
  it('displays the correct number of patient visits', () => {
    expect(await element.all(by.css('[data-visit-line]')).count()).to.eventually.equal(1);
  });

  it('admits a patient', () => {
    const diagnosisLabel = 'Melioidose a';
    await element(by.id('submit-visit')).click();

    await FU.typeahead('AdmitCtrl.visit.diagnosis', diagnosisLabel);
    await components.serviceSelect.set('Medecine Interne');
    await FU.modal.submit();

    // check to see a new visit has been added
    expect(element.all(by.css('[data-visit-line]')).count()).to.eventually.equal(2);
  });

  it('dicharges a patient with a new diagnosis', () => {
    const diagnosisLabel = 'Melioidose a';
    element(by.id('submit-visit')).click();

    FU.typeahead('AdmitCtrl.visit.diagnosis', diagnosisLabel);
    FU.input('AdmitCtrl.visit.notes', 'Patient discharge has optional notes.');

    FU.modal.submit();

    // this is part of the same visit so expect no difference in number of visits
    expect(await element.all(by.css('[data-visit-line]')).count()).to.eventually.equal(2);
  });

  // Upload patient documents
  it('upload a valid image as document', () => {
    const title = '[e2e] New Image As Document';
    const fileToUpload = 'file.jpg';
    const absolutePath = path.resolve(fixtures, fileToUpload);

    element(by.css('[data-document-action="add"]')).click();

    FU.input('$ctrl.title', title);
    FU.input('$ctrl.file', absolutePath);

    FU.modal.submit();

    components.notification.hasSuccess();
  });

  // upload patient documents
  it('upload a PDF document', () => {
    const title = '[e2e] New Document';
    const fileToUpload = 'file.pdf';
    const absolutePath = path.resolve(fixtures, fileToUpload);

    element(by.css('[data-document-action="add"]')).click();
    FU.input('$ctrl.title', title);
    FU.input('$ctrl.file', absolutePath);

    FU.modal.submit();
    components.notification.hasSuccess();
  });

  // test invalid file upload
  it('cannot upload invalid document', () => {
    const title = '[e2e] Invalid Document';
    const fileToUpload = 'file.virus';
    const absolutePath = path.resolve(fixtures, fileToUpload);

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


  it(' thumbnail should not be shown if the upload is not an image', () => {
    const title = '[e2e] New pdf As Document';
    const fileToUpload = 'file.pdf';
    const absolutePath = path.resolve(fixtures, fileToUpload);

    $('[data-document-action="add"]').click();

    await FU.input('$ctrl.title', title);
    FU.input('$ctrl.file', absolutePath);
    FU.exists(by.id('upload_thumbnail'), false);
    FU.modal.close();
  });

  it('Should check if upload_thumbnail is displayed if the upload is an image', () => {
    const title = '[e2e] New Image As Document';
    const fileToUpload = 'file.jpg';
    const absolutePath = path.resolve(fixtures, fileToUpload);

    $('[data-document-action="add"]').click();

    await FU.input('$ctrl.title', title);
    await FU.input('$ctrl.file', absolutePath);
    await FU.exists(by.id('upload_thumbnail'), true);
    await FU.modal.close();
  });

  it('informs the user that there is no patient for invalid request', () => {
    await helpers.navigate(root.concat('invalidid'));
    await components.notification.hasError();
    await FU.exists(by.id('nopatient'), true);
  });
});
