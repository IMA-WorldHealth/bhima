/** @todo - rename this service to PatientService */
angular.module('bhima.services')
  .service('Patients', PatientService);

PatientService.$inject = [ '$http', 'util', 'SessionService' ];

/**
 * Patient Service
 *
 * Queries the /patients API
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

  /** uses the "search" endpoint to pass query strings to the database */
  service.search = search;

  function detail(uuid) {
    return $http.get(baseUrl.concat(uuid))
      .then(util.unwrapHttpResponse);
  }

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

  return service;
}
