const helpers = require('../shared/helpers');
const FU = require('../shared/FormUtils');
const GridRow = require('../shared/GridRow');
const components = require('../shared/components');

describe('Patient Groups', async () => {
  // navigate to the page before running test suite
  before(async () => helpers.navigate('#!/patients/groups'));

  // a new group to create
  const group = {
    name : 'HIV Patients',
    note : `
      These are patients that suffer from HIV and
      benefit from medical discounts.
    `,
  };

  const group2 = {
    name : 'Employee PAX',
    note : `
      This is just for test.
    `,
  };

  it('creates a patient group', async () => {
    await FU.buttons.create();
    // fill in the form details
    await FU.input('ModalCtrl.patientGroup.name', group.name);
    await FU.select('ModalCtrl.patientGroup.price_list_uuid', 'Test Price List');
    await FU.input('ModalCtrl.patientGroup.note', group.note);

    // submit the form
    await FU.buttons.submit();
    await components.notification.hasSuccess();
  });

  it('creates a second patient group', async () => {
    await FU.buttons.create();
    // fill in the form details
    await FU.input('ModalCtrl.patientGroup.name', group2.name);
    await FU.select('ModalCtrl.patientGroup.price_list_uuid', 'Test Price List');
    await FU.input('ModalCtrl.patientGroup.note', group2.note);

    // submit the form
    await FU.buttons.submit();
    await components.notification.hasSuccess();
  });

  it('updates a patient group', async () => {

    await editGroup(group.name);
    // change the note
    await FU.input('ModalCtrl.patientGroup.note',
      'I like writing end-to-end tests... They give me so much confidence in the application.');

    // submit the form
    await FU.buttons.submit();
    await components.notification.hasSuccess();
  });

  it('deletes a patient group', async () => {
    await deleteGroup(group2.name);
    // reject the alert that appears
    await FU.buttons.submit();
    await components.notification.hasSuccess();
  });


  async function editGroup(label) {
    const row = await openDropdownMenu(label);
    await row.menu.$('[data-method="edit-record"]').click();
  }

  async function deleteGroup(label) {
    const row = await openDropdownMenu(label);
    await row.menu.$('[data-method="delete-record"]').click();
  }

  async function openDropdownMenu(label) {
    const row = new GridRow(label);
    await row.dropdown().click();
    return row;
  }
});
