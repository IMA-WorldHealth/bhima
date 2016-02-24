angular.module('bhima.directives')
.component('bhFindSupplier', {
  controller: FindSupplierComponent,
  templateUrl : 'partials/templates/bhFindSupplier.tmpl.html',
  bindings: {
    onSearchComplete: '&',  // bind callback
    type:             '@',  // bind string
    required:         '<',  // bind the required
  }
});

FindSupplierComponent.$inject = ['SupplierService', 'appcache'];

/**
 * The Find Supplier Component
 *
 * This component allows a user to serach for a supplier by either the
 * supplier identifier (Project Abbreviation + Reference) or by typeahead on supplier
 * name.
 *
 * The typeahead loads data as your type into the input box, pinging th URL
 * /supplier/search/?name={string} The HTTP endpoints sends back 20 results
 * which are presented to the user.
 *
 * SUPPORTED ATTRIBUTES:
 *   - type : which take one of these values (inline or panel) (default: inline)
 *   - on-search-complete : the callback function which get the returned supplier
 */
function FindSupplierComponent(SupplierService, AppCache) {
  var vm = this;

  /** cache to remember which the search type of the component */
  var cache = new AppCache('FindSupplierComponent');

  /** @const the max number of records to fetch from the server */
  var LIMIT = 20;

  /** supported searches: by name or by id */
  vm.options = {
    findByName : {
      'label' : 'FIND.SUPPLIER_NAME',
      'placeholder' : 'FIND.SEARCH_NAME'
    }
  };

  vm.timestamp      = new Date();
  vm.showSearchView = true;
  vm.loadStatus     = null;
  vm.validInput     = false;

  /** Expose functions and variables to the template view */
  vm.searchByName       = searchByName;
  vm.selectSupplier      = selectSupplier;

  vm.validateNameSearch = validateNameSearch;
  vm.findBy             = findBy;
  vm.reload             = reload;
  vm.readInput          = readInput;

  /** fetch the initial setting for the component from appcache */
  cache.fetch('optionKey')
  .then(loadDefaultOption);


  /**
  * @method searchByName
  *
  * @param {string} text Supplier name (first_name, middle_name or last_name)
  *
  * @description This function make a call to BHIMA API for getting suppliers
  * according the name of supplier.
  *
  * @return {Array} An array of suppliers
  */
  function searchByName(text) {
    vm.loadStatus = 'loading';

    // format query string parameters
    var options = {
      name : text.toLowerCase(),
      limit : LIMIT
    };

    return SupplierService.filter(options)
    .then(function (suppliers) {
      // loop through each
      suppliers.forEach(function (supplier) {
        supplier.label = supplier.name;
      });

      return suppliers;
    });
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
    cache.put('optionKey', key);
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
  * @method formatSupplier
  *
  * @param {object} Supplier The supplier object
  *
  * @description This function is responsible for formatting the supplier name
  * to be more readable
  *
  * @returns {string} The formatted supplier name
  */
  function formatSupplier(p) {
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
  * @method selectSupplier
  *
  * @param {object} supplier The supplier object
  *
  * @description This function is responsible for handling the result of the search,
  * display results and pass the returned supplier to the parent controller
  */
  function selectSupplier(supplier) {
    vm.showSearchView = false;

    if (supplier && typeof(supplier) === 'object') {
      vm.loadStatus = 'loaded';
      vm.supplier = supplier;

      // call the external function with supplier
      vm.onSearchComplete({ supplier : supplier });

    } else {
      vm.loadStatus = 'error';
    }
  }

  /**
  * @method validateNameSearch
  *
  * @param {string} value The supplier reference name
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
    if (event.keyCode === 13) {
      submit();
    }
  }

}
