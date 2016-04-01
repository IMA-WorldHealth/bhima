/* jshint expr:true */
/* global element, by, browser */

var chai = require('chai');
var expect = chai.expect;

var helpers = require('../shared/helpers');
var FU = require('../shared/FormUtils');
var components = require('../shared/components');

describe('Exchange Rate Module', function () {

  var path = '#/exchange';
  var exchangeRate = {
    date : new Date('06-30-2015'),
    rate : '900'
  };

  var newExchangeRate ={
    date : new Date('02-15-2016'),
    rate : '950'
  };

  var updateExchangeRate ={
    rate : '930'
  };

  var DELETE_RATE = 1;
  var DEFAULT_EXCHANGE = 1;
  var CURRENCY_RANK = helpers.random(DEFAULT_EXCHANGE);
  var DELETE_SUCCESS = 4;
  var DELETE_ERROR = 1;
  var RATE = 2;
  var RATE_RANK = helpers.random(RATE);

  // navigate to the page one
  beforeEach(function () {
    browser.get(path);
  });

  it('successfully delete an exchange rate ', function () {
    element(by.id('rate-' + DELETE_RATE )).click();

    // submit the page to the server
    element(by.id('delete')).click();

    browser.switchTo().alert().accept();

    // make sure the success message is present
    FU.exists(by.id('delete_success'), true);
  });

  it('sets a new exchange rate', function () {

    // switch to the creation form
    FU.buttons.create();

    // enable previous date checkbox
    element(by.id('previous')).click();

    // set up the new date via the datepicker
    components.dateEditor.set(exchangeRate.date);
    element(by.id('current-' + CURRENCY_RANK )).click();
    FU.input('ModalCtrl.data.rate',newExchangeRate.rate);

    // submit the form
    FU.buttons.submit();

    // check that the success banner is shown
    FU.exists(by.id('create_success'), true);
  });

  it('adds exchange rates previous dates', function () {

    // switch to the create form
    FU.buttons.create();

    // enable previous date checkbox
    element(by.id('previous')).click();

    // set up the new date via the datepicker
    components.dateEditor.set(exchangeRate.date);

    element(by.id('current-' + CURRENCY_RANK )).click();
    FU.input('ModalCtrl.data.rate', exchangeRate.rate);

    // submit the page to the server
    FU.buttons.submit();

    // check that the success banner is shown
    FU.exists(by.id('create_success'), true);
  });

  it('updates currency exchange rates from the already recorded rate', function () {
    element(by.id('rate-' + RATE_RANK )).click();

    // submit the page to the server
    element(by.id('submit')).click();
    FU.input('ModalCtrl.data.rate',updateExchangeRate.rate);

    // submit the form
    FU.buttons.submit();

    // check that the success banner is shown
    FU.exists(by.id('update_success'), true);
  });

  it('correctly blocks invalid form submission with relevant error classes', function () {

    // move to the submit form
    FU.buttons.create();

    //
    element(by.id('previous')).click();

    // set the new date in the datepicker
    components.dateEditor.set(exchangeRate.date);

    element(by.id('current-' + CURRENCY_RANK )).click();

    // Verify form has not been successfully submitted
    expect(browser.getCurrentUrl()).to.eventually.equal(browser.baseUrl + path);

    // attempt to submit the form
    FU.buttons.submit();

    // The following fields should be required
    FU.validation.error('ModalCtrl.data.rate');
  });
});
