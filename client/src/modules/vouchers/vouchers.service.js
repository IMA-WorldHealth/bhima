angular.module('bhima.services')
  .service('VoucherService', VoucherService);

VoucherService.$inject = [
  'PrototypeApiService', '$http', 'util', 'TransactionTypeStoreService', '$uibModal'
];

/**
 * @class VoucherService
 * @extends PrototypeApiService
 *
 * @description
 * This service manages posting data to the database via the /vouchers/ URL.  It also
 * includes some utilities that are useful for voucher pages.
 */
function VoucherService(Api, $http, util, TransactionTypeStore, Modal) {
  var service = new Api('/vouchers/');

  // @todo - remove this reference to baseUrl
  var baseUrl = '/journal/';

  service.create = create;
  service.reverse = reverse;
  service.transactionType = transactionType;
  service.openSearchModal = openSearchModal;
  service.formatFilterParameters = formatFilterParameters;

  // returns true if the key starts with an underscore
  function isInternalKey(key) {
    return key[0] === '_' || key[0] === '$';
  }

  // strips internal keys from object
  function stripInternalObjectKeys(object) {
    var o = {};

    angular.forEach(object, function (value, key) {
      if (!isInternalKey(key)) {
        o[key] = value;
      }
    });

    return o;
  }

  /**
   * Wraps the prototype create method.
   */
  function create(voucher) {

    var v = angular.copy(voucher);

    // format items for posting, removing validation keys and unlinking old objects
    v.items = v.items.map(function (item) {
      var escapedItem = stripInternalObjectKeys(item);

      if (escapedItem.entity) {
        escapedItem.entity_uuid = escapedItem.entity.uuid;
      }

      if (escapedItem.document) {
        escapedItem.document_uuid = escapedItem.document.uuid;
      }

      return escapedItem;
    });

    // we pick either the debit or the credit side to assign as the total amount
    // of the voucher
    v.amount = v.items.reduce(function (sum, row) {
      return sum + row.debit;
    }, 0);

    return Api.create.call(service, { voucher : v });
  }

  /**
   * This method facilitate annulling a transaction,
   * bhima should automatically be able to reverse
   * any transaction in the posting_journal by creating a
   * new transaction that is an exact duplicate of the original transaction with the
   * debits and credits switched.
   */
  function reverse(creditNote) {
    return $http.post(baseUrl.concat(creditNote.uuid, '/reverse'), creditNote)
      .then(util.unwrapHttpResponse);
  }

  /**
   * @function transactionType
   * @description return transaction type store object
   * @return {object} Store transaction type store object { data: array, ...}
   */
  function transactionType() {
    return TransactionTypeStore.load();
  }

  /**
   * @TODO - this should be using a standardized filter service
   */
  function formatFilterParameters(params) {
    var columns = [
      { field: 'user_id', displayName: 'FORM.LABELS.USER' },
      { field: 'reference', displayName: 'FORM.LABELS.REFERENCE' },
      { field: 'dateFrom', displayName: 'FORM.LABELS.DATE', comparitor: '>', ngFilter: 'date' },
      { field: 'dateTo', displayName: 'FORM.LABELS.DATE', comparitor: '<', ngFilter: 'date' },
      { field: 'reversed', displayName: 'FORM.INFO.ANNULLED' },
      { field: 'description', displayname: 'FORM.LABELS.DESCRIPTION' },
    ];

    // returns columns from filters
    return columns.filter(function (column) {
      var value = params[column.field];
      if (angular.isDefined(value)) {
        column.value = value;
        return true;
      } else {
        return false;
      }
    });
  }

  /**
   * @function openSearchModal
   * @description
   * This functions opens the search modal form for the voucher registry.
   */
  function openSearchModal(filters) {
    return Modal.open({
      templateUrl : 'modules/vouchers/modals/search.modal.html',
      size        : 'md',
      animation   : false,
      keyboard    : false,
      backdrop    : 'static',
      controller  : 'VoucherRegistrySearchModalController as ModalCtrl',
      resolve     : {
        filters : function filtersProvider() { return filters; },
      },
    }).result;
  }

  return service;
}
