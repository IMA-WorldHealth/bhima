angular.module('bhima.services')
  .service('CashService', CashService);

CashService.$inject = [
  '$uibModal', 'PrototypeApiService', 'ExchangeRateService', 'SessionService', 'moment', '$translate',
  'FilterService', 'appcache', 'PeriodService', 'LanguageService', '$httpParamSerializer'
];

/**
 * @class CashService
 * @extends PrototypeApiService
 *
 * @description
 * A service to interact with the server-side /cash API.
 */
function CashService(Modal, Api, Exchange, Session, moment, $translate, Filters, AppCache, Periods, Languages, $httpParamSerializer) {
  var service = new Api('/cash/');
  var dashboard = new Api('/dashboard/cash_payment');

  var urlCheckin = '/cash/checkin/';

  var cashFilters = new Filters();
  var filterCache = new AppCache('cash-filters');

  // bind other api
  service.dashboard = dashboard;

  // custom methods
  service.create = create;
  service.calculateDisabledIds = calculateDisabledIds;
  service.formatCashDescription = formatCashDescription;
  service.openCancelCashModal = openCancelCashModal;
  service.checkCashPayment = checkCashPayment;
  service.filters = cashFilters;

  /**
   * Cash Payments can be made to multiple invoices.  This function loops
   * though the invoices in selected order, allocating the global amount to each
   * invoice until it is decimated.
   */
  function allocatePaymentAmounts(data) {
    // default to an empty array if necessary -- the server will throw an error
    var items = (data.invoices || [])

    // loop through the invoices, allocating a sum to the invoice until there
    // is no more left to allocate.
      .map(function (invoice) {
        return { invoice_uuid: invoice.uuid };
      });

    return items;
  }

  /**
   * @method create
   *
   * @description
   * Creates a cash payment from a JSON passed from a form.
   *
   * @param {object} data A JSON object containing the cash payment record defn
   * @returns {object} payment A promise resolved with the database uuid.
   */
  function create(payment) {
    // create a temporary copy to send to the server
    var data = angular.copy(payment);

    // ensure that the caution flag is a Number
    data.is_caution = Number(data.is_caution);

    // process the invoice item, allocating costs to each of them
    if (data.is_caution === 0) {
      data.items = allocatePaymentAmounts(data);
    }

    // remove data.invoices property before submission to the server
    delete data.invoices;

    // call the prototype create method with the formatted data
    return Api.create.call(service, { payment: data });
  }

  /*
   * Nicely format the cash payment description
   */
  function formatCashDescription(patient, payment) {
    var isCaution = payment.is_caution;

    // invoice references
    var invoicesReferences = payment.invoices.map(function (invoice) {
      return invoice.reference;
    });

    // this must be semicolons, otherwise the CSV file breaks.
    var referencesString = invoicesReferences.join('; ');

    var tmpl = isCaution ? 'CASH.PREPAYMENT_DESCRIPTION' : 'CASH.PAYMENT_DESCRIPTION';

    return $translate.instant(tmpl, {
      patientName       : patient.display_name,
      invoiceReferences : referencesString,
      patientReference  : patient.reference,
      amount            : payment.amount,
    });
  }

  /**
   * @method calculateDisabledIds
   *
   * @description
   * For a given cashbox, determine which currencies should be unsupported and
   * therefore disabled from selection.
   *
   * @param {Object} cashbox - the cashbox to read from.
   * @param {Array} currencies - a list of application currencies
   * @returns {Array} - the array of currency ids to disable
   */
  function calculateDisabledIds(cashbox, currencies) {
    // collect cashbox ids in an array
    var cashboxCurrencyIds = cashbox.currencies.reduce(function (array, currency) {
      return array.concat(currency.currency_id);
    }, []);

    // find all ids that are not cashbox ids, to disable them
    var disabledCurrencyIds = currencies.reduce(function (array, currency) {
      var bool = (cashboxCurrencyIds.indexOf(currency.id) === -1);
      return array.concat(bool ? currency.id : []);
    }, []);

    return disabledCurrencyIds;
  }

  cashFilters.registerDefaultFilters([
    { key : 'period', label : 'TABLE.COLUMNS.PERIOD', valueFilter : 'translate' },
    { key : 'custom_period_start', label : 'PERIODS.START', valueFilter : 'date', comparitor : '>' },
    { key : 'custom_period_end', label : 'PERIODS.END', valueFilter : 'date', comparitor : '<' },
    { key : 'limit', label : 'FORM.LABELS.LIMIT' }]);

  cashFilters.registerCustomFilters([
    { key : 'is_caution', label : 'FORM.LABELS.CAUTION' },
    { key : 'cashbox_id', label : 'FORM.LABELS.CASHBOX' },
    { key : 'debtor_uuid', label : 'FORM.LABELS.CLIENT' },
    { key : 'user_id', label : 'FORM.LABELS.USER' },
    { key : 'reference', label : 'FORM.LABELS.REFERENCE' },
    { key : 'dateFrom', label : 'FORM.LABELS.DATE_FROM', comparitor : '>', valueFilter : 'date' },
    { key : 'dateTo', label : 'FORM.LABELS.DATE_TO', comparitor : '<', valueFilter : 'date' },
    { key : 'currency_id', label : 'FORM.LABELS.CURRENCY' },
    { key : 'reversed', label : 'CASH.REGISTRY.REVERSED_RECORDS' },
    { key : 'patientReference', label : 'FORM.LABELS.REFERENCE_PATIENT' },
    { key : 'defaultPeriod', label : 'TABLE.COLUMNS.PERIOD', valueFilter : 'translate' },
    { key : 'invoiceReference', label : 'FORM.LABELS.INVOICE' },
    { key : 'debtor_group_uuid', label : 'FORM.LABELS.DEBTOR_GROUP' },
    { key : 'invoice_uuid', label : 'FORM.LABELS.INVOICE' }]);

  if (filterCache.filters) {
    // load cached filter definition if it exists
    cashFilters.loadCache(filterCache.filters);
  }

  // once the cache has been loaded - ensure that default filters are provided appropriate values
  assignDefaultFilters();

  function assignDefaultFilters() {
    // get the keys of filters already assigned - on initial load this will be empty
    var assignedKeys = Object.keys(cashFilters.formatHTTP());

    // assign default period filter
    var periodDefined =
      service.util.arrayIncludes(assignedKeys, ['period', 'custom_period_start', 'custom_period_end']);

    if (!periodDefined) {
      cashFilters.assignFilters(Periods.defaultFilters());
    }

    // assign default limit filter
    if (assignedKeys.indexOf('limit') === -1) {
      cashFilters.assignFilter('limit', 100);
    }
  }

  service.removeFilter = function removeFilter(key) {
    cashFilters.resetFilterState(key);
  };

  // load filters from cache
  service.cacheFilters = function cacheFilters() {
    filterCache.filters = cashFilters.formatCache();
  };

  service.loadCachedFilters = function loadCachedFilters() {
    cashFilters.loadCache(filterCache.filters || {});
  };

  // downloads a the registry as a given type (pdf, csv)
  service.download = function download(type) {
    var filterOpts = cashFilters.formatHTTP();
    var defaultOpts = { renderer : type, lang : Languages.key };

    // combine options
    var options = angular.merge(defaultOpts, filterOpts);

    // return  serialized options
    return $httpParamSerializer(options);
  };

  /**
   * @desc checkCashPayment the invoice from the database
   * @param {String} invoiceUuid, is the uuid of invoice
   * @example
   * service.checkCashPayment(invoiceUuid)
   * .then(function (res){
   *   your code here
   *  });
   */
  function checkCashPayment(invoiceUuid) {
    var url = urlCheckin + invoiceUuid;
    return service.$http.get(url)
      .then(service.util.unwrapHttpResponse);
  }

  // open a dialog box to Cancel Cash Payment
  function openCancelCashModal(invoice) {
    return Modal.open({
      templateUrl : 'modules/cash/modals/modal-cancel-cash.html',
      resolve     : { data : { invoice : invoice } },
      size        : 'md',
      animation   : false,
      keyboard    : false,
      backdrop    : 'static',
      controller  : 'ModalCancelCashController as ModalCtrl',
    }).result;
  }

  return service;
}
