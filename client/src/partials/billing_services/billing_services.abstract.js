angular.module('bhima.controllers')
.controller('BillingServicesController', BillingServicesController);

BillingServicesController.$inject = [ '$state' ];

/**
 * Billing Services Controller
 * 
 * This is the top-level controller for billing services.  It is located in
 * the abstract `billingServices` state.
 *
 * This controller exists to manage the headercrumb's links and activation
 * states.
 */
function BillingServicesController($state) {
  this.$state = $state;
}
