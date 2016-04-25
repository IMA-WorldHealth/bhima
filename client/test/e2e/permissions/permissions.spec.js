/* global inject, browser, element, by */
const chai = require('chai');
const expect = chai.expect;

const gridUtils = require('../shared/gridObjectTestUtils.spec.js');
const FU = require('../shared/FormUtils');
const helpers = require('../shared/helpers');
helpers.configure(chai);

describe('Permissions Module', function () {

  before(() => browser.get('#/permissions'));

  const mockUser = {
    first:    'Mock',
    last:     'User',
    username: 'mockuser',
    email:    'mockuser@email.com',
    password: 'cheese'
  };

  // new user creation
  it('creates a new user', function () {

    // activate the creation page
    FU.buttons.create();

    // fill in user data
    FU.input('PermissionsCtrl.user.first', mockUser.first);
    FU.input('PermissionsCtrl.user.last', mockUser.last);
    FU.input('PermissionsCtrl.user.username', mockUser.username);
    FU.input('PermissionsCtrl.user.email', mockUser.email);

    // select the first project
    element.all(by.options('project.id as project.name for project in PermissionsCtrl.projects')).first().click();

    // set password
    FU.input('PermissionsCtrl.user.password', mockUser.password);
    FU.input('PermissionsCtrl.user.passwordVerify', mockUser.password);

    // submit the user form
    FU.buttons.submit();

    // check for a success message
    FU.exists(by.css('[data-create-success]'), true);
  });

  // tests the form validation on the create page
  it('has form validation on creation', function () {

    // activate the creation page
    FU.buttons.create();

    // submit the form without doing anything
    FU.buttons.submit();

    // check the validation messages
    FU.validation.error('PermissionsCtrl.user.first');
    FU.validation.error('PermissionsCtrl.user.last');
    FU.validation.error('PermissionsCtrl.user.username');
    FU.validation.error('PermissionsCtrl.user.email');
    FU.validation.error('PermissionsCtrl.user.projects');
    FU.validation.error('PermissionsCtrl.user.password');
    FU.validation.error('PermissionsCtrl.user.passwordVerify');
  });

  it.skip('edits the previously created user', function (done) {

    // use the UI grid to select the previously created user
    //gridUtils.

    // fill in user data
    element(by.model('PermissionsCtrl.user.first')).sendKeys(mockUser.first);
    element(by.model('PermissionsCtrl.user.last')).sendKeys(mockUser.last);
    element(by.model('PermissionsCtrl.user.username')).sendKeys(mockUser.username);
    element(by.model('PermissionsCtrl.user.email')).sendKeys(mockUser.email);

    // select the first project
    element.all(by.options('project.id as project.name for project in PermissionsCtrl.projects')).first().click();

    // set password
    element(by.model('PermissionsCtrl.user.password')).sendKeys(mockUser.password);
    element(by.model('PermissionsCtrl.user.passwordVerify')).sendKeys(mockUser.password);

    // submit the user
    element(by.id('submitCreate')).click();
  });
});
