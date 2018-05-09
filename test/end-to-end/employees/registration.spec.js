/* global browser */
const chai = require('chai');
const helpers = require('../shared/helpers');

const { expect } = chai;
const RegistrationPage = require('./registration.page.js');

helpers.configure(chai);

describe('Employees', () => {
  const path = '#!/employees/register';
  const registrationPage = new RegistrationPage();
  const employee = {
    code          : 'HBB80',
    display_name  : 'Dedrick Kitamuka',
    sex          : 'M',
    dob           : '30/06/1960',
    date_embauche : '17/05/1997',
    nb_spouse     : 1,
    nb_enfant     : 2,
    bank          : 'BIAC',
    bank_account  : '00-99-88-77',
    email         : 'me@info.com',
    adresse       : '221B Baker Street',
    hospital_no   : 'TP003',
  };

  const patient = {
    code           : 'HBB2018',
    display_name   : 'Test 1 Patient',
    date_embauche  : '30/06/1990',
    nb_spouse      : 5,
    nb_enfant      : 3,
    bank           : 'BCDC_1909',
    bank_account   : '00-99-100',
    email          : 'me@info.com',
    adresse        : '10011 B1-P455',
    debtor_group   : 'NGO IMA World Health',
    creditor_group : 'Employees',
  };

  before(() => helpers.navigate(path));

  it('blocks invalid form submission with relevant error classes', () => {
    // verify we are in the current path
    expect(helpers.getCurrentPath()).to.eventually.equal(path);

    registrationPage.createEmployee();
    registrationPage.requiredFieldErrored();
    registrationPage.noRequiredFieldOk();
  });

  it('creates a new employee', () => {
    registrationPage.setDisplayName(employee.display_name);
    registrationPage.setDob(employee.dob);
    registrationPage.setSex(employee.sex);
    registrationPage.setCode(employee.code);
    registrationPage.setGrade('A1');
    registrationPage.setHospitalNumber(employee.hospital_no);
    registrationPage.setCreditorGroup('Employees');
    registrationPage.setDebtorGroup('NGO IMA World Health');
    registrationPage.setOriginLocation(helpers.data.locations);
    registrationPage.setCurrentLocation(helpers.data.locations);
    registrationPage.setHiringDate(employee.date_embauche);
    registrationPage.setNumberSpouse(employee.nb_spouse);
    registrationPage.setNumberChild(employee.nb_enfant);
    registrationPage.setService('Administration');
    registrationPage.setFonction('Infirmier');
    registrationPage.setIsMedical();
    registrationPage.setEmail(employee.email);
    registrationPage.setAddress(employee.adresse);
    registrationPage.setBank(employee.bank);
    registrationPage.setBankAccount(employee.bank_account);

    registrationPage.createEmployee();
    registrationPage.isEmpoyeeCreated(true);
    browser.refresh();
  });

  it('Register an employee from a patient', () => {
    registrationPage.findPatientName(patient.display_name);
    registrationPage.setCode(patient.code);
    registrationPage.setGrade('A1');
    registrationPage.setCreditorGroup(patient.creditor_group);
    registrationPage.setDebtorGroup(patient.debtor_group);
    registrationPage.setHiringDate(patient.date_embauche);
    registrationPage.setNumberSpouse(patient.nb_spouse);
    registrationPage.setNumberChild(patient.nb_enfant);
    registrationPage.setService('Administration');
    registrationPage.setFonction('Infirmier');
    registrationPage.setIsMedical();
    registrationPage.setEmail(patient.email);
    registrationPage.setAddress(patient.adresse);
    registrationPage.setBank(patient.bank);
    registrationPage.setBankAccount(patient.bank_account);

    registrationPage.createEmployee();
    registrationPage.isEmpoyeeCreated(true);
    browser.refresh();
  });

  // FIXME: skip throws an error
  // it.skip('edits an employee', () => {
  //   element(by.id(`employee-upd-${employeeId}`)).click();

  //   // modify the employee display_name
  //   FU.input('EmployeeCtrl.employee.display_name', ' Elementary');
  //   FU.input('EmployeeCtrl.employee.adresse', ' Blvd Lumumba');

  //   element(by.id('bhima-employee-locked')).click();
  //   element(by.id('change_employee')).click();

  //   // make sure the success message appears
  //   components.notification.hasSuccess();
  // });

  // it.skip('unlocks an employee', () => {
  //   element(by.id(`employee-upd-${employeeId}`)).click();
  //   element(by.id('bhima-employee-locked')).click();
  //   element(by.id('change_employee')).click();

  //   // make sure the success message appears
  //   components.notification.hasSuccess();
  // });
});
