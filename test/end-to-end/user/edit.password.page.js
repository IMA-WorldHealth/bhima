/* jshint expr:true */
/* global element, by, browser */

/**
 * This class is represents a user password editing page in terms of structure and
 * behaviour so it is a user password editing page object
 **/
function EditPasswordPage() {
  const page = this;
  
  var password = element(by.model('UsersPasswordModalCtrl.user.password'));
  var passwordConfirm = element(by.model('UsersPasswordModalCtrl.user.passwordVerify'));
  var submitButton = element(by.id('password-submit'));
  var cancelButton = element(by.id('password-cancel'));

  /** set a password value **/
  function setPassword(pw){
    return password.clear().sendKeys(pw);
  }

  /** set a password confirmation value **/
  function setPasswordConfirm (pw){
    return passwordConfirm.clear().sendKeys(pw);
  }

  /** submit a user **/
  function submitPassword() {
    return submitButton.click();
  }

  /** cancel creation **/
  function cancelEditing() {
    return cancelButton.click();
  }

  /** check if the page is displayed **/
  function isDisplayed() {
    return submitButton.isPresent();
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


  page.setPassword = setPassword;
  page.setPasswordConfirm = setPasswordConfirm;
  page.submitPassword = submitPassword;
  page.cancelEditing = cancelEditing;
  page.isDisplayed = isDisplayed;
  page.isPasswordInvalid = isPasswordInvalid;
  page.isPasswordConfirmInvalid = isPasswordConfirmInvalid;

}

module.exports = EditPasswordPage;