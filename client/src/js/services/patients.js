/** @todo - rename this service to PatientService */
angular.module('bhima.services')
  .service('Patients', PatientService);

PatientService.$inject = [ '$http', 'util' ];

/**
 * Patient Service
 *
 * Queries the /patients API
 */
function PatientService($http, util) {
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

  function detail(uuid) {
    return $http.get(baseUrl.concat(uuid))
      .then(util.unwrapHttpResponse);
  }

  // TODO Service could seperate medical and financial details - depending on form build
  function create(details) {
    return $http.post(baseUrl, details)
      .then(util.unwrapHttpResponse);
  }

  function update(uuid, definition) {
    return $http.put(baseUrl.concat(uuid), definition)
      .then(util.unwrapHttpResponse);
  }

  // TODO Review/ refactor
  // Optionally accepts patientUuid - if no uuid is passed this will return all patients groups
  function groups(patientUuid) {
    var path;

    // If a patient ID has been specified - return only the patient groups for that patient
    if (angular.isDefined(patientUuid)) {
      path = baseUrl.concat(patientUuid, '/groups');
    } else {

      // No Patient ID is specified - return a list of all patient groups
      path = baseUrl.concat('groups');
    }

    return $http.get(path)
      .then(util.unwrapHttpResponse);
  }

  function updateGroups(uuid, subscribedGroups) {
    var options = formatGroupOptions(subscribedGroups);
    var path = baseUrl.concat(uuid, '/groups');

    return $http.post(path, options)
      .then(util.unwrapHttpResponse);
  }

  function logVisit(details) {
    return $http.post(baseUrl.concat('visit'), details)
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
  
  // fetch all billing services belonging to a patient entity
  function billingServices(patientUuid) { 
    var path = patientAttributePath('services', patientUuid);
    return $http.get(path)
      .then(util.unwrapHttpResponse);
  }
  
  function subsidies(patientUuid) { 
    var path = patientAttributePath('subsidies', patientUuid);
    return $http.get(path)
      .then(util.unwrapHttpResponse);
  }

  // Utility methods
  function patientAttributePath(path, patientUuid) { 
    var root = '/patients/';
    return root.concat(patientUuid, '/', path);
  }

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

  return service;
}
