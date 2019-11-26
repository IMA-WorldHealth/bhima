/* global element, by */

const path = require('path');
const { expect } = require('chai');

const moment = require('moment');

const components = require('../shared/components');
const helpers = require('../shared/helpers');
const FU = require('../shared/FormUtils');
const FillFormManagement = require('../fillForm/fillForm.page');
// path to the fixtures directory
const fixtures = path.resolve(__dirname, '../../fixtures/');

describe('Patient Record', () => {
  const root = '#!/patients/';
  const id = '274c51ae-efcc-4238-98c6-f402bfb39866';
  const fillForm = new FillFormManagement();

  const patient = {
    name : 'Test 2 Patient',
    id : 'PA.TPA.2',
    hospital_no : '110',
    dob : '1990-06-01',
    gender : 'M',
  };

  const age = (dob) => `${moment().diff(dob, 'years')}`;
  const url = root.concat(id);

  const dataMedicalSheet = {
    choice_list_id : 'Paracetamol500 mg',
    poids : 68.9,
    dosekilos : 1,
    nombreFois : 3,
    voie : 'Orale',
    date : '1986-09-07',
    temps : '03:16',
    hours : '15',
    minutes : '00',
  };

  beforeEach(() => helpers.navigate(url));

  it(`View and complete a patient's medical sheet`, async () => {
    await element(by.id('form_1')).click();
    await fillForm.fillPatientSheet(dataMedicalSheet);
  });

  it('downloads and correctly displays patient information', async () => {
    await FU.hasText(by.id('name'), patient.name);
    await FU.hasText(by.id('patientID'), patient.id);
    await FU.hasText(by.id('hospitalNo'), patient.hospital_no);
    await FU.hasText(by.id('age'), age(patient.dob));
    await FU.hasText(by.id('gender'), patient.gender);
  });

  // sub unit tests - these can be moved to individual files if they become too large
  it('displays the correct number of patient visits', async () => {
    expect(await element.all(by.css('[data-visit-line]')).count()).to.equal(1);
  });

  it('admits a patient', async () => {
    const diagnosisLabel = 'Melioidose a';
    await element(by.id('submit-visit')).click();

    await components.diagnosisSelect.set(diagnosisLabel);
    await components.serviceSelect.set('Medecine Interne');

    await FU.modal.submit();

    // check to see a new visit has been added
    expect(await element.all(by.css('[data-visit-line]')).count()).to.equal(2);
  });

  it('dicharges a patient with a new diagnosis', async () => {
    const diagnosisLabel = 'Melioidose a';
    await element(by.id('submit-visit')).click();

    await components.diagnosisSelect.set(diagnosisLabel);
    await FU.input('AdmitCtrl.visit.notes', 'Patient discharge has optional notes.');

    await FU.modal.submit();

    // this is part of the same visit so expect no difference in number of visits
    expect(await element.all(by.css('[data-visit-line]')).count()).to.equal(2);
  });

  // Upload patient documents
  it('upload a valid image as document', async () => {
    const title = '[e2e] New Image As Document';
    const fileToUpload = 'file.jpg';
    const absolutePath = path.resolve(fixtures, fileToUpload);

    await element(by.css('[data-document-action="add"]')).click();

    await FU.input('$ctrl.title', title);
    await FU.input('$ctrl.file', absolutePath);

    await FU.modal.submit();

    await components.notification.hasSuccess();
  });

  // upload patient documents
  it('upload a PDF document', async () => {
    const title = '[e2e] New Document';
    const fileToUpload = 'file.pdf';
    const absolutePath = path.resolve(fixtures, fileToUpload);

    await element(by.css('[data-document-action="add"]')).click();
    await FU.input('$ctrl.title', title);
    await FU.input('$ctrl.file', absolutePath);

    await FU.modal.submit();
    await components.notification.hasSuccess();
  });

  // test invalid file upload
  it('cannot upload invalid document', async () => {
    const title = '[e2e] Invalid Document';
    const fileToUpload = 'file.virus';
    const absolutePath = path.resolve(fixtures, fileToUpload);

    await element(by.css('[data-document-action="add"]')).click();

    await FU.input('$ctrl.title', title);
    await FU.input('$ctrl.file', absolutePath);

    await FU.exists(by.css('[data-error-message]'), true);
    await FU.modal.close();
  });

  // change document view
  it('change document view', async () => {
    await element(by.css('[data-document-action="thumbnail"]')).click();
    await FU.exists(by.css('[data-view="thumbnail"]'), true);

    await element(by.css('[data-document-action="list"]')).click();
    await FU.exists(by.css('[data-view="list"]'), true);
  });

  it(' thumbnail should not be shown if the upload is not an image', async () => {
    const title = '[e2e] New pdf As Document';
    const fileToUpload = 'file.pdf';
    const absolutePath = path.resolve(fixtures, fileToUpload);

    await $('[data-document-action="add"]').click();

    await FU.input('$ctrl.title', title);
    await FU.input('$ctrl.file', absolutePath);
    await FU.exists(by.id('upload_thumbnail'), false);
    await FU.modal.close();
  });

  it('Should check if upload_thumbnail is displayed if the upload is an image', async () => {
    const title = '[e2e] New Image As Document';
    const fileToUpload = 'file.jpg';
    const absolutePath = path.resolve(fixtures, fileToUpload);

    await $('[data-document-action="add"]').click();

    await FU.input('$ctrl.title', title);
    await FU.input('$ctrl.file', absolutePath);
    await FU.exists(by.id('upload_thumbnail'), true);
    await FU.modal.close();
  });

  it('informs the user that there is no patient for invalid request', async () => {
    await helpers.navigate(root.concat('invalidid'));
    await components.notification.hasError();
    await FU.exists(by.id('nopatient'), true);
  });
});
