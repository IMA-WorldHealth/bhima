/* jshint expr:true */
/* global element, by, beforeEach, inject, browser */

var chai = require('chai');
var expect = chai.expect;

var FU = require('../shared/FormUtils');
var helpers = require('../shared/helpers');
var components = require('../shared/components');

helpers.configure(chai);

describe('Employees Module', function () {
  'use strict';

  var path = '#/employees';

  var employee = {
      code : 'HBB80',
      prenom : 'Sherlock',
      name : 'Holms',
      postnom : 'Doyle',
      sexe : 'M',
      dob : '06/30/1960',
      date_embauche : '05/17/1997',
      nb_spouse : 1,
      nb_enfant : 2,
      bank : 'BIAC',
      bank_account : '00-99-88-77',
      email : 'me@info.com',
      adresse : '221B Baker Street'
  };

  var defaultEmployee = 2;
  var employeeRank = helpers.random(defaultEmployee);

  /** locations to be used in the patient select */
  var locations = [
   'dbe330b6-5cde-4830-8c30-dc00eccd1a5f', // Democratic Republic of the Congo
   'f6fc7469-7e58-45cb-b87c-f08af93edade', // Bas Congo,
   '0404e9ea-ebd6-4f20-b1f8-6dc9f9313450', // Tshikapa,
   '1f162a10-9f67-4788-9eff-c1fea42fcc9b'  // kele
  ];


  // navigate to the employee module before each test
  beforeEach(function () {
    browser.get(path);
  });

  it('successfully creates a new employee', function () {

    // swtich to the create form
    FU.buttons.create();
    FU.input('EmployeeCtrl.employee.prenom', employee.prenom);
    FU.input('EmployeeCtrl.employee.name', employee.name);
    FU.input('EmployeeCtrl.employee.postnom', employee.postnom);
    FU.input('EmployeeCtrl.employee.dob', employee.dob);
    // select a Sexe
    FU.select('EmployeeCtrl.employee.sexe')
      .enabled()
      .first()
      .click();    
    FU.input('EmployeeCtrl.employee.nb_spouse', employee.nb_spouse);
    FU.input('EmployeeCtrl.employee.nb_enfant', employee.nb_enfant);
    FU.input('EmployeeCtrl.employee.date_embauche', employee.date_embauche);  
    FU.input('EmployeeCtrl.employee.code', employee.code);
    // select an Service
    FU.select('EmployeeCtrl.employee.service_id')
      .enabled()
      .first()
      .click();
    // select an Grade
    FU.select('EmployeeCtrl.employee.grade_id')
      .enabled()
      .first()
      .click();
    // select an Fonction
    FU.select('EmployeeCtrl.employee.fonction_id')
      .enabled()
      .first()
      .click();
    
    // select an Creditor Group
    FU.select('EmployeeCtrl.employee.creditor_group_uuid')
      .enabled()
      .first()
      .click();

    // select an Debitor Group
    FU.select('EmployeeCtrl.employee.debitor_group_uuid')
      .enabled()
      .first()
      .click();
    
    FU.input('EmployeeCtrl.employee.email', employee.email);
    FU.input('EmployeeCtrl.employee.adresse', employee.adresse); 
   
    // select the locations specified
    components.locationSelect.set(locations);

    FU.input('EmployeeCtrl.employee.bank', employee.bank);
    FU.input('EmployeeCtrl.employee.bank_account', employee.bank_account);

    // submit the page to the server
    FU.buttons.submit();

    // expect a nice validation message
    FU.exists(by.id('create_success'), true);
  });


  it('successfully edits an employee', function () {

    element(by.id('employee-upd-' + employeeRank )).click();

    // modify the employee name
    FU.input('EmployeeCtrl.employee.name', ' Elementary');
    FU.input('EmployeeCtrl.employee.adresse', ' Blvd Lumumba');

    element(by.id('bhima-employee-locked')).click();
    element(by.id('change_employee')).click();

    // make sure the success message appears
    FU.exists(by.id('update_success'), true);
  });

  it('successfully unlock an employee', function () {
    element(by.id('employee-upd-' + employeeRank )).click();
    element(by.id('bhima-employee-locked')).click();
    element(by.id('change_employee')).click();

    // make sure the success message appears
    FU.exists(by.id('update_success'), true);
  });


  it('correctly blocks invalid form submission with relevant error classes', function () {

    // switch to the create form
    element(by.id('create')).click();

    // Verify form has not been successfully submitted
    expect(browser.getCurrentUrl()).to.eventually.equal(browser.baseUrl + path);

    element(by.id('submit-employee')).click();

    // the following fields should be required
    FU.validation.error('EmployeeCtrl.employee.prenom');
    FU.validation.error('EmployeeCtrl.employee.name');
    FU.validation.error('EmployeeCtrl.employee.postnom');
    FU.validation.error('EmployeeCtrl.employee.dob');
    FU.validation.error('EmployeeCtrl.employee.sexe');

    FU.validation.error('EmployeeCtrl.employee.date_embauche');
    FU.validation.error('EmployeeCtrl.employee.code');
    FU.validation.error('EmployeeCtrl.employee.service_id');
    FU.validation.error('EmployeeCtrl.employee.grade_id');
    FU.validation.error('EmployeeCtrl.employee.fonction_id');
    FU.validation.error('EmployeeCtrl.employee.creditor_group_uuid');
    FU.validation.error('EmployeeCtrl.employee.debitor_group_uuid');
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
  });

});
