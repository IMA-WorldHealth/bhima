/* global by */

const helpers = require('../../shared/helpers');
const components = require('../../shared/components');

const FU = require('../../shared/FormUtils');
const InvoiceRegistryPage = require('./registry.page.js');
const Search = require('./registry.search.js');

describe('Invoice Registry', () => {
  const path = '#/invoices';
  const page = new InvoiceRegistryPage();

  before(() => helpers.navigate(path));

  describe('Search', Search);

  it('shows the proof of the invoice correctly', () => {
    page.clickOnMethod(0, 'invoiceReceipt');
    FU.exists(by.css('[data-modal="receipt"]'), true);
    FU.modal.close();
  });

  it('Credit Note for reverse any transaction in the posting_journal', () => {
    page.clickOnMethod(0, 'createCreditNote');
    FU.input('ModalCtrl.creditNote.description', 'Credit Note Error');
    FU.modal.submit();
    components.notification.hasSuccess();
  });

  it('shows the proof of the credit note correctly', () => {
    page.clickOnMethod(0, 'creditNoteReceipt');
    FU.modal.close();
  });
});
