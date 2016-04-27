/* global element, by, browser */
const chai = require('chai');
const expect = chai.expect;

const helpers = require('../shared/helpers');
const FU = require('../shared/FormUtils');
const components = require('../shared/components');
helpers.configure(chai);

describe('Exchange Rate Module', function () {
  'use strict';

  const path = '#/exchange';
  before(() => browser.get(path));

  const exchangeRate = {
    date : new Date('06-30-2015'),
    rate : '900'
  };

  const newExchangeRate ={
    date : new Date('02-15-2016'),
    rate : '950'
  };

  const updateExchangeRate ={
    rate : '930'
  };

  const DELETE_RATE = 1;
  const DEFAULT_EXCHANGE = 1;
  const CURRENCY_RANK = helpers.random(DEFAULT_EXCHANGE);
  const DELETE_SUCCESS = 4;
  const DELETE_ERROR = 1;
  const RATE = 2;
  const RATE_RANK = helpers.random(RATE);


  it('successfully delete an exchange rate ', function () {
    element(by.id('rate-' + DELETE_RATE )).click();

    // submit the page to the server
    element(by.id('delete')).click();

    //Confirm the action by a click on the buttom confirm
    components.modalAction.confirm();

    // make sure the success message is present
    FU.exists(by.id('delete_success'), true);
  });

  it('sets a new exchange rate', function () {

    // switch to the creation form
    FU.buttons.create();

    // enable previous date checkbox
    element(by.id('previous')).click();

    // set up the new date via the date-picker
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

    // verify form has not been successfully submitted
    expect(helpers.getCurrentPath()).to.eventually.equal(path);

    // attempt to submit the form
    FU.buttons.submit();

    // The following fields should be required
    FU.validation.error('ModalCtrl.data.rate');
  });
});
