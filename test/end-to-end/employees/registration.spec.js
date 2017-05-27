/* global element, by, browser */
const chai = require('chai');
const helpers = require('../shared/helpers');

const expect = chai.expect;
const RegistrationPage = require('./registration.page.js');

helpers.configure(chai);

describe('Employees', () => {
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

  it('blocks invalid form submission with relevant error classes', () => {
    // verify we are in the current path
    expect(helpers.getCurrentPath()).to.eventually.equal(path);

    registrationPage.createEmployee();   
    registrationPage.requiredFIeldErrored();
    registrationPage.noRequiredFieldOk();
  });

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
    registrationPage.isEmpoyeeCreated(true);
    browser.refresh();    
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
});
