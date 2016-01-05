/*global describe, it, beforeEach, inject, browser */

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
var expect = chai.expect;

describe('login page', function () {

  beforeEach(function () {
    browser.get('#/login');
  });

  it('rejects an undefined user', function () {
    element(by.model('LoginCtrl.credentials.username')).sendKeys('undefineds');
    element(by.model('LoginCtrl.credentials.password')).sendKeys('undefined1');
    element(by.id('submit')).click();

    expect(element(by.css('.help-block')).isPresent()).to.eventually.be.true;
  });


  it('rejects user missing a username', function () {
    element(by.model('LoginCtrl.credentials.username')).sendKeys('username');
    element(by.id('submit')).click();

    expect(element(by.css('.help-block')).isPresent()).to.eventually.be.true;
  });


  it('rejects user missing a password', function () {
    element(by.model('LoginCtrl.credentials.password')).sendKeys('password');
    element(by.id('submit')).click();

    expect(element(by.css('.help-block')).isPresent()).to.eventually.be.true;
  });


  it('has a default project value', function () {
    var defaultProject = element(by.model('LoginCtrl.credentials.project'))
        .$('option:checked').getText();
    expect(defaultProject).to.be.defined;
    expect(defaultProject).to.not.be.empty;
  });


  // TODO - how to we esnure that this user doesn't exist in production?
  it('allows a successful user to login', function () {
    element(by.model('LoginCtrl.credentials.username')).sendKeys('admin');
    element(by.model('LoginCtrl.credentials.password')).sendKeys('1');
    element(by.id('submit')).click();

    expect(browser.getCurrentUrl()).to.eventually.equal(browser.baseUrl + '#/');
  });
});
