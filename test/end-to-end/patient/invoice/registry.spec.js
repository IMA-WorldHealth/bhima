/* global by */

const helpers = require('../../shared/helpers');
const components = require('../../shared/components');

const FU = require('../../shared/FormUtils');
const InvoiceRegistryPage = require('./registry.page.js');
const Search = require('./registry.search.js');

describe('Invoice Registry', () => {
  const path = '#/invoices';
  const page = new InvoiceRegistryPage();

  const toCreditNote = 'IV.TPA.5';

  before(() => helpers.navigate(path));

  describe('Search', Search);

  it('shows the proof of the invoice correctly', async () => {
    await page.openReceipt('IV.TPA.2');
    await FU.exists(by.css('[data-modal="receipt"]'), true);
    await FU.modal.close();
  });

  it(`can reverse invoice ${toCreditNote} via a credit note`, async () => {
    await page.reverse(toCreditNote);
    await FU.input('ModalCtrl.creditNote.description', 'Credit Note Error');
    await FU.modal.submit();
    await components.notification.hasSuccess();
  });

  it(`shows the receipt for the credit note on invoice ${toCreditNote}`, async () => {
    await page.openCreditNoteReceipt(toCreditNote);
    await FU.modal.close();
  });

  it('deletes an invoice', async () => {
    await page.remove('IV.TPA.3');

    // accept the confirm modal
    await FU.modal.submit();

    await components.notification.hasSuccess();
  });
});
