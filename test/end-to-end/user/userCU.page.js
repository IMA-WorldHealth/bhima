
/* global element, by, browser */

/**
 * This class is represents a user creation page in terms of structure and
 * behaviour so it is a user creation page object
 **/
function CreateUpdateUserPage() {
  'use strict';

  const page = this;

  var userNameField = element(by.model('UserModalCtrl.user.display_name'));
  var loginField = element(by.model('UserModalCtrl.user.username'));
  var emailField = element(by.model('UserModalCtrl.user.email'));
  var projects = $('body').element(by.model('UserModalCtrl.user.projects'));
  var editPassWordButton = element(by.id('user-edit-password'));

  var password = element(by.model('UserModalCtrl.user.password'));
  var passwordConfirm = element(by.model('UserModalCtrl.user.passwordVerify'));

  var submitButton = $('[uib-modal-window] [data-method="submit"]');
  var cancelButton = element(by.id('user-cancel'));

  var sameUserPanel = element(by.id('user-same'));

  /** set a user nama value**/
  function setUserName(username) {
    return userNameField.clear().sendKeys(username);
  }

  /** set a login value**/
  function setLogin(login) {
    return loginField.clear().sendKeys(login);
  }

  /** set an email value**/
  function setEmail(email) {
    return emailField.clear().sendKeys(email);
  }

  /** set a project choice **/
  function setProjectValue(value, append) {
    projects.click();

    if (append) {
      projects.element(by.model('$select.search')).sendKeys(value);
    } else {
      projects.element(by.model('$select.search')).clear().sendKeys(value);
    }
    return projects.element(by.cssContainingText('.dropdown-menu [role="option"]', value)).click();
  }

  /** show a dialog to edit password**/
  function editPassword() {
    return editPassWordButton.click();
  }

  /** set a password value **/
  function setPassword(pw) {
    return password.clear().sendKeys(pw);
  }

  /** set a password confirmation value **/
  function setPasswordConfirm (pw) {
    return passwordConfirm.clear().sendKeys(pw);
  }

  /** submit a user **/
  function submitUser() {
    return submitButton.click();
  }

  /** cancel creation **/
  function close() {
    return cancelButton.click();
  }

  /** check if the page is displayed**/
  function isDisplayed() {
    return submitButton.isPresent();
  }

  /** check if the username field is invalid **/
  function isUserNameInvalid() {
    return isInvalid(userNameField);
  }

  /** check if the login field is invalid **/
  function isLoginInvalid() {
    return isInvalid(loginField);
  }

  /** check if the email field is invalid **/
  function isEmailInvalid() {
    return isInvalid(emailField);
  }

  /** check if the project field is invalid **/
  function isProjectInvalid() {
    return isInvalid(projects);
  }

  /** check if the password field is invalid **/
  function isPasswordInvalid() {
    return isInvalid(password);
  }

  /** check if the passwordConfirm field is invalid **/
  function isPasswordConfirmInvalid() {
    return isInvalid(passwordConfirm);
  }

  /** check if ng-invalid css class is applied on a component **/
  function isInvalid(component) {
    return component.getAttribute('class').then(function (classes) {
      return classes.split(' ').indexOf('ng-invalid') !== -1;
    });
  }

  /** check if the user tried to edited the same user**/
  function isSameUser() {
    return sameUserPanel.isPresent();
  }

  page.close = close;
  page.editPassword = editPassword;
  page.isDisplayed = isDisplayed;
  page.isEmailInvalid = isEmailInvalid;
  page.isLoginInvalid = isLoginInvalid;
  page.isPasswordInvalid = isPasswordInvalid;
  page.isPasswordConfirmInvalid = isPasswordConfirmInvalid;
  page.isProjectInvalid = isProjectInvalid;
  page.isSameUser = isSameUser;
  page.isUserNameInvalid = isUserNameInvalid;
  page.setEmail = setEmail;
  page.setLogin = setLogin;
  page.setPassword = setPassword;
  page.setPasswordConfirm = setPasswordConfirm;
  page.setProjectValue = setProjectValue;
  page.setUserName = setUserName;
  page.submitUser = submitUser;
}

module.exports = CreateUpdateUserPage;
