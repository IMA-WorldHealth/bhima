/* jshint expr:true*/
/* global protractor, by, element, browser */
const chai = require('chai');
const expect = chai.expect;

const FU = require('../shared/FormUtils');
const helpers = require('../shared/helpers');
helpers.configure(chai);

describe('Login Page', function () {

  before(() => browser.get('#/login'));

  it('rejects an undefined user', function () {
    FU.input('LoginCtrl.credentials.username', 'undefineds');
    FU.input('LoginCtrl.credentials.password', 'undefined1');
    element(by.id('submit')).click();

    FU.exists(by.css('.help-block'), true);
  });

  it('rejects user missing a username', function () {
    element(by.model('LoginCtrl.credentials.username')).sendKeys('username');
    element(by.id('submit')).click();

    FU.exists(by.css('.help-block'), true);
  });


  it('rejects user missing a password', function () {
    element(by.model('LoginCtrl.credentials.password')).sendKeys('password');
    element(by.id('submit')).click();

    FU.exists(by.css('.help-block'), true);
  });


  it('has a default project value', function () {
    var defaultProject = element(by.model('LoginCtrl.credentials.project'))
        .$('option:checked').getText();
    expect(defaultProject).to.be.defined;
    expect(defaultProject).to.not.be.empty;
  });

  it('allows a successful user to login', function () {
    FU.exists('LoginCtrl.credentials.username', 'superuser');
    FU.exists('LoginCtrl.credentials.password', 'superuser');
    element(by.id('submit')).click();

    expect(helpers.getCurrentPath()).to.eventually.equal('#/');
  });
});
