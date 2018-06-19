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

  service.accounts = new Api('/general_ledger/accounts');

  service.download = download;
  service.openAccountReport = openAccountReport;

  function download(type, filters) {
    const filterOpts = filters;
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

  return service;
}
