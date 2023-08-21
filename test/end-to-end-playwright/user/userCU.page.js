const TU = require('../shared/TestUtils');
const { by } = require('../shared/TestUtils');

class CreateUpdateUserPage {

  constructor() {
    this.fields = {
      display_name : 'UserModalCtrl.user.display_name',
      username : 'UserModalCtrl.user.username',
      email : 'UserModalCtrl.user.email',
      projects : 'UserModalCtrl.user.projects',
      passwordConfirm : 'UserModalCtrl.user.passwordVerify',
      password : 'UserModalCtrl.user.password',
    };
  }

  setDisplayName(displayName) {
    return TU.input(this.fields.display_name, displayName);
  }

  setUsername(username) {
    return TU.input(this.fields.username, username);
  }

  setEmail(email) {
    return TU.input(this.fields.email, email);
  }

  async setProjectValue(value, append) {
    const uiSelect = await TU.locator(by.model(this.fields.projects));
    await uiSelect.click();

    if (append) {
      await uiSelect.locator(by.model('$select.search')).fill(value);
    } else {
      await uiSelect.locator(by.model('$select.search')).fill(value);
    }

    return uiSelect.locator('.dropdown-menu [role="option"]').locator(by.containsText(value)).click();
  }

  /* show a dialog to edit password */
  editPassword() {
    return TU.locator(by.id('user-edit-password')).click();
  }

  /* set a password value */
  setPassword(pw) {
    return TU.input(this.fields.password, pw);
  }

  /* set a password confirmation value */
  setPasswordConfirm(pw) {
    return TU.input(this.fields.passwordConfirm, pw);
  }

  /* submit a user */
  submitUser() {
    return TU.modal.submit();
  }

  /* cancel creation */
  close() {
    return TU.locator(by.id('user-cancel')).click();
  }

  /* check if the page is displayed */
  isDisplayed() {
    return TU.isPresent('[uib-modal-window] [data-method="submit"]');
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
    return TU.validation.error(field);
  }

  /* check if the user tried to edited the same user */
  isSameUser() {
    return TU.isPresent(by.id('user-same'));
  }

}

module.exports = CreateUpdateUserPage;
