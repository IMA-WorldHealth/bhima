/* loading chai and helpers */
const chai = require('chai');
const helpers = require('../shared/helpers');
const components = require('../shared/components');
const FU = require('../shared/FormUtils');

/* loading pages */
const UserPage = require('./user.page.js');
const UserCreateUpdatePage = require('./userCU.page.js');
const EditPasswordPage = require('./edit.password.page.js');

/* configuring helpers */
helpers.configure(chai);

const { expect } = chai;

describe('User Management Page', () => {
  const path = '#/users';
  const userPage = new UserPage();
  const userCreateUpdatePage = new UserCreateUpdatePage();
  const editPasswordPage = new EditPasswordPage();
  const mockUserCreate = {
    userName : 'User test',
    login : 'Login test',
    email : 'test@bhima.org',
    project : 'Test Project A',
    password : 'testtest134@IMA',
    passwordConfirm : 'testtest134@IMA',
  };
  const mockUserEdit = {
    userName : 'User test edit',
    login : 'Login test edit',
    email : 'test_edit@bhima.org',
    project : 'Test Project C',
    password : 'testtestedit1233@D',
  };
  const userCount = 4;

  const cashbox = {
    text : 'Caisse Aux',
  };

  before(() => helpers.navigate(path));

  it('displays all users loaded from the database', () => {
    expect(userPage.getUserCount()).to.eventually.equal(userCount);
  });

  it('creates a user successfully', () => {
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

  it('edits a user successfully without changing the password', () => {
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
     */
    // if every thing is ok, the modal should disappear
    expect(userCreateUpdatePage.isDisplayed()).to.eventually.equal(false);
  });

  it('edits a user password successfully', () => {
    userPage.editUser(4);
    userCreateUpdatePage.editPassword();
    editPasswordPage.setPassword(mockUserEdit.password);
    editPasswordPage.setPasswordConfirm(mockUserEdit.password);
    editPasswordPage.submitPassword();
    /**
     * TODO : Use the page object correctly for the login page
     * to help us access the application with the edited user information
     * from this test
     */
    expect(editPasswordPage.isDisplayed()).to.eventually.equal(false); // if every thing is ok, the modal should disappear
    userCreateUpdatePage.close();
  });

  it('deactivate user system access successfully', () => {
    userPage.deactivateUser(4);
    // submit the confirmation modal
    FU.modal.submit();

    components.notification.hasSuccess();
  });

  it('refuses to update a user when no changes have been made', () => {
    userPage.editUser(3);
    userCreateUpdatePage.submitUser();
    expect(userCreateUpdatePage.isSameUser()).to.eventually.equal(true);
    userCreateUpdatePage.close();
  });

  it('validates from on editing password', () => {
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

  it(`Set Cashbox ${cashbox.text} Manage Right to RegularUser `, () => {
    userPage.editUserCashbox(1);
    components.multipleCashBoxSelect.set([cashbox.text]);

    // submit the modal
    FU.modal.submit();
    components.notification.hasSuccess();
  });

  it('validates form on creation', () => {
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
