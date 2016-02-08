/* global inject, browser, element, by */

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');

// import ui-grid testing utiliites
var gridUtils = require('../shared/gridObjectTestUtils.spec.js');

chai.use(chaiAsPromised);
var expect = chai.expect;

describe('The Permissions Module', function () {

  var PATH = '#/permissions';
  var MOCK_USER = {
    first:    'Mock',
    last:     'User',
    username: 'mockuser',
    email:    'mockuser@email.com',
    password: 'cheese'
  };

  // pre-load premissions page
  beforeEach(function () {
    browser.get(PATH);
  });

  // new user creation
  it('creates a new user', function (done) {

    // activate the creation page
    element(by.id('initCreate')).click();

    // fill in user data
    element(by.model('PermissionsCtrl.user.first')).sendKeys(MOCK_USER.first);
    element(by.model('PermissionsCtrl.user.last')).sendKeys(MOCK_USER.last);
    element(by.model('PermissionsCtrl.user.username')).sendKeys(MOCK_USER.username);
    element(by.model('PermissionsCtrl.user.email')).sendKeys(MOCK_USER.email);

    // select the first project
    element.all(by.options('project.id as project.name for project in PermissionsCtrl.projects')).first().click();

    // set password
    element(by.model('PermissionsCtrl.user.password')).sendKeys(MOCK_USER.password);
    element(by.model('PermissionsCtrl.user.passwordVerify')).sendKeys(MOCK_USER.password);

    // submit the user
    element(by.id('submitCreate')).click();

    // check for a success message
    expect(element(by.css('.bh-form-message.bh-form-message-success')).isPresent()).to.eventually.equal(true)
    .then(function () { done(); });
  });

  /*
  it('edits the previously created user', function (done) {

    // use the UI grid to select the previously created user
    gridUtils.

    // fill in user data
    element(by.model('PermissionsCtrl.user.first')).sendKeys(MOCK_USER.first);
    element(by.model('PermissionsCtrl.user.last')).sendKeys(MOCK_USER.last);
    element(by.model('PermissionsCtrl.user.username')).sendKeys(MOCK_USER.username);
    element(by.model('PermissionsCtrl.user.email')).sendKeys(MOCK_USER.email);

    // select the first project
    element.all(by.options('project.id as project.name for project in PermissionsCtrl.projects')).first().click();

    // set password
    element(by.model('PermissionsCtrl.user.password')).sendKeys(MOCK_USER.password);
    element(by.model('PermissionsCtrl.user.passwordVerify')).sendKeys(MOCK_USER.password);

    // submit the user
    element(by.id('submitCreate')).click();

    // check for a success message
    expect(element(by.css('.bh-form-message.bh-form-message-success')).isPresent()).to.eventually.equal(true)
    .then(function () { done(); });
  });
  */
});
