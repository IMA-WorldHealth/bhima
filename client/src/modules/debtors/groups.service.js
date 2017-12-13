angular.module('bhima.services')
  .service('DebtorGroupService', DebtorGroupService);

DebtorGroupService.$inject = ['$http', '$uibModal', 'util', 'SessionService', '$translate'];

/**
* Debtor Group Service
*
* This service implements CRUD operations for the /debtor_groups API endpoint
*/
function DebtorGroupService($http, Modal, util, SessionService, $translate) {
  var service = this;
  var baseUrl = '/debtor_groups/';

  /** Exposed method read */
  service.read = read;
  service.create = create;
  service.update = update;
  service.updateInvoicingFees = updateInvoicingFees;
  service.updateSubsidies = updateSubsidies;
  service.invoices = invoices;

  service.manageInvoicingFees = manageInvoicingFees;
  service.manageSubsidies = manageSubsidies;
  service.remove = remove;

  service.colors = [
    { name : $translate.instant('COLORS.AQUA'), value : '#00ffff' },
    { name : $translate.instant('COLORS.GRAY'), value : '#808080' },
    { name : $translate.instant('COLORS.FORESTGREEN'), value : '#228b22' },
    { name : $translate.instant('COLORS.LIME'), value : '#00ff00' },
    { name : $translate.instant('COLORS.RED'), value : '#ff0000' },
    { name : $translate.instant('COLORS.YELLOW'), value : '#ffff00' },
    { name : $translate.instant('COLORS.YELLOWGREEN'), value : '#9acd32' },
    { name : $translate.instant('COLORS.SLATEBLUE'), value : '#6a5acd' },
    { name : $translate.instant('COLORS.MAROON'), value :'#800000' },
    { name : $translate.instant('COLORS.CRIMSON'), value :'#dc143c' },
    { name : $translate.instant('COLORS.BLUEVIOLET'), value: '#8A2BE2' },
  ];

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
  * @method remove
  * @param {string} uuid The debtor group uuid
  * @description This function is responsible for deleting a debtor group
  */
  function remove(uuid) {
    return $http.delete(baseUrl.concat(uuid))
      .then(util.unwrapHttpResponse);
  }


  /**
   * @function updateInvoicingFees
   *
   * @description
   * Replaces a debtor groups invoicing fees subscriptions with a provided
   * set of invoicing fee IDs
   *
   * @param {string}  debtorGroupUuid   UUID of debtor group that will be updated
   * @param {Array}   subscriptions     Array of invoicing fee ids that this
   *                                    debtor group will now be subscribed to
   */
  function updateInvoicingFees(debtorGroupUuid, subscriptions) {
    var path = '/groups/debtor_group_invoicing_fee/'.concat(debtorGroupUuid);
    var options = { subscriptions : subscriptions };
    return $http.post(path, options)
      .then(util.unwrapHttpResponse);
  }

  function updateSubsidies(debtorGroupUuid, subscriptions) {
    var path = '/groups/debtor_group_subsidy/'.concat(debtorGroupUuid);
    var options = { subscriptions : subscriptions };
    return $http.post(path, options)
      .then(util.unwrapHttpResponse);
  }

  function manageInvoicingFees(debtorGroup, subscriptions) {
    return Modal.open({
      templateUrl : '/modules/debtors/subscriptions.modal.html',
      controller : 'InvoicingFeeSubscriptions as SubCtrl',
      size : 'md',
      resolve : {
        Subscriptions : function Subscriptions() { return subscriptions; },
        DebtorGroup : function DebtorGroup() { return debtorGroup; },
      },
    });
  }

  function manageSubsidies(debtorGroup, subscriptions) {
    return Modal.open({
      templateUrl : '/modules/debtors/subscriptions.modal.html',
      controller : 'SubsidySubscriptions as SubCtrl',
      size : 'md',
      resolve : {
        Subscriptions : function Subscriptions() { return subscriptions; },
        DebtorGroup : function DebtorGroup() { return debtorGroup; },
      },
    });
  }

  /**
   * @method invoices
   * @param {string} uuid The debtor group uuid
   * @param {object} parameters The query string object
   * @description This function is responsible for getting debtor groups
   */
  function invoices(uuid, parameters) {
    var url = baseUrl.concat(uuid, '/invoices');
    return $http.get(url, { params : parameters })
      .then(util.unwrapHttpResponse);
  }

  return service;
}
