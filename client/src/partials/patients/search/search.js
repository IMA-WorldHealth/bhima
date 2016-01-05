angular.module('bhima.controllers')
.controller('patientRecords', [
  '$scope',
  'validate',
  'appstate',
  'connect',
  function ($scope, validate, appstate, connect) {
    var dependencies = {}, session = $scope.session = {};

    session.searchLocation = false;
    session.villageUuid = null;
    session.searched = false;
    session.searching = false;

    dependencies.patient = {
      query : {
        identifier : 'uuid',
        tables : {
          patient : {
            columns : ['uuid', 'first_name', 'last_name', 'dob', 'father_name', 'mother_name', 'sex', 'religion', 'marital_status', 'phone', 'email', 'address_1', 'address_2', 'current_location_id', 'debitor_uuid', 'registration_date', 'reference', 'middle_name', 'hospital_no']
          },
          project : {
            columns : ['abbr']
          }
        },
        join : ['patient.project_id=project.id']
      }
    };

    function assignVillageLocation(uuid) {
      session.villageUuid = uuid;
    }

    function patientSearch(searchParams) {
      var condition = [], params = angular.copy(searchParams);
      if (!params) { return; }

      if ($scope.model) { $scope.model.patient.data.length = 0; }
      session.searching = true;

      // Filter location search
      if (session.locationSearch) {
        var originId = session.villageUuid;

        if (originId) {
          condition.push('patient.origin_location_id=' + originId, 'AND');
        }
      }

      // Filter yob search
      if (params.yob) {
        condition.push('patient.dob<=' + params.yob + '-12-31', 'AND');
        condition.push('patient.dob>=' + params.yob + '-01-01', 'AND');
        delete(params.yob); // FIXME
      }

      // Filter meta
      Object.keys(params)
      .forEach(function(key) {
        if (params[key].length) {
            condition.push('patient.' + key + ' LIKE ' + searchParams[key], 'AND');
        }
      });

      // FIXME Remove final AND
      dependencies.patient.query.where = condition.slice(0, -1);
      validate.refresh(dependencies, ['patient']).then(patientRecords);
    }

    function patientRecords(model) {

      // This is a hack to get date of birth displaying correctly
      $scope.model = model;
      filterNames(model.patient.data);

      session.searching = false;
      session.searched = true;
    }

    function filterNames(patientData) {
      patientData.forEach(function(patient) {

        // Full name
        patient.name = patient.last_name+ ' ' + patient.middle_name + ' ' + patient.first_name;

        // Human readable ID
        patient.hr_id = patient.abbr.concat(patient.reference);
      });
    }

    $scope.patientSearch = patientSearch;
    $scope.assignVillageLocation = assignVillageLocation;
  }
]);
