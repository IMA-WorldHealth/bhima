angular.module('bhima.directives')
.directive('findPatient', FindPatientDirective);

FindPatientDirective.$inject = ['$compile', '$http', 'appcache'];

/**
* The FindPatient directive allows a user to serach for a patient by either the
* patient identifier (Project Abbreviation + Reference) or by typeahead on patient
* name.
*
* The typeahead loads data as your type into the input box, pinging th URL
* /patient/search/?name={string} The HTTP endpoints sends back 20 results
* which are then presented to the user.
*
*/
function FindPatientDirective($compile, $http, AppCache) {
  return {
    restrict    : 'AE',
    templateUrl : 'partials/templates/findpatient.tmpl.html',
    scope : {
      callback : '&onSearchComplete',
      inline   : '='
    },
    link : function(scope, element, attrs) {
      var cache   = new AppCache('FindPatientDirective'),
          session = scope.session = {};

      /** options of search: by ID or Name */
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

      /** default session values */
      session.showSearchView = true;
      session.loadStatus     = null;
      session.validInput     = false;


      /** Expose functions and variables to the template view */
      scope.searchByReference  = searchByReference;
      scope.searchByName       = searchByName;
      scope.formatPatient      = formatPatient;
      scope.selectPatient      = selectPatient;
      scope.validateNameSearch = validateNameSearch;
      scope.submit             = submit;
      scope.findBy             = findBy;
      scope.reload             = reload;

      /** Starting up the initial setting of the directive */
      startup();


      /**
      * @function startup
      *
      * @description setting up the initial parameters of the directive
      */
      function startup() {
        cache.fetch('option')
        .then(loadDefaultOption)
        .catch(errorHandler)
        .finally(function(){
          session.selected = session.options[0];
        });
      }

      /**
      * @function searchByReference
      *
      * @param {string} ref Patient hospital refernce. E.g. HBB123
      *
      * @description This function make a call to BHIMA API for finding a patient
      * who is identified by a hospital reference. (e.g. HBB123)
      */
      function searchByReference(ref) {
        session.loadStatus = 'loading';

        var url = '/patients/search/?reference=';
        $http.get(url + ref)
        .then(function (response) {
          selectPatient(response.data[0]);
        })
        .catch(errorHandler)
        .finally();
      }

      /**
      * @function searchByName
      *
      * @param {string} text Patient name (first_name, middle_name or last_name)
      *
      * @description This function make a call to BHIMA API for getting patients
      * according the name (first_name, middle_name or last_name).
      *
      * @return {Array} An array of patients
      */
      function searchByName(text) {
        session.loadStatus = 'loading';

        var url = '/patients/search/?name=';
        return $http.get(url + text.toLowerCase() + '&limit=20')
        .then(function (response) {
          return response.data;
        })
        .catch(errorHandler)
        .finally();
      }

      /**
      * @function submit
      *
      * @description This function is responsible for call the appropriate function
      * according we have a search by ID or a search by Name to get data
      */
      function submit() {
        if (session.selected.key === 0 && session.idInput) {
          searchByReference(session.idInput);

        } else if (session.selected.key === 1 && session.nameInput) {
          selectPatient(session.nameInput);
        }
      }

      /**
      * @function findBy
      *
      * @param {object} option The selected option
      *
      * @description This function is responsible for setting the selected option
      * between ID or Name option of search
      */
      function findBy(option) {
        session.selected   = option;
        session.loadStatus = null;
        scope.patient      = {};
        saveOption(session.selected);
      }

      /**
      * @function reload
      *
      * @description This function is responsible for enabling the user to input data
      * again for search by showing the inputs zones (search by ID or by name) again.
      */
      function reload() {
        session.showSearchView = true;
      }

      /**
      * @function formatPatient
      *
      * @param {object} patient The patient object
      *
      * @description This function is responsible for formatting the patient name
      * for to be more readable
      *
      * @returns {string} The formatted patient name
      */
      function formatPatient(p) {
        return p ? p.first_name + ' ' + p.last_name + ' ' + p.middle_name : '';
      }

      /**
      * @function errorHandler
      *
      * @param {object} error The error object
      *
      * @description This function is responsible for handling errors which occurs
      * and notify the client into the console
      */
      function errorHandler(error) {
        console.error(error);
      }

      /**
      * @function selectPatient
      *
      * @param {object} patient The patient object
      *
      * @description This function is responsible for handling the result of the search,
      * display results and pass the returned patient to the parent controller
      */
      function selectPatient(patient) {
        session.showSearchView = false;

        if (patient && typeof(patient) === 'object') {
          session.loadStatus = 'loaded';
          scope.patient = patient;

          // parse patient metadata
          var age = getAge(patient.dob);
          patient.age = age.years;
          patient.name = formatPatient(patient);
          patient.sex = patient.sex.toUpperCase();

          // call the external $scope callback
          // scope.callback({ patient : patient });

        } else {
          session.loadStatus = 'error';
        }

      }

      /**
      * @function validateNameSearch
      *
      * @param {string} value The patient reference ID or name
      *
      * @description Check if the value in the inputs is correct (well defined)
      */
      function validateNameSearch(value) {
        session.validInput = angular.isDefined(value);

        // Update the nofication
        if (!session.validInput) {
          session.loadStatus = null;
        }
      }

      /**
      * @function loadDefaultOption
      *
      * @param {object} option The default option of search
      *
      * @description This function is responsible for changing the option of search.
      * Search by ID or by the name
      */
      function loadDefaultOption(option) {
        option = option || session.options[0];
        findBy(option);
      }

      /**
      * @function saveOption
      *
      * @param {object} option The selected option of search
      *
      * @description This function is responsible for saving the selected option of
      * search in the application cache
      */
      function saveOption(option) {
        cache.put('option', option);
      }

      /**
      * @function getAge
      *
      * @param {date} date A date of a person
      *
      * @description Get an age object for the patient with years, months, days
      * inspired by http://stackoverflow.com/questions/7833709/calculating-age-in-months-and-days
      *
      * @return {object} The age object
      */
      function getAge(date) {
        var age = {},
            today = new Date();

        // convert to date object
        date = new Date(date);

        var y   = [today.getFullYear(), date.getFullYear()], ydiff = y[0] - y[1],
            m   = [today.getMonth(), date.getMonth()], mdiff = m[0] - m[1],
            d   = [today.getDate(), date.getDate()], ddiff = d[0] - d[1];

        if (mdiff < 0 || (mdiff === 0 && ddiff < 0)) { --ydiff; }

        if (mdiff < 0) { mdiff += 12; }

        if (ddiff < 0) {
          date.setMonth(m[1] + 1, 0);
          ddiff = date.getDate() - d[1] + d[0];
          --mdiff;
        }

        age.years  = ydiff > 0 ? ydiff : 0;
        age.months = mdiff > 0 ? mdiff : 0;
        age.days   = ddiff > 0 ? ddiff : 0;
        return age;
      }

    }
  };
}
