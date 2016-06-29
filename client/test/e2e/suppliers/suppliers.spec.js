/* global element, by, browser */
const chai = require('chai');
const expect = chai.expect;

const FU = require('../shared/FormUtils');
const helpers = require('../shared/helpers');
helpers.configure(chai);

describe('Suppliers', function () {
  'use strict';

  const path = '#/suppliers';
  before(() => helpers.navigate(path));

  const supplier = {
    name : 'Alpha Lmtd',
    address_1 : '45 Street Blvd',
    address_2 : '30 june Blvd',
    email : 'info@alpha.cd',
    fax : '12-34-294-10',
    note : 'Commentaire speciale',
    phone : '025495950001'
  };

  const supplierRank = 1;

  it('creates a new supplier', function () {
    FU.buttons.create();

    FU.input('SupplierCtrl.supplier.name', supplier.name);

    element(by.id('international')).click();

    // select an Creditor
    FU.select('SupplierCtrl.supplier.creditor_uuid', 'Fournisseur');

    FU.input('SupplierCtrl.supplier.phone', supplier.phone);
    FU.input('SupplierCtrl.supplier.email', supplier.email);
    FU.input('SupplierCtrl.supplier.address_1', supplier.address_1);
    FU.input('SupplierCtrl.supplier.address_2', supplier.address_2);
    FU.input('SupplierCtrl.supplier.fax', supplier.fax);
    FU.input('SupplierCtrl.supplier.note', supplier.note);

    // submit the page to the server
    FU.buttons.submit();
    FU.exists(by.id('create_success'), true);
  });

  it('edits an supplier', function () {
    element(by.id('supplier-upd-' + supplierRank )).click();

    // modify the supplier name
    FU.input('SupplierCtrl.supplier.name', 'Updated');

    // modify the supplier note
    FU.input('SupplierCtrl.supplier.note', ' IMCK Tshikaji update for the test E2E');
    FU.input('SupplierCtrl.supplier.address_1', supplier.address_1);

    FU.buttons.submit();
    FU.exists(by.id('update_success'), true);
  });

  it('blocks invalid form submission with relevant error classes', function () {
    FU.buttons.create();

    // verify form has not been submitted
    expect(helpers.getCurrentPath()).to.eventually.equal(path);
    element(by.id('submit-supplier')).click();

    // the following fields should be required
    FU.validation.error('SupplierCtrl.supplier.name');
    FU.validation.error('SupplierCtrl.supplier.creditor_uuid');
    FU.validation.error('SupplierCtrl.supplier.address_1');

    // the following fields are not required
    FU.validation.ok('SupplierCtrl.supplier.international');
    FU.validation.ok('SupplierCtrl.supplier.phone');
    FU.validation.ok('SupplierCtrl.supplier.email');
    FU.validation.ok('SupplierCtrl.supplier.locked');
    FU.validation.ok('SupplierCtrl.supplier.address_2');
    FU.validation.ok('SupplierCtrl.supplier.fax');
    FU.validation.ok('SupplierCtrl.supplier.note');
  });
});
