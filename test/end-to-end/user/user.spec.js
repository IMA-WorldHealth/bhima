/* eslint  */
/* global element, by */

const { expect } = require('chai');
const helpers = require('../shared/helpers');
const components = require('../shared/components');
const FU = require('../shared/FormUtils');

const UserPage = require('./user.page.js');
const UserCreateUpdatePage = require('./userCU.page.js');
const EditPasswordPage = require('./edit.password.page.js');

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
    text : 'Caisse Auxiliaire',
  };

  const depots = {
    depot1 : 'Depot Secondaire',
    depot2 : 'Depot Principal',
  };

  before(() => helpers.navigate(path));

  it('displays all users loaded from the database', async () => {
    expect(await userPage.count()).to.equal(userCount);
  });

  it('creates a user successfully', async () => {
    await userPage.create();
    await userCreateUpdatePage.setDisplayName(mockUserCreate.display_name);
    await userCreateUpdatePage.setUsername(mockUserCreate.username);
    await userCreateUpdatePage.setEmail(mockUserCreate.email);
    await userCreateUpdatePage.setProjectValue(mockUserCreate.project, false);
    await userCreateUpdatePage.setPassword(mockUserCreate.password);
    await userCreateUpdatePage.setPasswordConfirm(mockUserCreate.passwordConfirm);
    await userCreateUpdatePage.submitUser();
    expect(await userPage.count()).to.equal(userCount + 1);
  });

  it('edits a user successfully without changing the password', async () => {
    await userPage.update(mockUserCreate.display_name);
    await userCreateUpdatePage.setDisplayName(mockUserEdit.display_name);
    await userCreateUpdatePage.setUsername(mockUserEdit.username);
    await userCreateUpdatePage.setEmail(mockUserEdit.email);

    await userCreateUpdatePage.setProjectValue(mockUserEdit.project, true);

    await userCreateUpdatePage.submitUser();
    /**
     * TODO : Use the page object correctly for the username page
     * to help us access the application with the edited user information
     * from this test
     */
    // if every thing is ok, the modal should disappear
    expect(await userCreateUpdatePage.isDisplayed()).to.equal(false);
  });

  it('edits a user password successfully', async () => {
    await userPage.update(mockUserEdit.display_name);
    await userCreateUpdatePage.editPassword();
    await editPasswordPage.setPassword(mockUserEdit.password);
    await editPasswordPage.setPasswordConfirm(mockUserEdit.password);
    await editPasswordPage.submitPassword();
    // if every thing is ok, the modal should disappear
    expect(await editPasswordPage.isDisplayed()).to.equal(false);
    await userCreateUpdatePage.close();
  });

  it('deactivate user system access successfully', async () => {
    await userPage.toggleUser(mockUserEdit.display_name, false);
    // submit the confirmation modal
    await FU.modal.submit();

    await components.notification.hasSuccess();
  });

  it('validates form on editing password', async () => {
    await userPage.update(mockUserEdit.display_name);

    // check that an empty form is not allowed
    await userCreateUpdatePage.editPassword();
    await editPasswordPage.submitPassword();

    await editPasswordPage.expectPasswordInvalid();
    await editPasswordPage.expectPasswordConfirmInvalid();

    // check that the passwords must be equal
    await editPasswordPage.setPassword('1');
    await editPasswordPage.setPasswordConfirm('2');
    await editPasswordPage.submitPassword();
    await editPasswordPage.expectPasswordMismatch();

    await editPasswordPage.cancelEditing();
    await userCreateUpdatePage.close();
  });

  it(`sets the cashbox ${cashbox.text} management rights for "Regular User"`, async () => {
    await userPage.updateCashbox('Regular User');

    await components.bhCheckboxTree.toggle([cashbox.text]);

    // submit the modal
    await FU.modal.submit();
    await components.notification.hasSuccess();
  });

  it('validates form on creation', async () => {
    await userPage.create();
    await userCreateUpdatePage.submitUser();

    await userCreateUpdatePage.isUsernameInvalid();
    await userCreateUpdatePage.isDisplayNameInvalid();
    await userCreateUpdatePage.isEmailInvalid();
    await userCreateUpdatePage.isProjectInvalid();
    await userCreateUpdatePage.isPasswordInvalid();
    await userCreateUpdatePage.isPasswordConfirmInvalid();

    await userCreateUpdatePage.close();
  });

  it(`sets the depot ${depots.depot1} and ${depots.depot2} management rights for "Regular User"`, async () => {
    await userPage.updateDepot('Regular User');

    await element(by.id('D4BB1452E4FA4742A281814140246877')).click();
    await element(by.id('F9CAEB16168443C5A6C447DBAC1DF296')).click();

    // submit the modal
    await FU.modal.submit();
    await components.notification.hasSuccess();
  });

});
