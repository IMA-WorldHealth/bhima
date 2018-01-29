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
  var service = new Api('/general_ledger/');

  service.accounts = new Api('/general_ledger/accounts');

  service.download = download;
  service.openAccountReport = openAccountReport;

  function download(type, filters) {
    var filterOpts = filters;
    var defaultOpts = { renderer : type, lang : Languages.key };

    // combine options
    var options = angular.merge(defaultOpts, filterOpts);

    // return  serialized options
    return $httpParamSerializer(options);
  }

  function openAccountReport(options) {
    var defaultOpts = {
      lang : Languages.key,
      currency_id : Session.enterprise.currency_id,
    };

    // combine options
    var opts = angular.merge(defaultOpts, options);

    // return serialized options
    return $httpParamSerializer(opts);
  }

  return service;
}
