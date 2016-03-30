angular.module('bhima.services')
.service('PatientService', PatientService);

PatientService.$inject = [ '$http', 'util', 'SessionService' ];

/**
 * Patient Service
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
 * Patients.detail(uuid)...
 *
 * // creates a patient 
 * Patients.create(medicalDetails, financeDetails)...
 *
 * @module services/PatientService
 */
function PatientService($http, util, Session) {
  var service = this;
  var baseUrl = '/patients/';

  service.detail = detail;
  service.create = create;
  service.update = update;
  service.groups = groups;
  service.updateGroups = updateGroups;
  service.logVisit = logVisit;
  
  service.billingServices = billingServices;
  service.subsidies = subsidies;

  /** uses the "search" endpoint to pass query strings to the database */
  service.search = search;
  
  /** 
   * This method returns information on a patient given the patients UUID. This 
   * route provides almost all of the patients attributes. 
   *
   * @param {String} uuid   The patient's UUID 
   * @return {Object}       Promise object that will return patient details
   */
  function detail(uuid) {
    return $http.get(baseUrl.concat(uuid))
      .then(util.unwrapHttpResponse);
  }
  
  /**
   * This method accepts infromation recorded by a controllers form, formats it 
   * for submission and forwards it to the server /patients/create API. It can 
   * be used for creating new patient records in the database.
   *
   * @params {Object} medical   A patients medical information.
   * @params {Object} finance   A patients financial information. 
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
   * @params {String} uuid              The target patient's UUID 
   * @params {Array}  subsribedGroups   An array of group UUIDs
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


  return service;
}
