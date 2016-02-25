angular.module('bhima.components')
.component('bhFindSupplier', {
  controller: FindSupplierComponent,
  templateUrl : 'partials/templates/bhFindSupplier.tmpl.html',
  bindings: {
    onSearchComplete: '&',  // bind callback
    required:         '<',  // bind the required
  }
});

FindSupplierComponent.$inject = ['SupplierService'];

/**
 * The Find Supplier Component
 *
 * This component allows a user to search for a name
 *
 */
function FindSupplierComponent(SupplierService) {
  var vm = this;

  /** @const the max number of records to fetch from the server */
  var LIMIT = 20;

  vm.showSearchView = true;
  vm.loadStatus     = null;
  vm.validInput     = false;

  /** Expose functions and variables to the template view */
  vm.searchByName       = searchByName;
  vm.selectSupplier      = selectSupplier;

  vm.reload             = reload;
  vm.readInput          = readInput;


  /**
  * @method searchByName
  *
  * @param {string} text Supplier name 
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

    return SupplierService.search(options)
    .then(function (suppliers) {
      return suppliers;
    });
  }

  /**
  * @method reload
  *
  * @description This function is responsible for enabling the user to input data
  * again for search by showing the inputs zones again.
  */
  function reload() {
    vm.showSearchView = true;
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
      event.preventDefault();
    }
  }

}
