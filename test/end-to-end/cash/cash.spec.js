/* global browser, element, by */
const { expect } = require('chai');

// import testing utilities
const helpers = require('../shared/helpers');

const components = require('../shared/components');
const GU = require('../shared/GridUtils.js');
const FU = require('../shared/FormUtils');

describe('Cash Payments', () => {
  const path = '/cash';

  const cashboxB = {
    id   : 2,
    text : 'Test Aux Cashbox A',
  };

  const cashboxC = {
    id   : 3,
    text : 'Test Aux Cashbox B',
  };

  // this is a shortcut function for clicking an action in the cash page
  async function selectDropdownAction(action) {
    // open the dropdown menu
    await $('[data-action="open-tools"]').click();

    // get the action and click it
    await $(`[data-action="${action}"]`).click();
  }

  describe('Cashbox Select Interface', () => {
    it('navigating to /cash/:unknown should send a notification error ', async () => {
      // navigate to an invalid cashbox
      await helpers.navigate(`${path}/unknown`);

      // expect the 'cashbox selection' modal to appear
      await FU.exists(by.css('[data-cashbox-modal]'), true);

      // select a cashbox
      await element(by.id('cashbox-2')).click();
      await element(by.css('[data-cashbox-modal-submit]')).click();

      // expect the 'cashbox selection' modal to disappear
      await FU.exists(by.css('[data-cashbox-modal]'), false);
    });

    it('navigating directly to /cash should be re-routed to selected cashbox after a selection is made', async () => {
      // our target is cashbox B
      const target = `#!${path}/${cashboxB.id}`;

      // implicitly choose cashbox B by navigating to it directly
      await browser.get(target);

      expect(await helpers.getCurrentPath()).to.equal(target);

      await browser.get(`#!${path}`);

      // the cashbox selection modal should not appear
      await FU.exists(by.css('[data-cashbox-modal]'), false);

      // the url should be the original target
      expect(await helpers.getCurrentPath()).to.equal(target);
    });

    it('should allow a user to select and deselect a cashbox', async () => {
      // the auxiliary cashbox is the target
      const targetAuxiliary1 = `#!${path}/${cashboxC.id}`;

      await helpers.navigate(targetAuxiliary1);

      // verify that we get to the cashboxC page
      expect(await helpers.getCurrentPath()).to.equal(targetAuxiliary1);

      // the auxiliary cashbox is the target
      const targetAuxiliary2 = `#!${path}/${cashboxB.id}`;

      // use the button to navigate back to the cashbox select module
      await selectDropdownAction('change-cashbox');

      // select the auxiliary cashbox B displayed
      await element(by.id(`cashbox-${cashboxB.id}`)).click();

      // click on the ok button of the modal box
      await element(by.css('[data-cashbox-modal-submit]')).click();

      // verify that we get to the cashboxB page
      expect(await helpers.getCurrentPath()).to.equal(targetAuxiliary2);
    });
  });

  /* tests for the cash payments form page */
  describe('Cash Payments Form Page', () => {
    beforeEach(() => helpers.navigate(path));

    // this code assumes that the find-patient directive is well tested.
    // we should be able to use a patient ID without thinking about the potential
    // failures

    // This caution payment should succeed
    const mockCautionPayment = {
      patientName : 'Test 2',
      amount      : 150,
    };

    // This payment against patient invoices should succeed
    const mockInvoicesPayment = {
      patientId : '2', // we are using PA.TPA.X at patient invoice already
      date      : new Date('2016-03-01'),
      amount    : 5.12,
    };

    it('should make a caution payment', async () => {
      // select the proper patient
      await components.findPatient.findByName(mockCautionPayment.patientName);

      // we will leave the date input as default

      // select the proper is caution type
      const cautionOption = element(by.css('[data-caution-option="1"]'));
      await cautionOption.click();

      // select the FC currency from the currency select
      await components.currencySelect.set(1);

      // enter the amount to pay for a caution
      await components.currencyInput.set(mockCautionPayment.amount);

      // click the submit button
      await FU.buttons.submit();

      // expect the receipt modal to appear
      await FU.exists(by.id('receipt-confirm-created'), true);

      // dismiss the modal
      await $('[data-action="close"]').click();
    });

    it('should block invoice payments without invoices', async () => {
      // select the proper patient
      await components.findPatient.findByName(mockCautionPayment.patientName);

      // we will leave the date input as default

      // select the proper is caution type
      const cautionOption = element(by.css('[data-caution-option="0"]'));
      await cautionOption.click();

      // select the FC currency from the currency select
      await components.currencySelect.set(1);

      // enter the amount to pay for a caution
      await components.currencyInput.set(mockCautionPayment.amount);

      // click the submit button
      await FU.buttons.submit();

      // expect a danger notification
      await components.notification.hasDanger();

      await $('[data-method="clear"]').click();
    });

    it('should make a payment against previous invoices', async () => {
      const gridId = 'debtorInvoicesGrid';

      // select the proper patient
      await components.findPatient.findById(mockInvoicesPayment.patientId);

      // select the proper date
      await components.dateEditor.set(mockInvoicesPayment.date);

      // select the "invoices payment" option type
      const cautionOption = element(by.css('[data-caution-option="0"]'));
      await cautionOption.click();

      // open the invoices modal to select constious invoices
      await FU.exists(by.css('[data-open-invoices-btn]'), true);
      await element(by.css('[data-open-invoices-btn]')).click();

      // be sure that the modal opened
      await FU.exists(by.css('[data-debtor-invoice-modal]'), true);

      // inside the modal, we want to select the first row to pay against
      await GU.selectRow(gridId, 2);

      // submit the modal
      await FU.modal.submit();

      // select the USD currency from the currency radio buttons
      await components.currencySelect.set(2);

      // enter the amount to pay for an invoice
      await components.currencyInput.set(mockInvoicesPayment.amount);

      // click the submit button
      await FU.buttons.submit();

      // expect the receipt modal to appear
      await FU.exists(by.id('receipt-confirm-created'), true);

      // dismiss the modal
      await $('[data-action="close"]').click();
    });
  });

  describe('Cash Transfer ', CashTransfer);

  describe('Credit Notes', CreditNoteTests);
});


function CashTransfer() {
  const path = '#/cash';

  // navigate to the page before tests
  before(() => helpers.navigate(path));

  // this transfer should succeed
  const mockTransfer = { amount : 100 };

  it('should make a transfer between accounts', async () => {
    // open the dropdown menu
    await $('[data-action="open-tools"]').click();

    // get the transfer button and click it
    await $('[data-action="transfer"]').click();

    // choose CDF as transfer currency
    await components.currencySelect.set(2, 'transfer-currency-select');

    // set a value in the currency component by model to avoid conflict
    await components.currencyInput.set(mockTransfer.amount, 'transfer-currency-input');

    // submit the modal button
    await FU.modal.submit();

    // expect the receipt modal to appear
    await FU.exists(by.id('receipt-confirm-created'), true);

    // dismiss the modal
    await $('[data-action="close"]').click();
  });
}

const SearchModal = require('../shared/search.page');
const GridRow = require('../shared/GridRow');

function CreditNoteTests() {
  before(() => helpers.navigate('#!/payments'));

  it('cancels a payment with a credit note', async () => {
    const row = new GridRow('CP.TPA.3');
    await row.dropdown().click();
    await row.reverse().click();

    await FU.input('ModalCtrl.cancelCash.description', 'Cancel This Payment');
    await FU.modal.submit();
    await components.notification.hasSuccess();
  });

  it('deletes a cash payment from the database', async () => {
    await SearchModal.open();
    const modal = new SearchModal('cash-payment-search');
    await modal.switchToDefaultFilterTab();
    await modal.setPeriod('allTime');
    await modal.setLimit(1000);
    await modal.submit();

    const row = new GridRow('CP.TPA.4');
    await row.dropdown().click();
    await row.remove().click();

    // accept the confirm modal
    await FU.modal.submit();

    await components.notification.hasSuccess();
  });
}
