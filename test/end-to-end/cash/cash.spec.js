/* global browser, element, by */
const { expect } = require('chai');

// import testing utilities
const helpers = require('../shared/helpers');

const components = require('../shared/components');
const GU = require('../shared/gridTestUtils.spec.js');
const FU = require('../shared/FormUtils');

/** loading User pages **/
const UserPage = require('../user/user.page.js');

describe('Cash Payments', () => {
  const path = '/cash';
  const userPage = new UserPage();

  const cashboxB = {
    id   : 2,
    text : 'Test Aux Cashbox A',
  };

  const cashboxC = {
    id   : 3,
    text : 'Test Aux Cashbox B',
  };

  // this is a shortcut function for clicking an action in the cash page
  function selectDropdownAction(action) {
    // open the dropdown menu
    $('[data-action="open-tools"]').click();

    // get the action and click it
    $(`[data-action="${action}"]`).click();
  }

  describe('Cashbox Select Interface', () => {
    it('navigating to /cash/:unknown should send a notification error ', () => {
      // navigate to an invalid cashbox
      helpers.navigate(`${path}/unknown`);

      // expect the 'cashbox selection' modal to appear
      FU.exists(by.css('[data-cashbox-modal]'), true);

      // select a cashbox
      element(by.id('cashbox-2')).click();
      element(by.css('[data-cashbox-modal-submit]')).click();

      // expect the 'cashbox selection' modal to disappear
      FU.exists(by.css('[data-cashbox-modal]'), false);
    });

    it('navigating directly to /cash should be re-routed to selected cashbox after a selection is made', () => {
      // our target is cashbox B
      const target = `#!${path}/${cashboxB.id}`;

      // implicitly choose cashbox B by navigating to it directly
      browser.get(target);

      expect(helpers.getCurrentPath()).to.eventually.equal(target);

      browser.get(`#!${path}`);

      // the cashbox selection modal should not appear
      FU.exists(by.css('[data-cashbox-modal]'), false);

      // the url should be the original target
      expect(helpers.getCurrentPath()).to.eventually.equal(target);
    });

    it('should allow a user to select and deselect a cashbox', () => {
      // the auxiliary cashbox is the target
      const targetAuxiliary1 = `#!${path}/${cashboxC.id}`;

      helpers.navigate(targetAuxiliary1);

      // verify that we get to the cashboxC page
      expect(helpers.getCurrentPath()).to.eventually.equal(targetAuxiliary1);

      // the auxiliary cashbox is the target
      const targetAuxiliary2 = `#!${path}/${cashboxB.id}`;

      // use the button to navigate back to the cashbox select module
      selectDropdownAction('change-cashbox');

      // select the auxiliary cashbox B displayed
      element(by.id(`cashbox-${cashboxB.id}`)).click();

      // click on the ok button of the modal box
      element(by.css('[data-cashbox-modal-submit]')).click();

      // verify that we get to the cashboxB page
      expect(helpers.getCurrentPath()).to.eventually.equal(targetAuxiliary2);
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

    it('should make a caution payment', () => {
      // select the proper patient
      components.findPatient.findByName(mockCautionPayment.patientName);

      // we will leave the date input as default

      // select the proper is caution type
      const cautionOption = element(by.css('[data-caution-option="1"]'));
      cautionOption.click();

      // select the FC currency from the currency select
      components.currencySelect.set(1);

      // enter the amount to pay for a caution
      components.currencyInput.set(mockCautionPayment.amount);

      // click the submit button
      FU.buttons.submit();

      // expect the receipt modal to appear
      FU.exists(by.id('receipt-confirm-created'), true);

      // dismiss the modal
      $('[data-action="close"]').click();
    });

    it('should block invoice payments without invoices', () => {
      // select the proper patient
      components.findPatient.findByName(mockCautionPayment.patientName);

      // we will leave the date input as default

      // select the proper is caution type
      const cautionOption = element(by.css('[data-caution-option="0"]'));
      cautionOption.click();

      // select the FC currency from the currency select
      components.currencySelect.set(1);

      // enter the amount to pay for a caution
      components.currencyInput.set(mockCautionPayment.amount);

      // click the submit button
      FU.buttons.submit();

      // expect a danger notification
      components.notification.hasDanger();

      $('[data-method="clear"]').click();
    });

    it('should make a payment against previous invoices', () => {
      // @fixme - why is this better?
      browser.refresh();

      const gridId = 'debtorInvoicesGrid';

      // select the proper patient
      components.findPatient.findById(mockInvoicesPayment.patientId);

      // select the proper date
      components.dateEditor.set(mockInvoicesPayment.date);

      // select the "invoices payment" option type
      const cautionOption = element(by.css('[data-caution-option="0"]'));
      cautionOption.click();

      // open the invoices modal to select constious invoices
      FU.exists(by.css('[data-open-invoices-btn]'), true);
      element(by.css('[data-open-invoices-btn]')).click();

      // be sure that the modal opened
      FU.exists(by.css('[data-debtor-invoice-modal]'), true);

      // inside the modal, we want to select the first row to pay against
      GU.selectRow(gridId, 0);

      // submit the modal
      FU.modal.submit();

      // select the USD currency from the currency radio buttons
      components.currencySelect.set(2);

      // enter the amount to pay for an invoice
      components.currencyInput.set(mockInvoicesPayment.amount);

      // click the submit button
      FU.buttons.submit();

      // expect the receipt modal to appear
      FU.exists(by.id('receipt-confirm-created'), true);

      // dismiss the modal
      $('[data-action="close"]').click();
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

  it('should make a transfer between accounts', () => {
    // open the dropdown menu
    $('[data-action="open-tools"]').click();

    // get the transfer button and click it
    $('[data-action="transfer"]').click();

    // choose CDF as transfer currency
    components.currencySelect.set(2, 'transfer-currency-select');

    // set a value in the currency component by model to avoid conflict
    components.currencyInput.set(mockTransfer.amount, 'transfer-currency-input');

    // submit the modal button
    FU.modal.submit();

    // expect the receipt modal to appear
    FU.exists(by.id('receipt-confirm-created'), true);

    // dismiss the modal
    $('[data-action="close"]').click();

    // make sure we have a success notification shown
    components.notification.hasSuccess();
  });
}

const SearchModal = require('../shared/search.page');
const GridRow = require('../shared/GridRow');

function CreditNoteTests() {
  before(() => helpers.navigate('#/payments'));

  it('cancels a payment with a credit note', () => {
    const row = new GridRow('CP.TPA.3');
    row.dropdown().click();
    row.reverse().click();

    FU.input('ModalCtrl.cancelCash.description', 'Cancel This Payment');
    FU.modal.submit();
    components.notification.hasSuccess();
  });

  it('deletes a cash payment from the database', () => {
    SearchModal.open();
    const modal = new SearchModal('cash-payment-search');
    modal.switchToDefaultFilterTab();
    modal.setPeriod('allTime');
    modal.setLimit(1000);
    modal.submit();

    const row = new GridRow('CP.TPA.4');
    row.dropdown().click();
    row.remove().click();

    // accept the confirm modal
    FU.modal.submit();

    components.notification.hasSuccess();
  });
}
