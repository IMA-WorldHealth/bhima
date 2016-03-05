angular.module('bhima.directives')
.component('bhFindPatient', {
  controller: FindPatientComponent,
  templateUrl : 'partials/templates/bhFindPatient.tmpl.html',
  bindings: {
    onSearchComplete: '&',  // bind callback
    type:             '@',  // bind string
    required:         '<',  // bind the required
  }
});

FindPatientComponent.$inject = ['Patients', 'AppCache'];

/**
 * The Find Patient Component
 *
 * This component allows a user to serach for a patient by either the
 * patient identifier (Project Abbreviation + Reference) or by typeahead on patient
 * name.
 *
 * The typeahead loads data as your type into the input box, pinging th URL
 * /patient/search/?name={string} The HTTP endpoints sends back 20 results
 * which are presented to the user.
 *
 * SUPPORTED ATTRIBUTES:
 *   - type : which take one of these values (inline or panel) (default: inline)
 *   - on-search-complete : the callback function which get the returned patient
 */
function FindPatientComponent(Patients, AppCache) {
  var vm = this;

  /** cache to remember which the search type of the component */
  var cache = AppCache('FindPatientComponent');

  /** @const the max number of records to fetch from the server */
  var LIMIT = 20;

  /** supported searches: by name or by id */
  vm.options = {
    findById : {
      'label' : 'FIND.PATIENT_ID',
      'placeholder' : 'FIND.SEARCH_PATIENT_ID'
    },
    findByName : {
      'label' : 'FIND.PATIENT_NAME',
      'placeholder' : 'FIND.SEARCH_NAME'
    }
  };

  vm.timestamp      = new Date();
  vm.showSearchView = true;
  vm.loadStatus     = null;
  vm.validInput     = false;

  /** Expose functions and variables to the template view */
  vm.searchByReference  = searchByReference;
  vm.searchByName       = searchByName;
  vm.formatPatient      = formatPatient;
  vm.selectPatient      = selectPatient;
  vm.validateNameSearch = validateNameSearch;
  vm.submit             = submit;
  vm.findBy             = findBy;
  vm.reload             = reload;
  vm.readInput          = readInput;

  /** fetch the initial setting for the component from appcache */
  loadDefaultOption(cache.optionKey);

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
      limit : LIMIT
    };

    // query the patient's search endpoint for the
    // reference
    Patients.search(options)
    .then(function (patients) {
      selectPatient(patients[0]);
    })
    .catch(handler);
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
    vm.selected   = vm.options[key];
    vm.loadStatus = null;
    vm.idInput    = undefined;
    vm.nameInput  = undefined;

    // save the option for later
    cache.optionKey = key;
  }

  /**
  * @method reload
  *
  * @description This function is responsible for enabling the user to input data
  * again for search by showing the inputs zones (search by ID or by name) again.
  */
  function reload() {
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
  * @method handler
  *
  * @param {object} error The error object
  *
  * @description This function is responsible for handling errors which occurs
  * and notify the client into the console
  */
  function handler(error) {
    throw error;
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
  * @method validateNameSearch
  *
  * @param {string} value The patient reference ID or name
  *
  * @description Check if the value in the inputs is correct (well defined)
  */
  function validateNameSearch(value) {
    vm.validInput = angular.isDefined(value);

    // Update the nofication
    if (!vm.validInput) {
      vm.loadStatus = null;
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
  * @method readInput
  *
  * @param {object} event An Event object
  *
  * @description This function capture the "Enter" key push of the user and
  * call a function to do something
  */
  function readInput(event) {

    // submit the find-patient form
    if (event.keyCode === 13) {
      submit();

      // make sure we do not submit the parent form!
      event.preventDefault();
    }
  }
}
