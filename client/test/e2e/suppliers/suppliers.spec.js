/* jshint expr:true */
/* global element, by, beforeEach, inject, browser */

var chai = require('chai');
var expect = chai.expect;

var FU = require('../shared/FormUtils');
var helpers = require('../shared/helpers');
var components = require('../shared/components');

helpers.configure(chai);

describe('Suppliers Module', function () {
  'use strict';

  var path = '#/creditors';

  var supplier = {
    name : 'Alpha Lmtd',
    address_1 : '45 Street Blvd',
    address_2 : '30 june Blvd',
    email : 'info@alpha.cd',
    fax : '12-34-294-10',
    note : 'Commentaire speciale',
    phone : '025495950001'  
  };

  var supplierRank = 1;

  // navigate to the Supplier module before each test
  beforeEach(function () {
    browser.get(path);
  });

  it('successfully creates a new Supplier', function () {

    // swtich to the create form
    FU.buttons.create();
    FU.input('SupplierCtrl.supplier.name', supplier.name);

    element(by.id('international')).click();

    // select an Creditor
    FU.select('SupplierCtrl.supplier.creditor_uuid')
      .enabled()
      .first()
      .click(); 

    FU.input('SupplierCtrl.supplier.phone', supplier.phone);

    FU.input('SupplierCtrl.supplier.email', supplier.email);

    FU.input('SupplierCtrl.supplier.address_1', supplier.address_1);

    FU.input('SupplierCtrl.supplier.address_2', supplier.address_2);

    FU.input('SupplierCtrl.supplier.fax', supplier.fax);

    FU.input('SupplierCtrl.supplier.note', supplier.note);    
  
    // submit the page to the server
    FU.buttons.submit();

    // expect a nice validation message
    FU.exists(by.id('create_success'), true);
  });


  it('successfully edits an supplier', function () {
    element(by.id('supplier-upd-' + supplierRank )).click();
    
    // modify the supplier name
    FU.input('SupplierCtrl.supplier.name', 'Updated');
    
    // modify the supplier note
    FU.input('SupplierCtrl.supplier.note', ' IMCK Tshikaji update for the test E2E');

    FU.buttons.submit();

    // make sure the success message appears
    FU.exists(by.id('update_success'), true);
  });

  it('correctly blocks invalid form submission with relevant error classes', function () {
    // switch to the create form
    FU.buttons.create();

    // Verify form has not been successfully submitted
    expect(browser.getCurrentUrl()).to.eventually.equal(browser.baseUrl + path);
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
