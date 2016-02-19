/*global describe, it, element, by, beforeEach, inject, browser */

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var expect = chai.expect;

var FormUtils = require('../shared/FormUtils');

describe('The Exchange Rate  Module', function () {
  // shared methods
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
  //To obtain the rank of a random element to the exchange rate list
  function aleatoire(N) { 
    return (Math.floor((N)*Math.random()+1)); 
  }

  var DELETE_RATE = 1;
  var DEFAULT_EXCHANGE = 1;
  var CURRENCY_RANK = aleatoire(DEFAULT_EXCHANGE);
  var DELETE_SUCCESS = 4;
  var DELETE_ERROR = 1;
  var RATE = 2;
  var RATE_RANK = aleatoire(RATE);


  beforeEach(function () {
    browser.get(path);
  });

  it('Successfully delete an Exchange Rate ', function () {
    element(by.id('rate-' + DELETE_RATE )).click();    
    // submit the page to the server
    element(by.id('delete')).click();    

    browser.switchTo().alert().accept();
    expect(element(by.id('delete_success')).isPresent()).to.eventually.be.true;
  });

  it('Successfully Set a new Exchange Rate', function () {
    FormUtils.buttons.create();

    element(by.id('previous')).click();
    FormUtils.input('ExchangeCtrl.form.date', EXCHANGE_NEW.date);
    element(by.id('current-' + CURRENCY_RANK )).click();
    FormUtils.input('ModalCtrl.data.rate',EXCHANGE_NEW.rate);
    FormUtils.buttons.submit();

    expect(element(by.id('create_success')).isPresent()).to.eventually.be.true;
  });

  it('Add exchange rates for a date for an Old Date ', function () {
    FormUtils.buttons.create();

    element(by.id('previous')).click();
    FormUtils.input('ExchangeCtrl.form.date', EXCHANGE.date);
    element(by.id('current-' + CURRENCY_RANK )).click();
    FormUtils.input('ModalCtrl.data.rate',EXCHANGE.rate);
    // submit the page to the server
    FormUtils.buttons.submit();

    expect(element(by.id('create_success')).isPresent()).to.eventually.be.true;
  });

  it('Updated currency exchange rates from the already recorded rate', function () {
    element(by.id('rate-' + RATE_RANK )).click();
    
    // submit the page to the server
    element(by.id('submit')).click();    
    FormUtils.input('ModalCtrl.data.rate',EXCHANGE_UPDATE.rate);
    FormUtils.buttons.submit();

    expect(element(by.id('update_success')).isPresent()).to.eventually.be.true;
  });

  it('correctly blocks invalid form submission with relevent error classes', function () {
    FormUtils.buttons.create();
    element(by.id('previous')).click();
    FormUtils.input('ExchangeCtrl.form.date', EXCHANGE_NEW.date);
    element(by.id('current-' + CURRENCY_RANK )).click();

    // Verify form has not been successfully submitted
    expect(browser.getCurrentUrl()).to.eventually.equal(browser.baseUrl + path);

    FormUtils.buttons.submit(); 

    // The following fields should be required
    expect(element(by.model('ModalCtrl.data.rate')).getAttribute('class')).to.eventually.contain('ng-invalid');
  });  

});
