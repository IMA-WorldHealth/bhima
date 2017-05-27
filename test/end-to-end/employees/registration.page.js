/* global element, by, browser */

/**
 * This class is represents an employee registration page
 * behaviour so it is an employee page object
 **/

const FU = require('../shared/FormUtils');
const components = require('../shared/components');

function RegistrationPage (){
    'use strict';

    const page = this;

    //simulate the create employee button click
    function createEmployee () {
        FU.buttons.submit();
    }

    // set display name
    function setDisplayName(displayName){
        FU.input('EmployeeCtrl.employee.display_name', displayName);
    }

    // set dob
    function setDob (dob){
        FU.input('EmployeeCtrl.employee.dob', dob);
    }

    // set sex
    function setSex (sex){
        const position = sex === 'M' ? 0 : 1;
        FU.radio('EmployeeCtrl.employee.sexe', position);
    } 

    // set number of spouse
    function setNumberSpouse (nbSpouse){
        FU.input('EmployeeCtrl.employee.nb_spouse', nbSpouse);
    } 

    // set number of spouse
    function setNumberChild (nbEnfant){
        FU.input('EmployeeCtrl.employee.nb_enfant', nbEnfant);
    }

    // set hiring date
    function setHiringDate (hiringDate){
        FU.input('EmployeeCtrl.employee.date_embauche', hiringDate);
    }

    // set the employee code
    function setCode (code){
        FU.input('EmployeeCtrl.employee.code', code);
    }

    //set service
    function setService (service){
        FU.uiSelect('EmployeeCtrl.employee.service_id', service);
    }

    // set grade
    function setGrade (grade){
        FU.uiSelect('EmployeeCtrl.employee.grade_id', grade);
    }

    // set fonction
    function setFonction (fonction){
        FU.uiSelect('EmployeeCtrl.employee.fonction_id', fonction);
    }

    // set email
    function setEmail (email){
        FU.input('EmployeeCtrl.employee.email', email);
    }

    // set address
    function setAddress (address){
        FU.input('EmployeeCtrl.employee.adresse', address);
    }

    // set hospital Number
    function setHospitalNumber(hn){
        FU.input('EmployeeCtrl.employee.hospital_no', hn);
    }

    // set debtor group
    function setDebtorGroup (dg){
        FU.uiSelect('EmployeeCtrl.employee.debtor_group_uuid', dg);
    }

    // set creditor group
    function setCreditorGroup (cg){
        FU.uiSelect('EmployeeCtrl.employee.creditor_group_uuid', cg);        
    }

    // set bank
    function setBank (bank){
        FU.input('EmployeeCtrl.employee.bank', bank);
    }

    // set bank account
    function setBankAccount (bankAccount){
        FU.input('EmployeeCtrl.employee.bank_account', bankAccount);
    }

    // set origin location
    function setOriginLocation(locations){
        components.locationSelect.set(locations, 'origin-location-id');    
    }

    // set current location
    function setCurrentLocation(locations){
        components.locationSelect.set(locations, 'current-location-id');    
    }
    
    function isEmpoyeeCreated (resp){
        return FU.exists(by.id('receipt-confirm-created'), resp);
    }

    function requiredFIeldErrored (){
        FU.validation.error('EmployeeCtrl.employee.display_name');
        FU.validation.error('EmployeeCtrl.employee.sexe');
        FU.validation.error('EmployeeCtrl.employee.code');
        FU.validation.error('EmployeeCtrl.employee.grade_id');
        FU.validation.error('EmployeeCtrl.employee.creditor_group_uuid');
        FU.validation.error('EmployeeCtrl.employee.debtor_group_uuid');
        FU.validation.error('EmployeeCtrl.employee.dob');
        FU.validation.error('EmployeeCtrl.employee.hospital_no');
    }

    function noRequiredFieldOk(){
        FU.validation.ok('EmployeeCtrl.employee.locked');
        FU.validation.ok('EmployeeCtrl.employee.nb_spouse');
        FU.validation.ok('EmployeeCtrl.employee.nb_enfant');
        FU.validation.ok('EmployeeCtrl.employee.phone');
        FU.validation.ok('EmployeeCtrl.employee.email');
        FU.validation.ok('EmployeeCtrl.employee.bank');
        FU.validation.ok('EmployeeCtrl.employee.bank_account');
        FU.validation.ok('EmployeeCtrl.employee.service_id');
        FU.validation.ok('EmployeeCtrl.employee.fonction_id');
        FU.validation.ok('EmployeeCtrl.employee.adresse');
    }

    page.createEmployee = createEmployee;
    page.setDisplayName = setDisplayName;
    page.setDob = setDob;
    page.setSex = setSex;
    page.setNumberSpouse = setNumberSpouse;
    page.setNumberChild = setNumberChild;
    page.setHiringDate = setHiringDate;
    page.setCode = setCode;
    page.setService = setService;
    page.setGrade = setGrade;
    page.setFonction = setFonction;
    page.setEmail = setEmail;
    page.setAddress = setAddress;
    page.setHospitalNumber = setHospitalNumber;
    page.setDebtorGroup = setDebtorGroup;
    page.setCreditorGroup = setCreditorGroup;
    page.setBank = setBank;
    page.setBankAccount = setBankAccount;
    page.setOriginLocation = setOriginLocation;
    page.setCurrentLocation = setCurrentLocation;
    page.isEmpoyeeCreated = isEmpoyeeCreated;
    page.requiredFIeldErrored = requiredFIeldErrored;
    page.noRequiredFieldOk = noRequiredFieldOk;
}

module.exports = RegistrationPage;