angular.module('bhima.directives')
.directive('findPatient', FindPatientDirective);

FindPatientDirective.$inject = [
  '$compile', '$http', 'validate', 'messenger', 'appcache'
];

/**
* The FindPatient directive allows a user to serach for a patient by either the
* patient identifier (Project Abbreviation + Reference) or by typeahead on patient
* name.
*
* The typeahead loads data as your type into the input box, pinging th URL
* /patient/search/fuzzy (for legacy reasons, not actually a fuzzy search).  The
* HTTP endpoints sends back 10 results which are then presented to the user.
*
* @todo use of cache for keeping state if necessary
*/

function FindPatientDirective($compile, $http, validate, messenger, AppCache) {
  return {
    restrict: 'AE',
    templateUrl : 'partials/templates/findpatient.tmpl.html',
    scope : {
      callback      : '&onSearchComplete',
      initLookup    : '=?',
      enableRefresh : '=',
      inline        : '='
    },
    link : function(scope, element, attrs) {
      var cache   = new AppCache('findPatientCache');
      var session = scope.session = {};

      session.findAnotherPatient = true;
      session.patient = {};
      session.input   = {};
      session.loadStatus = null;
      session.options = [
        {
          'key'   : 0,
          'label' : 'FIND.PATIENT_ID',
          'placeholder' : 'FIND.SEARCH_PATIENT_ID'
        },
        {
          'key'   : 1,
          'label' : 'FIND.PATIENT_NAME',
          'placeholder' : 'FIND.SEARCH_NAME'
        }
      ];

      // expose to view
      scope.searchByReference  = searchByReference;
      scope.searchByName       = searchByName;
      scope.formatPatient         = formatPatient;
      scope.validateNameSearch = validateNameSearch;
      scope.selectPatient      = selectPatient;
      scope.findBy             = findBy;
      scope.reload             = reload;

      // init the directive
      startup();

      // startup function
      function startup() {
        session.selected = session.options[0];
      }

      // calls bhima API for a patient by hospital reference
      // (e.g. HBB123)
      function searchByReference(ref) {
        session.loadStatus = 'loading';
        var url = '/patients/search/?reference=';
        $http.get(url + ref)
        .then(function (response) {
          selectPatient(response.data);
        })
        .catch(handler)
        .finally();
      }

      // matches the patient's name
      function searchByName(text) {
        session.loadStatus = 'loading';
        var url = '/patients/search/?name=';
        return $http.get(url + text.toLowerCase())
        .then(function (response) {
          return response.data;
        });
      }

      function findBy(option) {
        session.selected = option;
      }

      function reload() {
        session.findAnotherPatient = true;
      }

      function formatPatient(p) {
        return p ? p.first_name + ' ' + p.last_name + ' ' + p.middle_name : '';
      }

      // generic error handler
      function handler(error) {
        console.error(error);
      }

      // handle the selected patient
      function selectPatient(patient) {
        session.findAnotherPatient = false;

        if (!patient) {
          session.loadStatus = 'error';
          session.patient = {};
          session.input   = {};
          throw Error('No patient found');
        }

        session.loadStatus = 'loaded';
        scope.patient = patient;

        // parse patient metadata
        var age = getAge(patient.dob);
        patient.age = age.years;
        patient.name = formatPatient(patient);
        patient.sex = patient.sex.toUpperCase();

        // call the external $scope callback
        scope.callback({ patient : patient });
      }

      // get an age object for the person with years, months, days
      // inspired by http://stackoverflow.com/questions/7833709/calculating-age-in-months-and-days
      function getAge(date) {
        var age = {},
            today = new Date();

        // convert to date object
        date = new Date(date);

        var y   = [today.getFullYear(), date.getFullYear()],
          ydiff = y[0] - y[1],
          m     = [today.getMonth(), date.getMonth()],
          mdiff = m[0] - m[1],
          d     = [today.getDate(), date.getDate()],
          ddiff = d[0] - d[1];

        if (mdiff < 0 || (mdiff=== 0 && ddiff<0)) { --ydiff; }

        if (mdiff < 0) { mdiff+= 12; }

        if (ddiff < 0) {
          date.setMonth(m[1]+1, 0);
          ddiff = date.getDate()-d[1]+d[0];
          --mdiff;
        }

        age.years  = ydiff > 0 ? ydiff : 0;
        age.months = mdiff > 0 ? mdiff : 0;
        age.days   = ddiff > 0 ? ddiff : 0;
        return age;
      }

      // value is the selected typeahead model
      function validateNameSearch(value) {
        if (!value) { return true; }

        if (typeof value === 'string') {
          session.valid = false;
          return true;
        }

        session.valid = true;
      }

    }
  };
}
