/* jshint expr:true */
/* global element, by, browser */
const chai = require('chai');
const expect = chai.expect;

const helpers = require('../../shared/helpers');
const components  = require('../../shared/components');
helpers.configure(chai);

const FU = require('../../shared/FormUtils');
const InvoiceRegistryPage = require('./registry.page.js');
const Search = require('./registry.search.js');

describe('Invoice Registry', () => {
  'use strict';

  const path = '#/invoices';

  // This will be run before every single test ('it') - navigating the browser to the correct page.
  before(() => helpers.navigate(path));

  const page = new InvoiceRegistryPage();
  const numInvoices = 4;

  it('displays all invoices loaded from the database', () => {
    expect(page.getInvoiceNumber()).to.eventually.equal(numInvoices);
  });

  it('shows the proof of the invoice correctly', () => {
    page.showInvoiceProof(0);
    FU.exists(by.css('[data-modal="receipt"]'), true);
    FU.modal.close();
  });

  describe('Searching', Search);

  it('Credit Note for reverse any transaction in the posting_journal', () => {
    element(by.id('TPA1')).click();
    FU.input('ModalCtrl.creditNote.description', 'Credit Note Error');
    FU.modal.submit();
    components.notification.hasSuccess();
  });
});
