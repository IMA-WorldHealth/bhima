angular.module('bhima.services')
.service('DebtorGroupService', DebtorGroupService);

DebtorGroupService.$inject = ['$http', '$uibModal', 'util', 'SessionService'];

/**
* Debtor Group Service
*
* This service implements CRUD operations for the /debtor_groups API endpoint
*/
function DebtorGroupService($http, Modal, util, SessionService) {
  var service = this;
  var baseUrl = '/debtor_groups/';

  /** Exposed method read */
  service.read = read;
  service.create = create;
  service.update = update;
  service.updateBillingServices = updateBillingServices;

  service.manageSubscriptions = manageSubscriptions;

  /**
  * @method read
  * @param {string} uuid The debtor group uuid
  * @param {object} parameters The query string object
  * @description This function is responsible for getting debtor groups
  */
  function read(uuid, parameters) {
    var url = baseUrl.concat(uuid || '');
    return $http.get(url, { params : parameters })
    .then(util.unwrapHttpResponse);
  }

  /**
  * @method create
  * @param {object} debtorGroup The debtor group object
  * @description This function is responsible for create new debtor group
  */
  function create(debtorGroup) {

    // augment object with session values
    /** @todo standardise throughout services/ APIs where this information is populated; client vs. server */
    debtorGroup.enterprise_id = SessionService.enterprise.id;

    return $http.post(baseUrl, debtorGroup)
    .then(util.unwrapHttpResponse);
  }

  /**
  * @method update
  * @param {string} uuid The debtor group uuid
  * @param {object} debtorGroup The debtor group object
  * @description This function is responsible for updating a debtor group
  */
  function update(uuid, debtorGroup) {
    var url = baseUrl.concat(uuid);

    // ensure we are never sending a UUID to update
    delete debtorGroup.uuid;

    return $http.put(url, debtorGroup)
    .then(util.unwrapHttpResponse);
  }

  /**
   * @function updateBillingServices
   *
   * @description
   * Replaces a debtor groups billing services subscriptions with a provided
   * set of billing service IDs
   *
   * @param {string}  debtorGroupUuid   UUID of debtor group that will be updated
   * @param {Array}   subscriptions     Array of billing service ids that this
   *                                    debtor group will now be subscribed to
   */
  function updateBillingServices(debtorGroupUuid, subscriptions) {
    var path = '/groups/debtor_group_billing_service/'.concat(debtorGroupUuid);
    var options = { subscriptions : subscriptions };
    return $http.post(path, options)
      .then(util.unwrapHttpResponse);
  }

  function manageSubscriptions(debtorGroup, subscriptions) {

    return Modal.open({
      templateUrl : '/partials/debtors/subscriptions.modal.html',
      controller : 'ChargeSubscriptions as SubCtrl',
      size : 'md',
      resolve : {
        Subscriptions : function Subscriptions() {
          return subscriptions;
        },
        DebtorGroup : function DebtorGroup() {
          return debtorGroup;
        }
      }
    });
  }

  return service;
}
