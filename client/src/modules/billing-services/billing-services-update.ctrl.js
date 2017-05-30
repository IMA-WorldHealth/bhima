angular.module('bhima.controllers')
.controller('BillingServicesUpdateController', BillingServicesUpdateController);

BillingServicesUpdateController.$inject = [
  '$state', 'BillingServicesService', '$uibModalInstance', 'util', 'appcache'
];

/**
 * Updates a billing service passed in via a URL parameter.  For example,
 * billing_services/1 will update the billing service with id 1.
 *
 * Importantly, both this controller and the BillingServicesUpdateController
 * use the same template, billing-services/form.html.
 */
function BillingServicesUpdateController($state, BillingServices, ModalInstance, util, AppCache) {
  var vm = this;
  var cache = AppCache('BillingServices');

  if($state.params.id){
    vm.stateParams = cache.stateParams = $state.params;
  } else {
    vm.stateParams = cache.stateParams;
  }  

  // the form title is defined in the JS to allow us to reuse templates
  vm.title = 'BILLING_SERVICES.FORM.UPDATE';

  // the label will contain a copy of the billing service's label we are updating
  vm.label = '';

  // this is the BillingServicesForm's model
  vm.model = {};

  // the submit method to POST data to the server
  vm.submit = submit;
  vm.dismiss = ModalInstance.dismiss;

  vm.length200 = util.length200;
  vm.maxLength = util.maxTextLength;

  vm.onSelectAccount = onSelectAccount;

  // bhAccountSelect callback
  function onSelectAccount(account) {
    vm.model.account_id = account.id;
  }

  // fired on application startup
  function startup() {

    // load the billing service by id
    BillingServices.read(vm.stateParams.id)
      .then(function (service) {

        // set the label to the label of the fetched service
        vm.label = service.label;

        // bind the fetched data to the form for editing
        vm.model = service;
      })
      .catch(function (response) {
        vm.error = response.data;
      });
  }

  /**
   * submits the form to the server.  If the form does not pass angular form
   * validation, the function will immediately exit.
   *
   * @param {Object} form - the BillingServicesForm object
   * @returns {Promise} promise - the $http promise from the BillingServiceService's
   *   update() method
   */
  function submit(form) {

    // remove any previously attached messages
    delete vm.error;

    // exit immediately if the form is not valid
    if (form.$invalid) {
      return;
    }

     // submit data to the server
    return BillingServices.update(vm.stateParams.id, vm.model)
      .then(function (data) {
        ModalInstance.close(data.id);
      })
      .catch(function (response) {
        vm.error = response.data;
      });
  }

  // load initial data from the server
  startup();
}
