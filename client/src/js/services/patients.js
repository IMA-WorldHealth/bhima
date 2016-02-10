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

  service.detail = detail;
  service.create = create;
  service.update = update;
  service.groups = groups;
  service.updateGroups = updateGroups;
  service.logVisit = logVisit;

  function detail(uuid) {
    var path = '/patients/';

    return $http.get(path.concat(uuid))
      .then(util.unwrapHttpResponse);
  }

  // TODO Service could seperate medical and financial details - depending on form build
  function create(details) {
    var path = '/patients';

    return $http.post(path, details)
      .then(util.unwrapHttpResponse);
  }

  function update(uuid, definition) {
    var path = '/patients/';

    return $http.put(path.concat(uuid), definition)
      .then(util.unwrapHttpResponse);
  }

  // TODO Review/ refactor
  // Optionally accepts patientUuid - if no uuid is passed this will return all patients groups
  function groups(patientUuid) {
    var path = '/patients/';

    // If a patient ID has been specified - return only the patient groups for that patient
    if (angular.isDefined(patientUuid)) {
      path = path.concat(patientUuid, '/groups');
    } else {

      // No Patient ID is specified - return a list of all patient groups
      path = path.concat('groups');
    }

    return $http.get(path)
      .then(util.unwrapHttpResponse);
  }

  function updateGroups(uuid, subscribedGroups) {
    var path = '/patients/';
    var options = formatGroupOptions(subscribedGroups);

    path = path.concat(uuid, '/groups');

    console.log('formatted', options);
    return $http.post(path, options)
      .then(util.unwrapHttpResponse);
  }

  function logVisit(details) {
    var path = '/patients/visit';

    return $http.post(path, details)
      .then(util.unwrapHttpResponse);
  }

  // Utility methods
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
