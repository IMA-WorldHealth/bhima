/* global element, by */
const chai = require('chai');
const FU = require('../shared/FormUtils');
const helpers = require('../shared/helpers');
const components = require('../shared/components');
const GridRow = require('../shared/GridRow');

const { expect } = chai;

describe('Suppliers', () => {
  const path = '#!/suppliers';

  before(() => helpers.navigate(path));

  const supplier = {
    display_name : 'Alpha Lmtd',
    address_1    : '45 Street Blvd',
    address_2    : '30 june Blvd',
    email        : 'info@alpha.cd',
    fax          : '12-34-294-10',
    note         : 'Commentaire speciale',
    phone        : '025495950001',
  };

  it('creates a new supplier', async () => {
    await FU.buttons.create();
    await components.inpuText.set('display_name', supplier.display_name);

    await element(by.model('ModalCtrl.supplier.international')).click();

    // select an Creditor
    await FU.select('ModalCtrl.supplier.creditor_group_uuid', 'Regideso');

    await components.inpuText.set('phone', supplier.phone);
    await components.inpuText.set('email', supplier.email);
    await components.inpuText.set('address_1', supplier.address_1);
    await components.inpuText.set('address_2', supplier.address_2);
    await components.inpuText.set('fax', supplier.fax);
    await FU.input('ModalCtrl.supplier.note', supplier.note);

    // submit the page to the server
    await FU.buttons.submit();
    await components.notification.hasSuccess();
  });


  it('edits a supplier', async () => {
    await editSupplier(supplier.display_name);

    // modify the supplier display_name
    await components.inpuText.set('display_name', 'Updated');

    // modify the supplier note
    await FU.input('ModalCtrl.supplier.note', ' IMCK Tshikaji update for the test E2E');
    await components.inpuText.set('address_1', supplier.address_1);

    await FU.buttons.submit();
    await components.notification.hasSuccess();
  });

  it('blocks invalid form submission with relevant error classes', async () => {
    await FU.buttons.create();

    // verify form has not been submitted
    await FU.buttons.submit();
    expect(await helpers.getCurrentPath()).to.equal(path);

    // the following fields should be required
    await components.inpuText.validationError('display_name');
    await FU.validation.error('ModalCtrl.supplier.creditor_group_uuid');
    await components.inpuText.validationError('address_1');

    // the following fields are not required
    await components.inpuText.validationError('phone');
    await components.inpuText.validationError('email');

    // optional
    await components.inpuText.validationOk('address_2');
    await components.inpuText.validationOk('fax');
    await FU.validation.ok('ModalCtrl.supplier.note');
    await FU.buttons.cancel();
    await components.notification.hasDanger();
  });

  async function openDropdownMenu(label) {
    const row = new GridRow(label);
    await row.dropdown().click();
    return row;
  }

  async function editSupplier(name) {
    const row = await openDropdownMenu(name);
    await row.edit().click();
  }
});
