/* global browser, element, by */

/** loading chai and helpers **/
const chai = require('chai');
const helpers = require('../shared/helpers');

/** loading pages **/
const UserPage = require('./user.page.js');
const UserCreateUpdatePage = require('./userCU.page.js');
const EditPasswordPage = require('./edit.password.page.js');

/** configuring helpers**/
helpers.configure(chai);

const expect = chai.expect;

describe('User Management Page', function () {
  'use strict';

  const path = '#/users';
  const userPage = new UserPage();
  const userCreateUpdatePage = new UserCreateUpdatePage();
  const editPasswordPage = new EditPasswordPage();
  const mockUserCreate = {
    userName : 'User test',
    login : 'Login test',
    email : 'test@bhima.org',
    project : 'Test Project A',
    password : 'testtest',
    passwordConfirm : 'testtest'
  };
  const mockUserEdit = {
    userName : 'User test edit',
    login : 'Login test edit',
    email : 'test_edit@bhima.org',
    project : 'Test Project C',
    password : 'testtestedit'
  };
  const userCount = 4;

  before(function () {
    return helpers.navigate(path);
  });

  it('displays all users loaded from the database', function () {
    expect(userPage.getUserCount()).to.eventually.equal(userCount);
  });

  it('creates a user successfully', function () {
    userPage.createUser();
    userCreateUpdatePage.setUserName(mockUserCreate.userName);
    userCreateUpdatePage.setLogin(mockUserCreate.login);
    userCreateUpdatePage.setEmail(mockUserCreate.email);
    userCreateUpdatePage.setProjectValue(mockUserCreate.project, false);
    userCreateUpdatePage.setPassword(mockUserCreate.password);
    userCreateUpdatePage.setPasswordConfirm(mockUserCreate.passwordConfirm);
    userCreateUpdatePage.submitUser();
    expect(userPage.getUserCount()).to.eventually.equal(userCount + 1);
  });

  it('edits a user successfully without changing the password', function () {
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

  it('edits a user password successfully', function () {
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

  it('refuses to update a user when no changes have been made', function () {
    userPage.editUser(3);
    userCreateUpdatePage.submitUser();
    expect(userCreateUpdatePage.isSameUser()).to.eventually.equal(true);
    userCreateUpdatePage.close();
  });

  it('validates from on editing password', function () {
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

  it('validates form on creation', function () {
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
