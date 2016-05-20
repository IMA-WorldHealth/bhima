angular.module('bhima.services')
.service('PatientService', PatientService);

PatientService.$inject = [ '$http', 'util', 'SessionService', '$uibModal'];

/**
 * @module PatientService
 *
 * This service is reponsible for providing an interface between angular
 * module controllers and the server /patients API.
 *
 * @example
 * Controller.$inject = ['PatientService'];
 *
 * var Patients = PatientService;
 *
 * // returns patient details
 * Patients.read(uuid)...
 *
 * // creates a patient
 * Patients.create(medicalDetails, financeDetails)...
 *
 */
function PatientService($http, util, Session, $uibModal) {
  var service = this;
  var baseUrl = '/patients/';

  service.read = read;
  service.create = create;
  service.update = update;
  service.groups = groups;
  service.updateGroups = updateGroups;
  service.logVisit = logVisit;

  service.billingServices = billingServices;
  service.subsidies = subsidies;
  service.openSearchModal = openSearchModal;

  /** uses the "search" endpoint to pass query strings to the database */
  service.search = search;
  service.patientFilters = patientFilters;
  
  /** 
   * This method returns information on a patient given the patients UUID. This 
   * route provides almost all of the patients attributes. 
   *
   * @param {String|Null} uuid   The patient's UUID  (could be null)
   * @return {Object}       Promise object that will return patient details
   */
  function read(uuid) {
    return $http.get(baseUrl.concat(uuid || ''))
      .then(util.unwrapHttpResponse);
  }

  /**
   * This method accepts infromation recorded by a controllers form, formats it
   * for submission and forwards it to the server /patients/create API. It can
   * be used for creating new patient records in the database.
   *
   * @param {Object} medical   A patients medical information.
   * @param {Object} finance   A patients financial information.
   * @returns {Object}          Promise object returning success/failure confirmation.
   */
  function create(medical, finance) {
    var formatPatientRequest = {
      medical : medical,
      finance : finance
    };

    // Assign implicit information
    formatPatientRequest.medical.project_id = Session.project.id;

    return $http.post(baseUrl, formatPatientRequest)
      .then(util.unwrapHttpResponse);
  }

  function update(uuid, definition) {
    return $http.put(baseUrl.concat(uuid), definition)
      .then(util.unwrapHttpResponse);
  }

  /**
   * This method is responsible for fetching patient groups. If a patient UUID
   * is provided the method will only get the groups for that patient. If no
   * value is passed it will request all of the patient groups.
   *
   * @param {String} patientUuid    The patient's UUID - used to subselect groups
   * @return {Object}               Promise object that will return the groups requested
   */
  function groups(patientUuid) {
    var path;

    // if a patient ID has been specified - return only the patient groups for that patient
    if (angular.isDefined(patientUuid)) {
      path = baseUrl.concat(patientUuid, '/groups');
    } else {

      // no Patient ID is specified - return a list of all patient groups
      path = baseUrl.concat('groups');
    }

    return $http.get(path)
      .then(util.unwrapHttpResponse);
  }

  /**
   * Responsible for assigning groups to a patient entity based on the groups
   * provided. Note: This process will clear all previous groups and leave the
   * patient subscribed to only the groups passed to this method.
   *
   * @param {String} uuid              The target patient's UUID
   * @param {Array}  subscribedGroups  An array of group UUIDs
   * @return {Object}                   Promise object returning success/ failure
   *                                    confiramtion.
   */
  function updateGroups(uuid, subscribedGroups) {
    var options = formatGroupOptions(subscribedGroups);
    var path = baseUrl.concat(uuid, '/groups');

    return $http.post(path, options)
      .then(util.unwrapHttpResponse);
  }

  function logVisit(patientUuid) {
    return $http.post(baseUrl.concat('visit'), {uuid : patientUuid})
      .then(util.unwrapHttpResponse);
  }

  /**
   * Uses query strings to generically search for patients.
   *
   * @method search
   *
   * @param {object} options - a JSON of options to be parsed by Angular's
   * paramSerializer
   */
  function search(options) {
    var target = baseUrl.concat('search');
    /**
      * Convertion of dateRegistrationFrom and dateRegistrationTo because 
      * In the database the column registration_date and dob (date of birth) is type DATETIME
    */

    if(options.dateRegistrationFrom){
      options.dateRegistrationFrom = util.convertToMysqlDate(options.dateRegistrationFrom);  
    }  
    
    if(options.dateRegistrationTo){
      options.dateRegistrationTo = util.convertToMysqlDate(options.dateRegistrationTo);  
    }

    if(options.dateBirthFrom){
      options.dateBirthFrom = util.convertToMysqlDate(options.dateBirthFrom);  
    }

    if(options.dateBirthTo){
      options.dateBirthTo = util.convertToMysqlDate(options.dateBirthTo);
    }

    return $http.get(target, { params : options })
      .then(util.unwrapHttpResponse);
  }

  /**
   * Fetches all billing services subslected by a patient entity
   *
   * @param   {String} patientUuid    UUID of patient to select billing services for
   * @returnl {Object}                Promise object returning an array of billing
   *                                  services
   */
  function billingServices(patientUuid) {
    var path = patientAttributePath('services', patientUuid);
    return $http.get(path)
      .then(util.unwrapHttpResponse);
  }

  /**
   * Fetches all subsidies subslected by a patient entity
   *
   * @param   {String} patientUuid    UUID of patient to select subsidies for
   * @returnl {Object}                Promise object returning an array of subsidies
   */
  function subsidies(patientUuid) {
    var path = patientAttributePath('subsidies', patientUuid);
    return $http.get(path)
      .then(util.unwrapHttpResponse);
  }

  /* ----------------------------------------------------------------- */
  /** Utility Methods */
  /* ----------------------------------------------------------------- */
  function formatGroupOptions(groupFormOptions) {
    var groupUuids = Object.keys(groupFormOptions);

    var formatted = groupUuids.filter(function (groupUuid) {

      // Filter out UUIDs without a true subscription
      return groupFormOptions[groupUuid];
    });

    return {
      assignments : formatted
    };
  }

  /**
   * Combine and return the patient entity with a service/attribute - returns a
   * correctly formatted path.
   *
   * @param   {String} path   Entity path (e.g 'services')
   * @param   {String} uuid   UUID of patient to format services request
   * @return  {String}        Formatted URL for patient service
   */
  function patientAttributePath(path, patientUuid) {
    var root = '/patients/';
    return root.concat(patientUuid, '/', path);
  }


  /*
  * This function prepares the headers patient properties which were filtered,
  * Special treatment occurs when processing data related to the date
  */
  function patientFilters(patient){
    var propertyPatientFilter = [];

    if(patient.dateRegistrationFrom && patient.dateRegistrationTo){
      var dataConfiguration = {
        title : 'FORM.LABELS.DATE_REGISTRATION', 
        reference1 : patient.dateRegistrationFrom, 
        reference2 : patient.dateRegistrationTo         
      };
      propertyPatientFilter.push(dataConfiguration);      
    }

    if(patient.name){
      var dataConfiguration = {
        title : 'FORM.LABELS.NAME', 
        reference1 : patient.name,        
      };
      propertyPatientFilter.push(dataConfiguration);
    }

    if(patient.reference){
      var dataConfiguration = {
        title : 'FORM.LABELS.REFERENCE', 
        reference1 : patient.reference,        
      };
      propertyPatientFilter.push(dataConfiguration);
    }

    if(patient.fields){
      if(patient.fields.hospital_no){
        var dataConfiguration = {
          title : 'FORM.LABELS.HOSPITAL_FILE_NR', 
          reference1 : patient.fields.hospital_no,        
        };
        propertyPatientFilter.push(dataConfiguration);
      }      
    }

    if(patient.sex && patient.sex !== 'all'){
      var sexPatient;
      if(patient.sex === 'M') {
        sexPatient = 'FORM.LABELS.MALE';
      } else {
        sexPatient = 'FORM.LABELS.FEMALE';
      }
      
      var dataConfiguration = { 
        title : 'FORM.LABELS.GENDER', 
        reference1 : patient.sex,        
      };
      propertyPatientFilter.push(dataConfiguration);
    }

    if(patient.dateBirthFrom && patient.dateBirthTo){
      var dataConfiguration = {
        title : 'TABLE.COLUMNS.DOB', 
        reference1 : patient.dateBirthFrom, 
        reference2 : patient.dateBirthTo         
      };
      propertyPatientFilter.push(dataConfiguration);      
    }
    return propertyPatientFilter;
  }

  function openSearchModal(){
    return $uibModal.open({
      templateUrl : 'partials/patients/registry/modal.html',
      size : 'md',
      animation : true,
      controller : 'PatientRegistryModalController as ModalCtrl'
    }).result;
  }

  return service;
}
