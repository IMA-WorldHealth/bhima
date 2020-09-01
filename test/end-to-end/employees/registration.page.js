/* global element, by */
/* eslint  */

/**
 * This class is represents an employee registration page
 * behaviour so it is an employee page object
 */

const FU = require('../shared/FormUtils');
const helpers = require('../shared/helpers');
const components = require('../shared/components');
const GridRow = require('../shared/GridRow');

class RegistrationPage {
  async editEmployee(reference) {
    const row = new GridRow(reference);
    await row.dropdown().click();
    await row.edit().click();
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
    return FU.uiSelect('EmployeeCtrl.employee.service_uuid', service);
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
  async setRubricPayroll(rubrics) {
    const keys = Object.keys(rubrics);

    // eslint-disable-next-line
    for (const key of keys) {
      // eslint-disable-next-line
      await element(by.id(key)).sendKeys(rubrics[key]);
    }
  }

  // set origin location
  async setOriginLocation(locations) {
    await components.locationConfigurationSelect.set(locations.location01);

    // Location Level 2
    const select02 = element(by.id('origin_location_id_level_0'));
    await select02.click();
    const filterLocation02 = helpers.selectLocationLabel(locations.location02);

    const option02 = select02.element(
      by.cssContainingText(
        '.dropdown-menu [role="option"]', filterLocation02,
      ),
    );
    await option02.click();
    // Location Level 3
    const select03 = element(by.id('origin_location_id_level_1'));
    await select03.click();
    const filterLocation03 = helpers.selectLocationLabel(locations.location03);

    const option03 = select03.element(
      by.cssContainingText(
        '.dropdown-menu [role="option"]', filterLocation03,
      ),
    );
    await option03.click();

    // Location Level 4
    const select04 = element(by.id('origin_location_id_level_2'));
    await select04.click();
    const filterLocation04 = helpers.selectLocationLabel(locations.location04);

    const option04 = select04.element(
      by.cssContainingText(
        '.dropdown-menu [role="option"]', filterLocation04,
      ),
    );
    await option04.click();
  }

  // set add new current location
  async setAddCurrentLocation(locations) {
    // Click add location
    const addCurrentLocation = element(by.id('origin_location_id_modal_open'));
    await addCurrentLocation.click();

    // Click checkbox register_again
    const registerAgain = element(by.id('register_again'));
    await registerAgain.click();

    // Add United States
    await FU.input('LocationModalCtrl.locations.name', locations.location01.name);
    await components.locationTypeSelect.set(locations.location01.type);
    FU.buttons.submit();

    // Add Illinois
    await FU.input('LocationModalCtrl.locations.name', locations.location02.name);
    await components.locationTypeSelect.set(locations.location02.type);

    await components.yesNoRadios.set('no', 'is_highest');
    await components.locationConfigurationSelect.set(locations.location01.name);

    FU.buttons.submit();

    // Add Cook, DuPage
    await FU.input('LocationModalCtrl.locations.name', locations.location03.name);
    await components.locationTypeSelect.set(locations.location03.type);

    await components.yesNoRadios.set('no', 'is_highest');
    await components.locationConfigurationSelect.set(locations.location01.name);

    // Level 0
    const select01 = element(by.id('level_0'));
    await select01.click();
    const filterLocation01 = helpers.selectLocationLabel(locations.location02.name);

    const option01 = select01.element(
      by.cssContainingText(
        '.dropdown-menu [role="option"]', filterLocation01,
      ),
    );
    await option01.click();

    FU.buttons.submit();

    // Add Chicago
    await FU.input('LocationModalCtrl.locations.name', locations.location04.name);
    await components.locationTypeSelect.set(locations.location04.type);

    await components.yesNoRadios.set('no', 'is_highest');
    await components.locationConfigurationSelect.set(locations.location01.name);

    // Level 0
    const select03 = element(by.id('level_0'));
    await select03.click();
    const filterLocation03 = helpers.selectLocationLabel(locations.location02.name);

    const option03 = select03.element(
      by.cssContainingText(
        '.dropdown-menu [role="option"]', filterLocation03,
      ),
    );
    await option03.click();

    // Level 1
    const select04 = element(by.id('level_1'));
    await select04.click();
    const filterLocation04 = helpers.selectLocationLabel(locations.location03.name);

    const option04 = select04.element(
      by.cssContainingText(
        '.dropdown-menu [role="option"]', filterLocation04,
      ),
    );
    await option04.click();

    await registerAgain.click();

    FU.buttons.submit();
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
    await FU.validation.ok('EmployeeCtrl.employee.service_uuid');
    await FU.validation.ok('EmployeeCtrl.employee.fonction_id');
    await FU.validation.ok('EmployeeCtrl.employee.adresse');
  }
}

module.exports = RegistrationPage;
