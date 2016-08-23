angular.module('bhima.components')
  .component('bhFindPatient', {
    controller: FindPatientComponent,
    templateUrl : 'partials/templates/bhFindPatient.tmpl.html',
    bindings: {
      onSearchComplete: '&',  // bind callback to call when data is available
      onRegisterApi:    '&', // expose force refresh API
      required:         '<',  // bind the required (for ng-required)
      suppressReset:    '@',  // bind a string
    }
  });

FindPatientComponent.$inject = [
  'PatientService', 'AppCache', 'NotifyService',
];

/**
 * The Find Patient Component
 *
 * This component allows a user to search for a patient by either the
 * patient identifier (Project Abbreviation + Reference) or by typeahead on patient
 * name.
 *
 * The typeahead loads data as your type into the input box, pinging the URL
 * /patient/search/?name={string} The HTTP endpoints sends back 20 results
 * which are presented to the user.
 *
 * SUPPORTED ATTRIBUTES:
 *   - on-search-complete : a callback function called with the found patient
 *   - suppress-reset: a boolean value to
 *   - on-registry-api: a callback to be called with the component's api
 */
function FindPatientComponent(Patients, AppCache, Notify) {
  var vm = this;

  /* cache to remember which the search type of the component */
  var cache = AppCache('FindPatientComponent');

  /* @const the max number of records to fetch from the server */
  var LIMIT = 10;

  /* @const the enter key keycode */
  var ENTER_KEY = 13;

  /* supported searches: by name or by id */
  vm.options = {
    findById : {
      label : 'FORM.LABELS.PATIENT_ID',
      placeholder : 'FORM.PLACEHOLDERS.SEARCH_PATIENT_ID'
    },
    findByName : {
      label : 'FORM.LABELS.PATIENT_NAME',
      placeholder : 'FORM.PLACEHOLDERS.SEARCH_NAME'
    }
  };

  vm.$onInit = function onInit() {
    vm.suppressReset = vm.suppressReset || false;

    // fetch the initial setting for the component from appcache
    loadDefaultOption(cache.optionKey);

    // call the onRegisterApi() callback with the
    vm.onRegisterApi({
      api : { reset : vm.reset }
    });
  };

  vm.showSearchView = true;
  vm.loadStatus     = null;

  /* Expose functions and variables to the template view */
  vm.searchByReference  = searchByReference;
  vm.searchByName       = searchByName;
  vm.selectPatient      = selectPatient;
  vm.submit             = submit;
  vm.findBy             = findBy;
  vm.reset              = reset;
  vm.onKeyPress         = onKeyPress;

  /**
   * @method searchByReference
   *
   * @param {string} ref -patient hospital referenece (e.g. HBB123)
   *
   * @description This function make a call to BHIMA API for finding a patient
   * who is identified by a hospital reference. (e.g. HBB123)
   */
  function searchByReference(reference) {
    vm.loadStatus = 'loading';

    var options = {
      reference : reference,
      limit : 1
    };

    // query the patient's search endpoint for the
    // reference
    Patients.search(options)
    .then(function (patients) {
      selectPatient(patients[0]);
    })
    .catch(Notify.handleError);
  }

  /**
   * @method searchByName
   *
   * @param {string} text Patient name (first_name, middle_name or last_name)
   *
   * @description This function make a call to BHIMA API for getting patients
   * according the name (first_name, middle_name or last_name).
   *
   * @return {Array} An array of patients
   */
  function searchByName(text) {
    vm.loadStatus = 'loading';

    // format query string parameters
    var options = {
      name : text.toLowerCase(),
      limit : LIMIT
    };

    return Patients.search(options)
      .then(function (patients) {

        // loop through each
        patients.forEach(function (patient) {
          patient.label = formatPatient(patient);
        });

        return patients;
      });
  }

  /**
   * @method submit
   *
   * @description This function is responsible for call the appropriate function
   * according we have a search by ID or a search by Name to get data
   */
  function submit() {
    if (vm.selected === vm.options.findById && vm.idInput) {
      searchByReference(vm.idInput);
    } else if (vm.selected === vm.options.findByName && vm.nameInput) {
      selectPatient(vm.nameInput);
    }
  }

  /**
   * @method findBy
   *
   * @param {object} option The selected option
   *
   * @description This function is responsible for setting the selected option
   * between ID or Name option of search
   */
  function findBy(key) {
    vm.selected  = vm.options[key];
    resetState();

    // save the option for later
    cache.optionKey = key;
  }

  // Common base values that can be used to set a new search
  function resetState() {
    vm.loadStatus = null;
    delete vm.idInput;
    delete vm.nameInput;
  }

  /**
   * @method reset
   *
   * @description This function is responsible for enabling the user to input data
   * again for search by showing the inputs zones (search by ID or by name) again.
   */
  function reset() {
    resetState();
    vm.showSearchView = true;
  }

  /**
   * @method formatPatient
   *
   * @param {object} patient The patient object
   *
   * @description This function is responsible for formatting the patient name
   * to be more readable
   *
   * @returns {string} The formatted patient name
   */
  function formatPatient(p) {
    return p ? p.first_name + ' ' + p.last_name + ' ' + p.middle_name : '';
  }

  /**
   * @method selectPatient
   *
   * @param {object} patient The patient object
   *
   * @description This function is responsible for handling the result of the search,
   * display results and pass the returned patient to the parent controller
   */
  function selectPatient(patient) {
    vm.showSearchView = false;

    if (patient && typeof(patient) === 'object') {
      vm.loadStatus = 'loaded';
      vm.patient = patient;

      // parse patient metadata
      patient.name = formatPatient(patient);
      patient.sex = patient.sex.toUpperCase();

      // call the external function with patient
      vm.onSearchComplete({ patient : patient });

    } else {
      vm.loadStatus = 'error';
    }
  }

  /**
   * @method loadDefaultOption
   *
   * @param {object} key - the default option key to search by
   *
   * @description This function is responsible for changing the option of search.
   * Search by ID or by name
   */
  function loadDefaultOption(optionKey) {

    // default to findById
    optionKey = optionKey || 'findById';

    // change the findBy call
    findBy(optionKey);
  }

  /**
   * @method onKeyPress
   *
   * @param {object} event - a DOM event bubbled up to the function
   *
   * @description
   * This function capture the "Enter" key push of the user and call a function
   * to do something.
   */
  function onKeyPress(event) {

    // submit the find-patient form
    if (event.keyCode === ENTER_KEY) {
      vm.submit();

      // make sure we do not submit the parent form!
      event.preventDefault();
    }
  }
}
