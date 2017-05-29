/* global element, by */

/**
 * This class is represents an employee registration page
 * behaviour so it is an employee page object
 **/

const FU = require('../shared/FormUtils');
const components = require('../shared/components');

class RegistrationPage {    
    //simulate the create employee button click
     createEmployee () {
        FU.buttons.submit();
    }

    // set display name
    setDisplayName(displayName){
        FU.input('EmployeeCtrl.employee.display_name', displayName);
    }

    // set dob
    setDob (dob){
        FU.input('EmployeeCtrl.employee.dob', dob);
    }

    // set sex
    setSex (sex){
        const position = sex === 'M' ? 0 : 1;
        FU.radio('EmployeeCtrl.employee.sex', position);
    } 

    // set number of spouse
    setNumberSpouse (nbSpouse){
        FU.input('EmployeeCtrl.employee.nb_spouse', nbSpouse);
    } 

    // set number of spouse
    setNumberChild (nbEnfant){
        FU.input('EmployeeCtrl.employee.nb_enfant', nbEnfant);
    }

    // set hiring date
    setHiringDate (hiringDate){
        FU.input('EmployeeCtrl.employee.date_embauche', hiringDate);
    }

    // set the employee code
    setCode (code){
        FU.input('EmployeeCtrl.employee.code', code);
    }

    //set service
    setService (service){
        FU.uiSelect('EmployeeCtrl.employee.service_id', service);
    }

    // set grade
    setGrade (grade){
        FU.uiSelect('EmployeeCtrl.employee.grade_id', grade);
    }

    // set fonction
    setFonction (fonction){
        FU.uiSelect('EmployeeCtrl.employee.fonction_id', fonction);
    }

    // set email
    setEmail (email){
        FU.input('EmployeeCtrl.employee.email', email);
    }

    // set address
    setAddress (address){
        FU.input('EmployeeCtrl.employee.adresse', address);
    }

    // set hospital Number
    setHospitalNumber(hn){
        FU.input('EmployeeCtrl.employee.hospital_no', hn);
    }

    // set debtor group
    setDebtorGroup (dg){
        FU.uiSelect('EmployeeCtrl.employee.debtor_group_uuid', dg);
    }

    // set creditor group
    setCreditorGroup (cg){
        FU.uiSelect('EmployeeCtrl.employee.creditor_group_uuid', cg);        
    }

    // set bank
    setBank (bank){
        FU.input('EmployeeCtrl.employee.bank', bank);
    }

    // set bank account
    setBankAccount (bankAccount){
        FU.input('EmployeeCtrl.employee.bank_account', bankAccount);
    }

    // set origin location
    setOriginLocation(locations){
        components.locationSelect.set(locations, 'origin-location-id');    
    }

    // set current location
    setCurrentLocation(locations){
        components.locationSelect.set(locations, 'current-location-id');    
    }
    
    isEmpoyeeCreated (resp){
        return FU.exists(by.id('receipt-confirm-created'), resp);
    }

    requiredFIeldErrored (){
        FU.validation.error('EmployeeCtrl.employee.display_name');
        FU.validation.error('EmployeeCtrl.employee.sex');
        FU.validation.error('EmployeeCtrl.employee.code');
        FU.validation.error('EmployeeCtrl.employee.grade_id');
        FU.validation.error('EmployeeCtrl.employee.creditor_group_uuid');
        FU.validation.error('EmployeeCtrl.employee.debtor_group_uuid');
        FU.validation.error('EmployeeCtrl.employee.dob');
        FU.validation.error('EmployeeCtrl.employee.hospital_no');
    }

    noRequiredFieldOk(){
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
}

module.exports = RegistrationPage;