/* global inject, browser, element, by, protractor, localforage */

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');

// import ui-grid testing utiliites
var gridUtils = require('../shared/gridObjectTestUtils.spec.js');
var EC = protractor.ExpectedConditions;

chai.use(chaiAsPromised);
var expect = chai.expect;

describe.only('Cash Payments Module', function () {

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

    it.only('should allow a user to select and deselect a cashbox', function () {

      var targetInitial = path.concat('/' + cashboxA.id);
      var targetFinal = path.concat('/' + cashboxB.id);

      // navigate to the cash payements module
      browser.get(targetInitial);
      expect(getCurrentPath()).to.eventually.equal(targetInitial);

      // make sure we are in the correct cashbox
      var hasCashboxAText = EC.textToBePresentInElement($('[data-cashbox-text]'), cashboxA.text);
      browser.wait(hasCashboxAText, 1000);

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

      // confirm that I can find cashbox B's text
      var hasCashboxBText = EC.textToBePresentInElement($('[data-cashbox-text]'), cashboxB.text);
      browser.wait(hasCashboxBText, 1000);
    });
  });

  /** tests for the cash payments form page */
  describe('Cash Payments Form Page', function () {

    /** navigate to the page before each function */
    beforeEach(function () {
      browser.get(path);
    });

    var mockInvoicePayment = { };

    var mockCautionPayment = { };

  });
});
