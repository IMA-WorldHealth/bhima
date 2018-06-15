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
    date_embauche  : '24/11/1965',
    nb_spouse      : 5,
    nb_enfant      : 3,
    bank           : 'BCDC_1909',
    bank_account   : '00-99-100',
    email          : 'me@info.com',
    adresse        : '10011 B1-P455',
    debtor_group   : 'NGO IMA World Health',
    creditor_group : 'Employees',
  };

  const pathPatient = '#!/employees/81af634f-321a-40de-bc6f-ceb1167a9f65/patientAsEmployee';

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
    registrationPage.setNumberChild(employee.nb_enfant);
    registrationPage.setService('Administration');
    registrationPage.setFonction('Infirmier');
    registrationPage.setIsMedical();
    registrationPage.setEmail(employee.email);
    registrationPage.setAddress(employee.adresse);
    registrationPage.setCurrencyInput('individual_salary', 0);

    registrationPage.setCurrencyInput('TPR', 0);
    registrationPage.setCurrencyInput('v_cher', 30);
    registrationPage.setCurrencyInput('f_scol', 0);
    registrationPage.setCurrencyInput('allc', 120);
    registrationPage.setCurrencyInput('ac_sal', 0);

    registrationPage.setBank(employee.bank);
    registrationPage.setBankAccount(employee.bank_account);

    registrationPage.createEmployee();
    registrationPage.isEmpoyeeCreated(true);
    browser.refresh();
  });

  it('Register an employee from a patient', () => {
    browser.get(pathPatient);

    registrationPage.setCode(patient.code);
    registrationPage.setGrade('A1');
    registrationPage.setCreditorGroup(patient.creditor_group);
    registrationPage.setDebtorGroup(patient.debtor_group);
    registrationPage.setHiringDate(patient.date_embauche);
    registrationPage.setNumberChild(patient.nb_enfant);
    registrationPage.setService('Administration');
    registrationPage.setFonction('Infirmier');
    registrationPage.setIsMedical();
    registrationPage.setEmail(patient.email);
    registrationPage.setAddress(patient.adresse);
    registrationPage.setCurrencyInput('individual_salary', 0);
    registrationPage.setCurrencyInput('TPR', 0);
    registrationPage.setCurrencyInput('v_cher', 0);
    registrationPage.setCurrencyInput('f_scol', 0);
    registrationPage.setCurrencyInput('allc', 50);
    registrationPage.setCurrencyInput('ac_sal', 0);
    registrationPage.setBank(patient.bank);
    registrationPage.setBankAccount(patient.bank_account);

    registrationPage.createEmployee();
    registrationPage.expectNotificationSuccess();
    browser.refresh();
  });
});
