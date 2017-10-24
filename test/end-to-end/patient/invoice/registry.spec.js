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
    page.openReceipt('IV.TPA.2');
    FU.exists(by.css('[data-modal="receipt"]'), true);
    FU.modal.close();
  });

  it('can be reversed via a credit note', () => {
    page.reverse('IV.TPA.1');
    FU.input('ModalCtrl.creditNote.description', 'Credit Note Error');
    FU.modal.submit();
    components.notification.hasSuccess();
  });

  it('shows the receipt for the credit note', () => {
    page.openCreditNoteReceipt('IV.TPA.1');
    FU.modal.close();
  });

  it('deletes an invoice', () => {
    page.remove('IV.TPA.3');

    // accept the confirm modal
    FU.modal.submit();

    components.notification.hasSuccess();
  });
});
