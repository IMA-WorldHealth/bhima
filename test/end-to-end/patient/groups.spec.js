/* global element, by */

const helpers = require('../shared/helpers');
const FU = require('../shared/FormUtils');
const components = require('../shared/components');

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

  // the uuid to delete.
  const deleteUuid = 'group-112A9FB5847D4C6A9B20710FA8B4DA22';

  it('creates a patient group', async () => {
    await FU.buttons.create();

    // expect the create form to exist
    await FU.exists(by.css('[data-create-form]'), true);

    // fill in the form details
    await FU.input('PatientGroupCtrl.patientGroup.name', group.name);
    await FU.select('PatientGroupCtrl.patientGroup.price_list_uuid', 'Test Price List');
    await FU.input('PatientGroupCtrl.patientGroup.note', group.note);

    // submit the form
    await FU.buttons.submit();

    // expect the form element to.be removed.
    await FU.exists(by.css('[data-create-form]'), false);
  });

  it('updates a patient group', async () => {
    const row = element(by.id(deleteUuid));
    await row.click();

    // expect the update form to exist
    await FU.exists(by.css('[data-update-form]'), true);

    // change the note
    await FU.input('PatientGroupCtrl.patientGroup.note',
      'I like writing end-to-end tests... They give me so much confidence in the application.');

    // submit the form
    await FU.buttons.submit();

    // expect the form element to.be removed.
    await FU.exists(by.css('[data-update-form]'), false);
  });

  it('deletes a patient group', async () => {
    const row = element(by.id(deleteUuid));
    await row.click();

    await FU.buttons.delete();

    // reject the alert that appears
    await components.modalAction.confirm();

    // expect the row to.be cleared
    await FU.exists(by.id(deleteUuid), false);
  });
});
