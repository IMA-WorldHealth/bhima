angular.module('bhima.services')
  .service('DebtorGroupService', DebtorGroupService);

DebtorGroupService.$inject = [
  '$uibModal', 'SessionService', '$translate', 'PrototypeApiService',
];

/**
* Debtor Group Service
*
* This service implements CRUD operations for the /debtor_groups API endpoint
*/
function DebtorGroupService(Modal, Session, $translate, Api) {
  const baseUrl = '/debtor_groups/';
  const service = new Api(baseUrl);

  /** Exposed method read */
  service.create = create;
  service.update = update;
  service.updateInvoicingFees = updateInvoicingFees;
  service.updateSubsidies = updateSubsidies;
  service.invoices = invoices;
  service.remove = service.delete;

  service.manageInvoicingFees = manageInvoicingFees;
  service.manageSubsidies = manageSubsidies;

  service.colors = [
    { name : $translate.instant('COLORS.AQUA'), value : '#00ffff' },
    { name : $translate.instant('COLORS.GRAY'), value : '#808080' },
    { name : $translate.instant('COLORS.FORESTGREEN'), value : '#228b22' },
    { name : $translate.instant('COLORS.LIME'), value : '#00ff00' },
    { name : $translate.instant('COLORS.RED'), value : '#ff0000' },
    { name : $translate.instant('COLORS.YELLOW'), value : '#ffff00' },
    { name : $translate.instant('COLORS.YELLOWGREEN'), value : '#9acd32' },
    { name : $translate.instant('COLORS.SLATEBLUE'), value : '#6a5acd' },
    { name : $translate.instant('COLORS.MAROON'), value : '#800000' },
    { name : $translate.instant('COLORS.CRIMSON'), value : '#dc143c' },
    { name : $translate.instant('COLORS.BLUEVIOLET'), value : '#8A2BE2' },
  ];

  /**
  * @method create
  * @param {object} debtorGroup The debtor group object
  * @description This function is responsible for create new debtor group
  */
  function create(debtorGroup) {

    // augment object with session values
    /** @todo standardise throughout services/ APIs where this information is populated; client vs. server */
    debtorGroup.enterprise_id = Session.enterprise.id;

    return service.$http.post(baseUrl, debtorGroup)
      .then(service.util.unwrapHttpResponse);
  }

  /**
  * @method update
  * @param {string} uuid The debtor group uuid
  * @param {object} debtorGroup The debtor group object
  * @description This function is responsible for updating a debtor group
  */
  function update(uuid, debtorGroup) {
    const url = baseUrl.concat(uuid);

    // ensure we are never sending a UUID to update
    delete debtorGroup.uuid;

    return service.$http.put(url, debtorGroup)
      .then(service.util.unwrapHttpResponse);
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
    const path = '/groups/debtor_group_invoicing_fee/'.concat(debtorGroupUuid);
    const options = { subscriptions };
    return service.$http.post(path, options)
      .then(service.util.unwrapHttpResponse);
  }

  function updateSubsidies(debtorGroupUuid, subscriptions) {
    const path = '/groups/debtor_group_subsidy/'.concat(debtorGroupUuid);
    const options = { subscriptions };
    return service.$http.post(path, options)
      .then(service.util.unwrapHttpResponse);
  }

  function manageInvoicingFees(debtorGroup, subscriptions) {
    return Modal.open({
      templateUrl : '/modules/debtors/subscriptions.modal.html',
      controller : 'InvoicingFeeSubscriptions as SubCtrl',
      size : 'md',
      resolve : {
        Subscriptions : () => subscriptions,
        DebtorGroup : () => debtorGroup,
      },
    });
  }

  function manageSubsidies(debtorGroup, subscriptions) {
    return Modal.open({
      templateUrl : '/modules/debtors/subscriptions.modal.html',
      controller : 'SubsidySubscriptions as SubCtrl',
      size : 'md',
      resolve : {
        Subscriptions : () => subscriptions,
        DebtorGroup : () => debtorGroup,
      },
    });
  }

  /**
   * @method invoices
   * @param {string} uuid The debtor group uuid
   * @param {object} parameters The query string object
   * @description This function is responsible for getting debtor group invoices
   */
  function invoices(uuid, parameters) {
    const url = `${baseUrl}${uuid}/invoices`;
    return service.$http.get(url, { params : parameters })
      .then(service.util.unwrapHttpResponse);
  }

  return service;
}
