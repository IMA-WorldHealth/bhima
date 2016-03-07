/* global browser, element, by, protractor */
const chai = require('chai');
const expect = chai.expect;

// import testing utilities
const helpers = require('../shared/helpers');
helpers.configure(chai);

const components = require('../shared/components');
const GU = require('../shared/gridTestUtils.spec.js');
const EC = protractor.ExpectedConditions;
const FU = require('../shared/FormUtils');

describe('Cash Payments Module', function () {

  const path = '#/cash';

  const cashboxA = {
    id: 1,
    text : 'Test Primary Cashbox A'
  };

  const cashboxB = {
    id: 2,
    text : 'Test Aux Cashbox A'
  };

  const cashboxC = {
    id: 3,
    text : 'Test Aux Cashbox B'
  };

  describe('Cashbox Select Interface', function () {

    it('navigating to /cash/:unknownId should reroute to /cash', function () {

      // navigate to the
      browser.get(path.concat('/unknownId'));

      // the page should be rerouted to the '/cash' page.
      expect(helpers.getCurrentPath()).to.eventually.equal(path);
    });

    it('navigating to a known cashbox should not be re-routed', function () {

      // our target is cashboxA
      var target = path.concat('/' + cashboxA.id);

      // simply going to the page should set the cashbox ID in localstorage
      browser.get(target);

      // confirm that we actually go to the page
      expect(helpers.getCurrentPath()).to.eventually.equal(target);
    });

    it('navigating directly to /cash should be re-routed to selected cashbox after a selection is made', function () {

      // our target is cashboxA
      var target = path.concat('/' + cashboxA.id);

      // implicitly choose cashbox A by navigating to it directly
      browser.get(target);

      expect(helpers.getCurrentPath()).to.eventually.equal(target);

      // attempt to return to /cash manually
      browser.get(path);

      // expect that we were routed back to cashbox A
      expect(helpers.getCurrentPath()).to.eventually.equal(path);
    });

    it('navigating to /cash after a selection is made should re-route to /cash', function () {

      // our target is cashboxB
      var target = path.concat('/' + cashboxB.id);

      // emulate a selection by simply going to the direct URL
      // this should set the cashbox ID in localstorage
      browser.get(target);

      // confirm that we actually go to the page
      expect(helpers.getCurrentPath()).to.eventually.equal(target);

      // attempt to return to the cash page manually
      browser.get(path);

      // the browser should be rerouted to the cashboxB page
      expect(helpers.getCurrentPath()).to.eventually.equal(path);
    });

    it('should allow a user to select and deselect a cashbox', function () {
      // the auxiliary cashbox is the target
      var targetAuxiliary1 = path.concat('/' + cashboxC.id);
      // navigate to a page that display the select cashbox modal
      browser.get(path.concat('/unknownId'));
      // select the auxiliary cashbox C displayed
      var cbxItem = element(by.id('cashbox_' + cashboxC.id));
      cbxItem.click();
      // click on the ok button of the modal box
      var okButton = element(by.css('[data-cashbox-modal-submit]'));
      okButton.click()
      // verify that we get to the cashboxB page
      expect(helpers.getCurrentPath()).to.eventually.equal(targetAuxiliary1);

      // the auxiliary cashbox is the target
      var targetAuxiliary2 = path.concat('/' + cashboxB.id);
      // use the button to navigate back to the cashbox select module
      element(by.css('[data-change-cashbox]')).click();
      // select the auxiliary cashbox B displayed
      var cbxItem = element(by.id('cashbox_' + cashboxB.id));
      cbxItem.click();
      // click on the ok button of the modal box
      var okButton = element(by.css('[data-cashbox-modal-submit]'));
      okButton.click()
      // verify that we get to the cashboxB page
      expect(helpers.getCurrentPath()).to.eventually.equal(targetAuxiliary2);

    });

  });

  /** tests for the cash payments form page */
  describe('Cash Payments Form Page', function () {

    /** navigate to the page before each function */
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
  });

  describe('Cash Transfer ', function (){

    // navigate to the page before tests
    before(() => helpers.navigate(path));

    // This transfer should succeed
    const mockTransfer = {
      amount : 100
    };

    it('should make a transfer between selected auxiliary cash and a transfer account', function (){

      // click the transfer button
      var transferBtn = element(by.css('[data-perform-transfer]'));
      transferBtn.click();

      //choosing CDF as transfer currency
      var CDFRadio = element(by.css('[data-transfer-currency-option="1"]'));
      CDFRadio.click();

      //set a value in the currency component by model to avoid conflict
      components.currencyInput.set(mockTransfer.amount, 'transferCurrencyInput');

      // submit the modal button
      var transferSubmitBtn = element(by.id('submit-transfer'));
      transferSubmitBtn.click();

      FU.exists(by.id('succeed-label'), true);
      element(by.css('[data-modal-action="dismiss"]')).click();
    });
  });

});
