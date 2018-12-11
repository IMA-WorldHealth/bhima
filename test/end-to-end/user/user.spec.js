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
    display_name : 'User test',
    username : 'Login test',
    email : 'test@bhima.org',
    project : 'Test Project A',
    password : 'testtest134@IMA',
    passwordConfirm : 'testtest134@IMA',
  };

  const mockUserEdit = {
    display_name : 'User test edit',
    username : 'Login test edit',
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
    expect(userPage.count()).to.eventually.equal(userCount);
  });

  it('creates a user successfully', () => {
    userPage.create();
    userCreateUpdatePage.setDisplayName(mockUserCreate.display_name);
    userCreateUpdatePage.setUsername(mockUserCreate.username);
    userCreateUpdatePage.setEmail(mockUserCreate.email);
    userCreateUpdatePage.setProjectValue(mockUserCreate.project, false);
    userCreateUpdatePage.setPassword(mockUserCreate.password);
    userCreateUpdatePage.setPasswordConfirm(mockUserCreate.passwordConfirm);
    userCreateUpdatePage.submitUser();
    expect(userPage.count()).to.eventually.equal(userCount + 1);
  });

  it('edits a user successfully without changing the password', () => {
    userPage.update(mockUserCreate.display_name);
    userCreateUpdatePage.setDisplayName(mockUserEdit.display_name);
    userCreateUpdatePage.setUsername(mockUserEdit.username);
    userCreateUpdatePage.setEmail(mockUserEdit.email);

    userCreateUpdatePage.setProjectValue(mockUserEdit.project, true);

    userCreateUpdatePage.submitUser();
    /**
     * TODO : Use the page object correctly for the username page
     * to help us access the application with the edited user information
     * from this test
     */
    // if every thing is ok, the modal should disappear
    expect(userCreateUpdatePage.isDisplayed()).to.eventually.equal(false);
  });

  it('edits a user password successfully', () => {
    userPage.update(mockUserEdit.display_name);
    userCreateUpdatePage.editPassword();
    editPasswordPage.setPassword(mockUserEdit.password);
    editPasswordPage.setPasswordConfirm(mockUserEdit.password);
    editPasswordPage.submitPassword();
    // if every thing is ok, the modal should disappear
    expect(editPasswordPage.isDisplayed()).to.eventually.equal(false);
    userCreateUpdatePage.close();
  });

  it('deactivate user system access successfully', () => {
    userPage.toggleUser(mockUserEdit.display_name, false);
    // submit the confirmation modal
    FU.modal.submit();

    components.notification.hasSuccess();
  });

  it('validates form on editing password', () => {
    userPage.update(mockUserEdit.display_name);

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

  it(`sets the cashbox ${cashbox.text} management rights for "Regular User"`, () => {
    userPage.updateCashbox('Regular User');
    components.multipleCashBoxSelect.set([cashbox.text]);

    // submit the modal
    FU.modal.submit();
    components.notification.hasSuccess();
  });

  it('validates form on creation', () => {
    userPage.create();
    userCreateUpdatePage.submitUser();

    userCreateUpdatePage.isUsernameInvalid();
    userCreateUpdatePage.isDisplayNameInvalid();
    userCreateUpdatePage.isEmailInvalid();
    userCreateUpdatePage.isProjectInvalid();
    userCreateUpdatePage.isPasswordInvalid();
    userCreateUpdatePage.isPasswordConfirmInvalid();

    userCreateUpdatePage.close();
  });
});
