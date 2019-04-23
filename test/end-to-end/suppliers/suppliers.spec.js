/* global element, by, browser */
const chai = require('chai');
const FU = require('../shared/FormUtils');
const helpers = require('../shared/helpers');
const components = require('../shared/components');
const GridRow = require('../shared/GridRow');

const expect = chai.expect;
helpers.configure(chai);


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

  it('creates a new supplier', () => {
    FU.buttons.create();

    components.inpuText.set('display_name', supplier.display_name);

    element(by.model('ModalCtrl.supplier.international')).click();

    // select an Creditor
    FU.select('ModalCtrl.supplier.creditor_group_uuid', 'Regideso');

    components.inpuText.set('phone', supplier.phone);
    components.inpuText.set('email', supplier.email);
    components.inpuText.set('address_1', supplier.address_1);
    components.inpuText.set('address_2', supplier.address_2);
    components.inpuText.set('fax', supplier.fax);
    FU.input('ModalCtrl.supplier.note', supplier.note);

    // submit the page to the server
    FU.buttons.submit();
    components.notification.hasSuccess();
  });


  it('edits a supplier', () => {
    editSupplier(supplier.display_name);

    // modify the supplier display_name
    components.inpuText.set('display_name', 'Updated');

    // modify the supplier note
    FU.input('ModalCtrl.supplier.note', ' IMCK Tshikaji update for the test E2E');
    components.inpuText.set('address_1', supplier.address_1);

    FU.buttons.submit();
    components.notification.hasSuccess();
  });

  it('blocks invalid form submission with relevant error classes', () => {
    FU.buttons.create();

    // verify form has not been submitted
    FU.buttons.submit();
    expect(helpers.getCurrentPath()).to.eventually.equal(path);

    // the following fields should be required
    components.inpuText.validationError('display_name');
    FU.validation.error('ModalCtrl.supplier.creditor_group_uuid');
    components.inpuText.validationError('address_1');

    // the following fields are not required
    components.inpuText.validationError('phone');
    components.inpuText.validationError('email');

    // optional
    components.inpuText.validationOk('address_2');
    components.inpuText.validationOk('fax');
    FU.validation.ok('ModalCtrl.supplier.note');
    FU.buttons.cancel();
    components.notification.hasDanger();

  });

  function openDropdownMenu(label) {
    const row = new GridRow(label);
    row.dropdown().click();
    return row;
  }

  function editSupplier(name) {
    const row = openDropdownMenu(name);
    row.edit().click();
  }

});
