/* jshint expr:true */
/* global element, by, beforeEach, inject, browser */

var chai = require('chai');
var expect = chai.expect;

var helpers = require('../shared/helpers');
var FU = require('../shared/FormUtils');

helpers.configure(chai);

describe('Exchange Rate Module', function () {

  var path = '#/exchange';
  var EXCHANGE = {
    date : '06/30/2015',
    rate : '900'
  };

  var EXCHANGE_NEW ={
    date : '02/15/2016',
    rate : '950'
  };

  var EXCHANGE_UPDATE ={
    rate : '930'
  };

  var DELETE_RATE = 1;
  var DEFAULT_EXCHANGE = 1;
  var CURRENCY_RANK = helpers.random(DEFAULT_EXCHANGE);
  var DELETE_SUCCESS = 4;
  var DELETE_ERROR = 1;
  var RATE = 2;
  var RATE_RANK = helpers.random(RATE);

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

  it('successfully set a new exchange rate', function () {

    // switch to teh creation form
    FU.buttons.create();

    element(by.id('previous')).click();

    FU.input('ExchangeCtrl.form.date', EXCHANGE_NEW.date);
    element(by.id('current-' + CURRENCY_RANK )).click();
    FU.input('ModalCtrl.data.rate',EXCHANGE_NEW.rate);

    // submit the form
    FU.buttons.submit();

    // check that the success banner is shown
    FU.exists(by.id('create_success'), true);
  });

  it('adds exchange rates previous dates', function () {

    // switch to the create form
    FU.buttons.create();

    element(by.id('previous')).click();
    FU.input('ExchangeCtrl.form.date', EXCHANGE.date);
    element(by.id('current-' + CURRENCY_RANK )).click();
    FU.input('ModalCtrl.data.rate',EXCHANGE.rate);

    // submit the page to the server
    FU.buttons.submit();

    // check that the success banner is shown
    FU.exists(by.id('create_success'), true);
  });

  it('Updated currency exchange rates from the already recorded rate', function () {
    element(by.id('rate-' + RATE_RANK )).click();

    // submit the page to the server
    element(by.id('submit')).click();
    FU.input('ModalCtrl.data.rate',EXCHANGE_UPDATE.rate);

    // submit the form
    FU.buttons.submit();

    // check that the success banner is shown
    FU.exists(by.id('update_success'), true);
  });

  it('correctly blocks invalid form submission with relevent error classes', function () {

    // move to the submit form
    FU.buttons.create();

    element(by.id('previous')).click();

    FU.input('ExchangeCtrl.form.date', EXCHANGE_NEW.date);

    element(by.id('current-' + CURRENCY_RANK )).click();

    // Verify form has not been successfully submitted
    expect(browser.getCurrentUrl()).to.eventually.equal(browser.baseUrl + path);

    // attempt to submit the form
    FU.buttons.submit();

    // The following fields should be required
    FU.validation.error('ModalCtrl.data.rate');
  });
});
