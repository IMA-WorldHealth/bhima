/* global browser, element, by, protractor */

var chai = require('chai');
var expect = chai.expect;

// import testing utiliites
var helpers = require('../shared/helpers');
helpers.configure(chai);

var components = require('../shared/components');
var GU = require('../shared/gridTestUtils.spec.js');
var EC = protractor.ExpectedConditions;
var FU = require('../shared/FormUtils');

describe('Cash Payments Module', function () {

  /** @const */
  var path = '#/cash';

  /** @const cashboxes defined in models/test/data.sql */
  var cashboxA = {
    id: 1,
    text : 'Test Primary Cashbox A',
  };

  var cashboxB = {
    id: 2,
    text : 'Test Primary Cashbox B',
  };

  /**
  * This function is used to extract the path after the URL hash
  */
  function getCurrentPath() {
    return browser.getCurrentUrl()
    .then(function (url) {
      var partial = url.split('#')[1];
      return '#'.concat(partial);
    });
  }

  describe('Cashbox Select Interface', function () {

    it('navigating to /cash/:unknownId should reroute to /cash', function () {

      // navigate to the
      browser.get(path.concat('/unknownId'));

      // the page should be rerouted to the '/cash' page.
      expect(getCurrentPath()).to.eventually.equal(path);
    });

    it('navigating to a known cashbox should not be re-routed', function () {

      // our target is cashboxA
      var target = path.concat('/' + cashboxA.id);

      // simply going to the page should set the cashbox ID in localstorage
      browser.get(target);

      // confirm that we actually go to the page
      expect(getCurrentPath()).to.eventually.equal(target);
    });

    it('navigating directly to /cash should be re-routed to selected cashbox after a selection is made', function () {

      // our target is cashboxA
      var target = path.concat('/' + cashboxA.id);

      // implicitly choose cashbox A by navigating to it directly
      browser.get(target);

      // make sure all $http/$timeout requests clear before moving forward
      browser.waitForAngular();

      expect(getCurrentPath()).to.eventually.equal(target);

      // attempt to return to /cash manually
      browser.get(path);

      // expect that we were routed back to cashbox A
      expect(getCurrentPath()).to.eventually.equal(target);
    });

    it('navigating to /cash after a selection is made should re-route to /cash/:id', function () {

      // our target is cashboxB
      var target = path.concat('/' + cashboxB.id);

      // emulate a selection by simply going to the direct URL
      // this should set the cashbox ID in localstorage
      browser.get(target);

      // make sure all $http/$timeout requests clear before moving forward
      browser.waitForAngular();

      // confirm that we actually go to the page
      expect(getCurrentPath()).to.eventually.equal(target);

      // attempt to return to the cash page manually
      browser.get(path);

      // the browser should be rerouted to the cashboxB page
      expect(getCurrentPath()).to.eventually.equal(target);
    });

    it('should allow a user to select and deselect a cashbox', function () {

      var targetInitial = path.concat('/' + cashboxA.id);
      var targetFinal = path.concat('/' + cashboxB.id);

      // navigate to the cash payements module
      browser.get(targetInitial);
      expect(getCurrentPath()).to.eventually.equal(targetInitial);

      // make sure we are in the correct cashbox
      var hasCashboxAText = EC.textToBePresentInElement($('[data-cashbox-text]'), cashboxA.text);
      browser.wait(hasCashboxAText, 10000);

      // use the button to navigate back to the cashbox select module
      var backBtn = element(by.css('[data-change-cashbox]'));
      backBtn.click();

      browser.waitForAngular();

      // ensure we get back to the cashbox select module
      expect(getCurrentPath()).to.eventually.equal(path);

      // attempt to navigate (via the buttons) to cashboxB as our new target
      var btn = element(by.id('cashbox-'.concat(cashboxB.id)));
      btn.click();

      browser.waitForAngular();

      // verify that we get to the cashboxB page
      expect(getCurrentPath()).to.eventually.equal(targetFinal);
    });
  });

  /** tests for the cash payments form page */
  describe('Cash Payments Form Page', function () {

    /** navigate to the page before each function */
    beforeEach(function () {
      browser.get(path);
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

      // select the FC currency from the currency
      var FC = element(by.css('[data-currency-option="1"]'));
      FC.click();

      // enter the amount to pay for a caution
      components.currencyInput.set(mockCautionPayment.amount, null);

      // click the submit button
      FU.buttons.submit();

      // expect the receipt modal to appear
      FU.exists(by.css('[data-cash-receipt-modal]'), true);
    });

    it('should make a payment against previous invoices', function () {
      var gridId = 'debtorInvoicesGrid';

      // select the proper patient
      components.findPatient.findById(mockInvoicesPayment.patientId);

      // select the properdate

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
      var USD = element(by.css('[data-currency-option="2"]'));
      USD.click();

      // enter the amount to pay for an invoice
      components.currencyInput.set(mockInvoicesPayment.amount, null);

      // click the submit button
      FU.buttons.submit();

      // expect the receipt modal to appear
      FU.exists(by.css('[data-cash-receipt-modal]'), true);
    });
  });

  describe('Cash Transfer ', function (){

    /** navigate to the page before each function */
    beforeEach(function () {
      browser.get(path);
    });

    //This transfer should succed
    var mockTransfer = {
      amount : 100
    };

    it('should make a transfert between selected auxillary cash and a virement account', function (){

      //click the transfert button
      var transfertBtn = element(by.css('[data-perform-transfer]'));
      transfertBtn.click();

      //choosing CDF as transfer currency
      var CDFRadio = element(by.css('[data-transfer-currency-option="1"]'));
      CDFRadio.click();

      //set a value in the currency component by model to avoid conflict
      components.currencyInput.set(mockTransfer.amount, 'transferCurrencyInput');

      // submit the modal button
      var transferSubmitBtn =  element(by.id('submit-transfer'));
      transferSubmitBtn.click();

      FU.exists(by.id('succed-label'), true);
    });
  });
});
