/* global browser, element, by */

/** loading chai and helpers **/
const chai = require('chai');
const helpers = require('../shared/helpers');

/** loading pages **/
const FeeCenterPage = require('./feeCenter.page.js');
const FeecenterCreateUpdatePage = require('./feeCenterCU.page.js');

/** configuring helpers**/
helpers.configure(chai);

const expect = chai.expect;

describe.only('Fee Center Management Page', function () {
  'use strict';

  const path = '#/fee_center';
  const feeCenterPage = new FeeCenterPage();
  const feeCenterCreateUpdatePage = new FeecenterCreateUpdatePage();

  const mockFeeCenterCreate = {
    label : 'Fee Center Test',
    project : 'Test Project C',
    isCost : 1,
    isPrincipal :1,
    note : 'end to end test mock for fee center'
  };

  const mockUserEdit = {
    label : 'Fee Center test edit',
    project : 'Test Project B',
    note : 'end to end test mock for fee center'
  };
  const feeCenterCount = 7;

  before(function () {
    return helpers.navigate(path);
  });

  it('displays all fee center loaded from the database', function () {
    expect(feeCenterPage.getFeeCenterCount()).to.eventually.equal(feeCenterCount);
  });

  it('creates a fee center successfully', function () {
    feeCenterPage.createFeeCenter();
    feeCenterCreateUpdatePage.setFeeCenterLabel(mockFeeCenterCreate.label);
    feeCenterCreateUpdatePage.setProjectValue(mockFeeCenterCreate.project, false);
    feeCenterCreateUpdatePage.chooseCostCenter();
    feeCenterCreateUpdatePage.checkPrincipal();
    feeCenterCreateUpdatePage.setFeeCenterNote(mockFeeCenterCreate.note);
    feeCenterCreateUpdatePage.submitFeeCenter();
    expect(feeCenterPage.getFeeCenterCount()).to.eventually.equal(feeCenterCount + 1);
  });

  it.skip('edits a user successfully without changing the password', function () {
    userPage.editUser(4);
    userCreateUpdatePage.setUserName(mockUserEdit.userName);
    userCreateUpdatePage.setLogin(mockUserEdit.login);
    userCreateUpdatePage.setEmail(mockUserEdit.email);

    userCreateUpdatePage.setProjectValue(mockUserEdit.project, true);

    userCreateUpdatePage.submitUser();
    /**
     * TODO : Use the page object correctly for the login page
     * to help us access the application with the edited user information
     * from this test
     **/
    expect(userCreateUpdatePage.isDisplayed()).to.eventually.equal(false); //if every thing is good, the modal should disappear
  });

  it.skip('edits a user password successfully', function () {
    userPage.editUser(4);
    userCreateUpdatePage.editPassword();
    editPasswordPage.setPassword(mockUserEdit.password);
    editPasswordPage.setPasswordConfirm(mockUserEdit.password);
    editPasswordPage.submitPassword();
    /**
     * TODO : Use the page object correctly for the login page
     * to help us access the application with the edited user information
     * from this test
     **/
    expect(editPasswordPage.isDisplayed()).to.eventually.equal(false); //if every thing is good, the modal should disappear
    userCreateUpdatePage.close();
  });

  it.skip('refuses to update a user when no changes have been made', function () {
    userPage.editUser(3);
    userCreateUpdatePage.submitUser();
    expect(userCreateUpdatePage.isSameUser()).to.eventually.equal(true);
    userCreateUpdatePage.close();
  });

  it.skip('validates from on editing password', function () {
    userPage.editUser(3);

    // check that an empty form is not allowed
    userCreateUpdatePage.editPassword();
    editPasswordPage.submitPassword();

    editPasswordPage.expectPasswordInvalid();
    editPasswordPage.expectPasswordConfirmInvalid();

    // check that the passwords must be equal
    editPasswordPage.setPassword('1');
    editPasswordPage.setPasswordConfirm('2');
    editPasswordPage.submitPassword();
    editPasswordPage.expectPasswordMismatch();

    editPasswordPage.cancelEditing();
    userCreateUpdatePage.close();
  });

  it.skip('validates form on creation', function () {
    userPage.createUser();
    userCreateUpdatePage.submitUser();
    expect(userCreateUpdatePage.isUserNameInvalid()).to.eventually.equal(true);
    expect(userCreateUpdatePage.isLoginInvalid()).to.eventually.equal(true);
    expect(userCreateUpdatePage.isEmailInvalid()).to.eventually.equal(true);
    expect(userCreateUpdatePage.isProjectInvalid()).to.eventually.equal(true);
    expect(userCreateUpdatePage.isPasswordInvalid()).to.eventually.equal(true);
    expect(userCreateUpdatePage.isPasswordConfirmInvalid()).to.eventually.equal(true);

    userCreateUpdatePage.close();
  });
});
