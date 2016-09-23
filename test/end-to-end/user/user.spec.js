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

describe('User management page', function () {

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
    project : 'Test Project B',
    password : 'testtestedit'
  };
  const userCount = 4;

  before(function () {
    return helpers.navigate(path);
  });

  it('Displays all users loaded from the database', function () {
    expect(userPage.getUserCount()).to.eventually.equal(userCount);
  });

  it('Creates a user successfully', function () {
    userPage.createUser();
    userCreateUpdatePage.setUserName(mockUserCreate.userName);
    userCreateUpdatePage.setLogin(mockUserCreate.login);
    userCreateUpdatePage.setEmail(mockUserCreate.email);
    userCreateUpdatePage.setProjectValue(mockUserCreate.project);
    userCreateUpdatePage.setPassword(mockUserCreate.password);
    userCreateUpdatePage.setPasswordConfirm(mockUserCreate.passwordConfirm);
    userCreateUpdatePage.submitUser();
    expect(userPage.getUserCount()).to.eventually.equal(userCount + 1);
  });
  
  it('edits a user successfully without changing the password', function () {
    userPage.editUser(4);
    userCreateUpdatePage.setUserName(mockUserCreate.userName);
    userCreateUpdatePage.setLogin(mockUserCreate.login);
    userCreateUpdatePage.setEmail(mockUserCreate.email);
    userCreateUpdatePage.setProjectValue(mockUserCreate.project);
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
  
  it('refuses to update the same user', function () {
    userPage.editUser(3);
    userCreateUpdatePage.submitUser();
    expect(userCreateUpdatePage.isSameUser()).to.eventually.equal(true);
    userCreateUpdatePage.close();
  });
  
  it('validates from on editing password', function () {
    userPage.editUser(3);
    userCreateUpdatePage.editPassword();
    editPasswordPage.submitPassword();
    expect(editPasswordPage.isPasswordInvalid()).to.eventually.equal(true);
    expect(editPasswordPage.isPasswordConfirmInvalid()).to.eventually.equal(true);
    editPasswordPage.cancelEditing();
    userCreateUpdatePage.close();
  });
});





