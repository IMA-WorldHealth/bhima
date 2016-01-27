'use strict';

angular.module('bhima.services')
  .factory('Patients', Patients);
  
Patients.$inject = ['$http'];

function Patients($http) {  
  
  function detail(uuid) { 
    var path = '/patients/';

    return $http.get(path.concat(uuid))
      .then(extractData);
  }

  // TODO Service could seperate medical and financial details - depending on form build
  function create(details) { 
    var path = '/patients';

    return $http.post(path, details)
      .then(extractData);
  }

  function update(uuid, definition) { 
    var path = '/patients/';

    return $http.put(path.concat(uuid), definition)
      .then(extractData);
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
      .then(extractData);
  }

  function updateGroups(uuid, subscribedGroups) { 
    var path = '/patients/';
    var options = formatGroupOptions(subscribedGroups);

    path = path.concat(uuid, '/groups');
    
    console.log('formatted', options);
    return $http.post(path, options)
      .then(extractData);
  }

  function logVisit(details) { 
    var path = '/patients/visit';
    
    return $http.post(path, details)
      .then(extractData);
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

  return {
    detail : detail,
    create : create,
    update : update,
    groups : groups,
    updateGroups : updateGroups,
    logVisit : logVisit
  };
}

// Utility method - pass only data object to controller
// TODO Use shared utility service
function extractData(result) { 
  return result.data;
}
