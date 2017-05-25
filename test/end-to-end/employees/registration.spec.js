/* global element, by, browser */
const chai = require('chai');
const helpers = require('../shared/helpers');

const expect = chai.expect;
const RegistrationPage = require('./registration.page.js');

helpers.configure(chai);

describe.only('Employees', () => {
  const path = '#!/employees/register';
  const registrationPage =  new RegistrationPage();
  const employee = {
    code          : 'HBB80',
    display_name  : 'Sherlock Holmes Doyle',
    sexe          : 'M',
    dob           : '1960-06-30',
    date_embauche : '1997-05-17',
    nb_spouse     : 1,
    nb_enfant     : 2,
    bank          : 'BIAC',
    bank_account  : '00-99-88-77',
    email         : 'me@info.com',
    adresse       : '221B Baker Street',
    hospital_no   : 'TP003', 
   };

  before(() => {return helpers.navigate(path)});
  const employeeId = helpers.random(2);

  it('creates a new employee', () => {
    registrationPage.setDisplayName(employee.display_name);
    registrationPage.setDob(employee.dob);
    registrationPage.setSex(employee.sexe);
    registrationPage.setCode(employee.code);
    registrationPage.setGrade('A1');
    registrationPage.setHospitalNumber(employee.hospital_no);
    registrationPage.setCreditorGroup('Personnel');
    registrationPage.setDebtorGroup('Second Test Debtor Group');
    registrationPage.setOriginLocation(helpers.data.locations);
    registrationPage.setCurrentLocation(helpers.data.locations);


    registrationPage.setHiringDate(employee.date_embauche); 
    registrationPage.setNumberSpouse(employee.nb_spouse);
    registrationPage.setNumberChild(employee.nb_enfant);       
    registrationPage.setService('Administration');    
    registrationPage.setFonction('Infirmier');
    registrationPage.setEmail(employee.email);
    registrationPage.setAddress(employee.adresse);    
    registrationPage.setBank(employee.bank);
    registrationPage.setBankAccount(employee.bank_account);    

    registrationPage.createEmployee();
    registrationPage.isEmpoyeeCreated();
  });

  it.skip('edits an employee', () => {
    element(by.id(`employee-upd-${employeeId}`)).click();

    // modify the employee display_name
    FU.input('EmployeeCtrl.employee.display_name', ' Elementary');
    FU.input('EmployeeCtrl.employee.adresse', ' Blvd Lumumba');

    element(by.id('bhima-employee-locked')).click();
    element(by.id('change_employee')).click();

    // make sure the success message appears
    components.notification.hasSuccess();
  });

  it.skip('unlocks an employee', () => {
    element(by.id(`employee-upd-${employeeId}`)).click();
    element(by.id('bhima-employee-locked')).click();
    element(by.id('change_employee')).click();

    // make sure the success message appears
    components.notification.hasSuccess();
  });

  it.skip('blocks invalid form submission with relevant error classes', () => {
    FU.buttons.create();

    // verify form has not been submitted
    expect(helpers.getCurrentPath()).to.eventually.equal(path);

    element(by.id('submit-employee')).click();

    // the following fields should be required
    FU.validation.error('EmployeeCtrl.employee.display_name');
    FU.validation.error('EmployeeCtrl.employee.sexe');
    FU.validation.error('EmployeeCtrl.employee.code');
    FU.validation.error('EmployeeCtrl.employee.service_id');
    FU.validation.error('EmployeeCtrl.employee.grade_id');
    FU.validation.error('EmployeeCtrl.employee.fonction_id');
    FU.validation.error('EmployeeCtrl.employee.creditor_group_uuid');
    FU.validation.error('EmployeeCtrl.employee.debtor_group_uuid');
    FU.validation.error('EmployeeCtrl.employee.adresse');

    // the following fields are not required
    FU.validation.ok('EmployeeCtrl.employee.locked');
    FU.validation.ok('EmployeeCtrl.employee.nb_spouse');
    FU.validation.ok('EmployeeCtrl.employee.nb_enfant');
    FU.validation.ok('EmployeeCtrl.employee.locked');
    FU.validation.ok('EmployeeCtrl.employee.phone');
    FU.validation.ok('EmployeeCtrl.employee.email');
    FU.validation.ok('EmployeeCtrl.employee.bank');
    FU.validation.ok('EmployeeCtrl.employee.bank_account');

    components.notification.hasDanger();
  });
});
