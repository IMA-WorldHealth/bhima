angular.module('bhima.services')
  .service('GeneralLedgerService', GeneralLedgerService);

GeneralLedgerService.$inject = [
  'PrototypeApiService', '$httpParamSerializer', 'LanguageService',
  'SessionService',
];

/**
 * General Ledger Service
 * This service is responsible of all process with the General ledger
 */
function GeneralLedgerService(Api, $httpParamSerializer, Languages, Session) {
  const service = new Api('/general_ledger/');

  service.download = download;
  service.openAccountReport = openAccountReport;

  function download(type, filters, label) {
    const filterOpts = filters;
    filters.fiscal_year_label = label;
    const defaultOpts = { renderer : type, lang : Languages.key };

    // combine options
    const options = angular.merge(defaultOpts, filterOpts);

    // return  serialized options
    return $httpParamSerializer(options);
  }

  function openAccountReport(options) {
    const defaultOpts = {
      lang : Languages.key,
      currency_id : Session.enterprise.currency_id,
    };

    // combine options
    const opts = angular.merge(defaultOpts, options);

    // return serialized options
    return $httpParamSerializer(opts);
  }

  // GET /general_ledger/aggregates
  service.aggregates = (params) => service.read.call({ url : service.url.concat('aggregates') }, null, params);

  // GET /general_ledger/transactions
  service.transactions = (params) =>
    service.read.call({ url : service.url.concat('transactions') }, null, params);

  return service;
}
