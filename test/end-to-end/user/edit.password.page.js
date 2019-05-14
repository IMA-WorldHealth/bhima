/* global element, by, */
const { expect } = require('chai');

/**
 * This class is represents a user password editing page in terms of structure and
 * behaviour so it is a user password editing page object
 * */
function EditPasswordPage() {
  const page = this;

  const password = element(by.model('UsersPasswordModalCtrl.user.password'));
  const passwordConfirm = element(by.model('UsersPasswordModalCtrl.user.passwordVerify'));
  const submitButton = $('[uib-modal-window] [data-method="submit"]');
  const cancelButton = $('[uib-modal-window] [data-method="cancel"]');
  const modal = $('[data-edit-password-modal]');

  /** set a password value * */
  function setPassword(pw) {
    return password.clear().sendKeys(pw);
  }

  /** set a password confirmation value * */
  function setPasswordConfirm(pw) {
    return passwordConfirm.clear().sendKeys(pw);
  }

  /** submit a user * */
  function submitPassword() {
    return submitButton.click();
  }

  /** cancel creation * */
  function cancelEditing() {
    return cancelButton.click();
  }

  /** check if the page is displayed * */
  function isDisplayed() {
    return modal.isPresent();
  }

  /** check if the password field is invalid * */
  function expectPasswordInvalid() {
    return isInvalid(password);
  }

  /** check if the passwordConfirm field is invalid * */
  function expectPasswordConfirmInvalid() {
    return isInvalid(passwordConfirm);
  }

  function expectPasswordMismatch() {
    return $('[data-no-password-match]').isPresent();
  }

  /** check if ng-invalid css class is applied on a component * */
  async function isInvalid(component) {
    expect(await component.getAttribute('class')).to.contain('ng-invalid');
  }

  page.setPassword = setPassword;
  page.setPasswordConfirm = setPasswordConfirm;
  page.submitPassword = submitPassword;
  page.cancelEditing = cancelEditing;
  page.isDisplayed = isDisplayed;
  page.expectPasswordInvalid = expectPasswordInvalid;
  page.expectPasswordConfirmInvalid = expectPasswordConfirmInvalid;
  page.expectPasswordMismatch = expectPasswordMismatch;
}

module.exports = EditPasswordPage;
