/* global element, by */
/* eslint  */

const FU = require('../shared/FormUtils');

class CreateUpdateUserPage {

  constructor() {
    this.modal = $('[name="UserForm"]');

    this.fields = {
      display_name : 'UserModalCtrl.user.display_name',
      username : 'UserModalCtrl.user.username',
      email : 'UserModalCtrl.user.email',
      projects : 'UserModalCtrl.user.projects',
      passwordConfirm : 'UserModalCtrl.user.passwordVerify',
      password : 'UserModalCtrl.user.password',
    };

    this.buttons = {
      password : element(by.id('user-edit-password')),
      submit : $('[uib-modal-window] [data-method="submit"]'),
      cancel : element(by.id('user-cancel')),
    };

    this.messages = {
      sameUserPanel : element(by.id('user-same')),
    };
  }


  setDisplayName(displayName) {
    return FU.input(this.fields.display_name, displayName);
  }

  setUsername(username) {
    return FU.input(this.fields.username, username);
  }

  setEmail(email) {
    return FU.input(this.fields.email, email);
  }

  async setProjectValue(value, append) {
    const uiSelect = element(by.model(this.fields.projects));
    await uiSelect.click();

    if (append) {
      await uiSelect.element(by.model('$select.search')).sendKeys(value);
    } else {
      await uiSelect.element(by.model('$select.search')).clear().sendKeys(value);
    }

    return uiSelect.element(by.cssContainingText('.dropdown-menu [role="option"]', value)).click();
  }

  /* show a dialog to edit password */
  editPassword() {
    return this.buttons.password.click();
  }

  /* set a password value */
  setPassword(pw) {
    return FU.input(this.fields.password, pw);
  }

  /* set a password confirmation value */
  setPasswordConfirm(pw) {
    return FU.input(this.fields.passwordConfirm, pw);
  }

  /* submit a user */
  submitUser() {
    return this.buttons.submit.click();
  }

  /* cancel creation */
  close() {
    return this.buttons.cancel.click();
  }

  /* check if the page is displayed */
  isDisplayed() {
    return this.buttons.submit.isPresent();
  }

  /* check if the username field is invalid */
  isUsernameInvalid() {
    return this.isInvalid(this.fields.username);
  }

  /* check if the login field is invalid */
  isDisplayNameInvalid() {
    return this.isInvalid(this.fields.display_name);
  }

  /* check if the email field is invalid */
  isEmailInvalid() {
    return this.isInvalid(this.fields.email);
  }

  /* check if the project field is invalid */
  isProjectInvalid() {
    return this.isInvalid(this.fields.projects);
  }

  /* check if the password field is invalid */
  isPasswordInvalid() {
    return this.isInvalid(this.fields.password);
  }

  /* check if the passwordConfirm field is invalid */
  isPasswordConfirmInvalid() {
    return this.isInvalid(this.fields.passwordConfirm);
  }

  /* check if ng-invalid css class is applied on a component */
  isInvalid(field) {
    return FU.validation.error(field);
  }

  /* check if the user tried to edited the same user */
  isSameUser() {
    return this.messages.sameUserPanel.isPresent();
  }
}

module.exports = CreateUpdateUserPage;
