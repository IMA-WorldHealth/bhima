/* global inject, browser, element, by, protractor */

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');

// import ui-grid testing utiliites
var gridUtils = require('../shared/gridTestUtils.spec.js');
var components = require('../shared/components');
var EC = protractor.ExpectedConditions;

chai.use(chaiAsPromised);
var expect = chai.expect;

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

      // our target is cashboxB
      var target = path.concat('/' + cashboxB.id);

      // implicitly choose cashbox B by navigating to it directly
      browser.get(target);
      expect(getCurrentPath()).to.eventually.equal(target);

      // attempt to return to /cash manually
      browser.get(path);

      // expect that we were routed back to cashbox B
      expect(getCurrentPath()).to.eventually.equal(target);
    });

    it('navigating to /cash after a selection is made should re-route to /cash/:id', function () {

      // our target is cashboxB
      var target = path.concat('/' + cashboxB.id);

      // emulate a selection by simply going to the direct URL
      // this should set the cashbox ID in localstorage
      browser.get(target);

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

      // ensure we get back to the cashbox select module
      expect(getCurrentPath()).to.eventually.equal(path);

      // attempt to navigate (via the buttons) to cashboxB as our new target
      var btn = element(by.id('cashbox-'.concat(cashboxB.id)));
      btn.click();

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
      patientId: 'TPA1',
      amount : 150
    };

    // This payment against patient invoices should succeed
    var mockInvoicesPayment = {
      patientId: 'TPA2',
      date : new Date('2016-06-01'),
      amount : 5.12
    };

    /**
     * wraps the find-patient directive to search by id easily
     * @todo - move this into a common shared utility for modules to use in the
     * future
     */
    function findPatientById(id) {

      // locate the find-patient directive's dropdown toggle and open
      var dropdown = element(by.css('[data-find-patient-dropdown-toggle]'));
      dropdown.click();

      // select the search by id option
      var searchByIdOption = element(by.css('[data-find-patient-option="FIND.PATIENT_ID"]'));
      searchByIdOption.click();

      // get the input and enter the id provided
      var input = element(by.model('session.idInput'));
      input.sendKeys(id);

      // submit the id to the server
      var submit = element(by.css('[data-find-patient-submit]'));
      submit.click();
    }

    /**
     * wraps the edit date component to easily change dates
     * @todo - move this into a common shared utility for modules to use in the
     * future
     */
    function editDate(date, form) {

      // click the edit date button to toggle into readonly mode
      var btn = element(by.css('[data-edit-date-btn]'));
      btn.click();

      // pre-format date for insertion to the date input
      var val = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();

      // currently, protractor does not support sending keys to all known HTML5
      // date input controls (see https://github.com/angular/protractor/issues/562).
      // so, we must the document methods.
      var src = 'var ipt = document.querySelector("[data-edit-date-btn]"); ' +
        'ipt.value = "' + val + '"; ' +
        'angular.element(ipt).scope().$apply(' +
          'function (s) { s.' + form + '[ipt.name].$setViewValue("' + val + '"); });';

      // run the script
      browser.executeScript(src);

      // lock the date input back in readonly mode
      btn.click();
    }

    it('should make a caution payment', function () {

      // select the proper patient
      findPatientById(mockCautionPayment.patientId);

      // we will leave the date input as default

      // select the proper is caution type
      var cautionOption = element(by.css('[data-caution-option="1"]'));
      cautionOption.click();

      // select the FC currency from the currency
      var currencyOption = element(by.css('[data-currency-option="1"]'));
      currencyOption.click();

      // enter the amount to pay for a caution
      components.currencyInput.set(mockCautionPayment.amount);

      // click the submit button
      var submit = element(by.css('[data-action="submit"]'));
      submit.click();

      // expect the receipt modal to appear
      expect(element(by.css('[data-cash-receipt-modal]')).isPresent()).to.eventually.equal(true);
    });

    it('should make a payment against previous invoices', function () {
      var gridId = 'debtorInvoicesGrid';

      // select the proper patient
      findPatientById(mockInvoicesPayment.patientId);

      // select the properdate
      editDate(mockInvoicesPayment.date);

      // select the "invoices payment" option type
      var cautionOption = element(by.css('[data-caution-option="0"]'));
      cautionOption.click();

      // open the invoices modal to select various invoices
      var modalButton = element(by.css('[data-open-invoices-btn]'));
      expect(modalButton.isPresent()).to.eventually.equal(true);
      modalButton.click();

      // be sure that the modal opened
      expect(element(by.css('[data-debtor-invoices-modal]')).isPresent()).to.eventually.equal(true);

      // inside the modal, we want to select the first row to pay against
      var row = gridUtils.selectRow(gridId, 0);

      // submit the modal
      var modalSubmit =  element(by.css('[data-debtor-invoices-modal-submit]'));
      modalSubmit.click();

      // select the USD currency from the currency radio buttons
      var currencyOption = element(by.css('[data-currency-option="2"]'));
      currencyOption.click();

      // enter the amount to pay for an invoice
      components.currencyInput.set(mockInvoicesPayment.amount);

      // click the submit button
      var submit = element(by.css('[data-action="submit"]'));
      submit.click();

      // expect the receipt modal to appear
      expect(element(by.css('[data-cash-receipt-modal]')).isPresent()).to.eventually.equal(true);
    });
  });
});
