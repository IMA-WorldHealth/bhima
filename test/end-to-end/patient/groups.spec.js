/* global by */

const helpers = require('../shared/helpers');
const FU = require('../shared/FormUtils');
const components = require('../shared/components');
const GridRow = require('../shared/GridRow');

describe('Patient Groups', () => {
  // navigate to the page before running test suite
  before(() => helpers.navigate('#!/patients/groups'));

  // a new group to create
  const group = {
    name : 'HIV Patients',
    note : `
      These are patients that suffer from HIV and
      benefit from medical discounts.
    `,
  };

  it('creates a patient group', () => {
    FU.buttons.create();

    // expect the create form to exist
    FU.exists(by.css('[data-create-form]'), true);

    // fill in the form details
    FU.input('PatientGroupModalCtrl.patientGroup.name', group.name);
    FU.select('PatientGroupModalCtrl.patientGroup.price_list_uuid', 'Test Price List');
    FU.input('PatientGroupModalCtrl.patientGroup.note', group.note);

    // submit the form
    FU.buttons.submit();

    // notify success
    components.notification.hasSuccess();
  });

  it('updates a patient group', () => {
    const row = new GridRow(group.name);
    row.dropdown().click();
    row.edit().click();

    // change the note
    FU.input('PatientGroupModalCtrl.patientGroup.note',
      'I like writing end-to-end tests... They give me so much confidence in the application.');

    // submit the form
    FU.buttons.submit();

    // notify success
    components.notification.hasSuccess();
  });

  it('deletes a patient group', () => {
    const row = new GridRow(group.name);
    row.dropdown().click();
    row.remove().click();

    // confirm the deletion
    FU.buttons.submit();

    // expect success notification
    components.notification.hasSuccess();
  });
});
