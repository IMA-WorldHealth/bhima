/* global browser, element, by */
const chai = require('chai');
const expect = chai.expect;

// import testing utilities
const helpers = require('../shared/helpers');
helpers.configure(chai);

const components = require('../shared/components');
const GU = require('../shared/gridTestUtils.spec.js');
const FU = require('../shared/FormUtils');

describe('Cash Payments Module', function () {

  const path = '#/cash';

  const cashboxB = {
    id: 2,
    text : 'Test Aux Cashbox A'
  };

  const cashboxC = {
    id: 3,
    text : 'Test Aux Cashbox B'
  };

  describe('Cashbox Select Interface', function () {

    it('navigating to /cash/:unknown should send a notification error ', function () {

      // navigate to an invalid cashbox
      helpers.navigate(path.concat('/unknown'));

      // expect the 'cashbox selection' modal to appear
      FU.exists(by.css('[data-cashbox-modal]'), true);

      // select a cashbox
      element(by.id('cashbox-3')).click();
      element(by.css('[data-cashbox-modal-submit]')).click();

      // expect the 'cashbox selection' modal to disappear
      FU.exists(by.css('[data-cashbox-modal]'), false);
    });

    it('navigating directly to /cash should be re-routed to selected cashbox after a selection is made', function () {

      // our target is cashbox B
      var target = path.concat('/' + cashboxB.id);

      // implicitly choose cashbox B by navigating to it directly
      browser.get(target);

      expect(helpers.getCurrentPath()).to.eventually.equal(target);

      browser.get(path);

      // the cashbox selection modal should not appear
      FU.exists(by.css('[data-cashbox-modal]'), false);

      // the url should be the original target
      expect(helpers.getCurrentPath()).to.eventually.equal(target);
    });

    it('should allow a user to select and deselect a cashbox', function () {

      // the auxiliary cashbox is the target
      var targetAuxiliary1 = path.concat('/' + cashboxC.id);

      helpers.navigate(targetAuxiliary1);

      // verify that we get to the cashboxC page
      expect(helpers.getCurrentPath()).to.eventually.equal(targetAuxiliary1);

      // the auxiliary cashbox is the target
      var targetAuxiliary2 = path.concat('/' + cashboxB.id);

      // use the button to navigate back to the cashbox select module
      element(by.css('[data-change-cashbox]')).click();

      // select the auxiliary cashbox B displayed
      element(by.id('cashbox-' + cashboxB.id)).click();

      // click on the ok button of the modal box
      element(by.css('[data-cashbox-modal-submit]')).click();

      // verify that we get to the cashboxB page
      expect(helpers.getCurrentPath()).to.eventually.equal(targetAuxiliary2);
    });
  });

  /* tests for the cash payments form page */
  describe('Cash Payments Form Page', function () {

    /* navigate to the page before each function */
    beforeEach(function () {
      helpers.navigate(path);
    });

    // this code assumes that the find-patient directive is well tested.
    // we should be able to use a patient ID without thinking about the potential
    // failures

    // This caution payment should succeed
    var mockCautionPayment = {
      patientName: 'Test 2',
      amount : 150
    };

    // This payment against patient invoices should succeed
    var mockInvoicesPayment = {
      patientId: 'TPA1',
      date : new Date('2016-03-01'),
      amount : 5.12
    };

    it('should make a caution payment', function () {

      // select the proper patient
      components.findPatient.findByName(mockCautionPayment.patientName);

      // we will leave the date input as default

      // select the proper is caution type
      var cautionOption = element(by.css('[data-caution-option="1"]'));
      cautionOption.click();

      // select the FC currency from the currency select
      components.currencySelect.set(1);

      // enter the amount to pay for a caution
      components.currencyInput.set(mockCautionPayment.amount, null);

      // click the submit button
      FU.buttons.submit();

      // expect the receipt modal to appear
      FU.exists(by.css('[data-cash-receipt-modal]'), true);

      // dismiss the modal
      element(by.css('[data-modal-action="dismiss"]')).click();
    });

    /** @todo - once invoice posting is figured out, this test should be uncommented and work */
    /*
    it.skip('should make a payment against previous invoices', function () {
      var gridId = 'debtorInvoicesGrid';

      // select the proper patient
      components.findPatient.findById(mockInvoicesPayment.patientId);

      // select the proper date
      components.dateEditor.set(mockInvoicesPayment.date);

      // select the "invoices payment" option type
      var cautionOption = element(by.css('[data-caution-option="0"]'));
      cautionOption.click();

      // open the invoices modal to select various invoices
      FU.exists(by.css('[data-open-invoices-btn]'), true);
      element(by.css('[data-open-invoices-btn]')).click();

      // be sure that the modal opened
      FU.exists(by.css('[data-debtor-invoices-modal]'), true);

      // inside the modal, we want to select the first row to pay against
      var row = GU.selectRow(gridId, 0);

      // submit the modal
      var modalSubmit =  element(by.css('[data-debtor-invoices-modal-submit]'));
      modalSubmit.click();

      // select the USD currency from the currency radio buttons
      components.currencySelect.set(2);

      // enter the amount to pay for an invoice
      components.currencyInput.set(mockInvoicesPayment.amount, null);

      // click the submit button
      FU.buttons.submit();

      // expect the receipt modal to appear
      FU.exists(by.css('[data-cash-receipt-modal]'), true);

      // dismiss the modal
      element(by.css('[data-modal-action="dismiss"]')).click();
    });
  */
  });

  describe('Cash Transfer ', CashTransfer);
});


function CashTransfer() {
  'use strict';

  const path = '#/cash';

  // navigate to the page before tests
  before(() => helpers.navigate(path));

  // this transfer should succeed
  const mockTransfer = { amount : 100 };

  it('should make a transfer between accounts', () => {

    // click the transfer button
    const transferBtn = element(by.css('[data-perform-transfer]'));
    transferBtn.click();

    // choose CDF as transfer currency
    components.currencySelect.set(1, 'transfer-currency-select');

    //set a value in the currency component by model to avoid conflict
    components.currencyInput.set(mockTransfer.amount, 'transfer-currency-input');

    // submit the modal button
    FU.modal.submit();

    // make sure we have a success notification shown
    components.notification.hasSuccess();
  });
}
