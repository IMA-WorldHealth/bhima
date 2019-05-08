/* global element, by */
/* eslint class-methods-use-this:off */

/**
 * This class is represents an employee registration page
 * behaviour so it is an employee page object
 */

const FU = require('../shared/FormUtils');
const GA = require('../shared/GridAction');
const GU = require('../shared/GridUtils');
const components = require('../shared/components');

class RegistrationPage {
  constructor() {
    this.gridId = 'employee-registry';
    this.multipayrollGrid = element(by.id(this.gridId));
    this.actionLinkColumn = 8;
  }

  async editEmployeeName(label) {
    const { rowIndex } = await GU.getGridIndexesMatchingText(this.gridId, label);
    await GA.clickOnMethod(rowIndex, this.actionLinkColumn, 'edit', this.gridId);
  }

  createEmployee() {
    return FU.buttons.submit();
  }

  // set display name
  setDisplayName(displayName) {
    return FU.input('EmployeeCtrl.employee.display_name', displayName);
  }

  // set dob
  setDob(dob) {
    return FU.input('EmployeeCtrl.employee.dob', dob);
  }

  // set sex
  setSex(sex) {
    const id = (sex === 'M') ? 'male' : 'female';
    return $(`[id="${id}"]`).click();
  }


  // set number of spouse
  setNumberChild(nbEnfant) {
    return FU.input('EmployeeCtrl.employee.nb_enfant', nbEnfant);
  }

  // set hiring date
  setHiringDate(hiringDate) {
    return FU.input('EmployeeCtrl.employee.date_embauche', hiringDate);
  }

  // set the employee code
  setCode(code) {
    return FU.input('EmployeeCtrl.employee.code', code);
  }

  // set service
  setService(service) {
    return FU.uiSelect('EmployeeCtrl.employee.service_id', service);
  }

  // set grade
  setGrade(grade) {
    return FU.uiSelect('EmployeeCtrl.employee.grade_uuid', grade);
  }

  // set fonction
  setFonction(fonction) {
    return FU.uiSelect('EmployeeCtrl.employee.fonction_id', fonction);
  }

  // set Medical Staff
  setIsMedical() {
    return element(by.model('EmployeeCtrl.employee.is_medical')).click();
  }

  // set email
  setEmail(email) {
    return FU.input('EmployeeCtrl.employee.email', email);
  }

  // set address
  setAddress(address) {
    return FU.input('EmployeeCtrl.employee.adresse', address);
  }

  // set hospital Number
  setHospitalNumber(hn) {
    return FU.input('EmployeeCtrl.employee.hospital_no', hn);
  }

  // set debtor group
  setDebtorGroup(dg) {
    return components.debtorGroupSelect.set(dg);
  }

  // set creditor group
  setCreditorGroup(cg) {
    return FU.uiSelect('EmployeeCtrl.employee.creditor_group_uuid', cg);
  }

  // Set Currency Input
  setCurrencyInput(id, value) {
    return components.currencyInput.set(value, id);
  }

  // set bank
  setBank(bank) {
    return FU.input('EmployeeCtrl.employee.bank', bank);
  }

  // set bank account
  setBankAccount(bankAccount) {
    return FU.input('EmployeeCtrl.employee.bank_account', bankAccount);
  }

  // Set RubricPayroll defined value By Employee
  setRubricPayroll(rubrics) {
    const keys = Object.keys(rubrics);
    const promises = keys.map(key => element(by.id(key)).sendKeys(rubrics[key]));
    return Promise.all(promises);
  }

  // set origin location
  setOriginLocation(locations) {
    return components.locationSelect.set(locations, 'origin-location-id');
  }

  // set current location
  setCurrentLocation(locations) {
    return components.locationSelect.set(locations, 'current-location-id');
  }

  isEmployeeCreated(resp) {
    return FU.exists(by.id('receipt-confirm-created'), resp);
  }

  expectNotificationSuccess() {
    return components.notification.hasSuccess();
  }

  async requiredFieldErrored() {
    await FU.validation.error('EmployeeCtrl.employee.display_name');
    await FU.validation.error('EmployeeCtrl.employee.code');
    await FU.validation.error('EmployeeCtrl.employee.grade_uuid');
    await FU.validation.error('EmployeeCtrl.employee.creditor_group_uuid');
    await FU.validation.error('$ctrl.debtorGroupUuid');
    await FU.validation.error('EmployeeCtrl.employee.dob');
    await FU.validation.error('EmployeeCtrl.employee.hospital_no');
  }

  async notRequiredFieldOk() {
    await FU.validation.ok('EmployeeCtrl.employee.nb_enfant');
    await FU.validation.ok('EmployeeCtrl.employee.phone');
    await FU.validation.ok('EmployeeCtrl.employee.email');
    await FU.validation.ok('EmployeeCtrl.employee.bank');
    await FU.validation.ok('EmployeeCtrl.employee.bank_account');
    await FU.validation.ok('EmployeeCtrl.employee.service_id');
    await FU.validation.ok('EmployeeCtrl.employee.fonction_id');
    await FU.validation.ok('EmployeeCtrl.employee.adresse');
  }
}

module.exports = RegistrationPage;
