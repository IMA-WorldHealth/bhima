/* global element, by, browser */

const chai = require('chai');
const expect = chai.expect;

const helpers = require('../shared/helpers');
helpers.configure(chai);

const FU = require('../shared/FormUtils');

describe('Patient Groups', function () {

  // navigate to the page before running test suite
  before(() => browser.get('#/patients/groups'));

  // a new group to create
  const group = {
    name : 'HIV Patients',
    note: 'These are patients that suffer from HIV and ' +
      'benefit from medical discounts.'
  };

  // the uuid to delete.
  var deleteUuid = 'group-112a9fb5-847d-4c6a-9b20-710fa8b4da22';

  it('creates a patient group', function () {

    // get the create form
    FU.buttons.create();

    // expect the create form to exist
    FU.exists(by.css('[data-create-form]'), true);

    // fill in the form details

    FU.input('PatientGroupCtrl.patientGroup.name', group.name);

    FU.select('PatientGroupCtrl.patientGroup.price_list_uuid')
      .enabled()
      .first()
      .click();

    FU.input('PatientGroupCtrl.patientGroup.note', group.note);

    // submit the form
    FU.buttons.submit();

    // expect the form element to eventually be removed.
    FU.exists(by.css('[data-create-form]'), false);
  });

  it('updates a patient group', function () {

    // click the update button
    var row = element(by.id(deleteUuid));
    row.click();

    // expect the update form to exist
    FU.exists(by.css('[data-update-form]'), true);

    // change the note
    FU.input('PatientGroupCtrl.patientGroup.note', 'I like writing end-to-end tests... ' +
     'They give me so much confidence in the application.'
    );

    // submit the form
    FU.buttons.submit();

    // expect the form element to eventually be removed.
    FU.exists(by.css('[data-update-form]'), false);
  });

  it('deletes a patient group', function () {
    // click the update button
    var row = element(by.id(deleteUuid));
    row.click();

    FU.buttons.delete();

    // reject the alert that appears
    browser.switchTo().alert().accept();

    // expect the row to eventually be cleared
    FU.exists(by.id(deleteUuid), false);
  });
});
