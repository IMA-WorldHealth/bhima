angular.module('bhima.services')
  .service('GeneralLedgerService', GeneralLedgerService);

// Dependencies injection
GeneralLedgerService.$inject = ['PrototypeApiService', '$httpParamSerializer', 'LanguageService'];

/**
 * General Ledger Service
 * This service is responsible of all process with the General ledger
 */
function GeneralLedgerService(Api, $httpParamSerializer, Languages) {
  var service = new Api('/general_ledger/');

  service.accounts = new Api('/general_ledger/accounts');
  service.download = download;
  service.slip = slip;

  function download(type, filters) {
    var filterOpts = filters;
    var defaultOpts = { renderer : type, lang : Languages.key };

    // combine options
    var options = angular.merge(defaultOpts, filterOpts);

    // return  serialized options
    return $httpParamSerializer(options);
  }

  function slip(type, filters, account){
    var filterOpts = filters;
    var defaultOpts = { renderer : type, lang : Languages.key, account_id : account, source : 3};
    // combine options
    var options = angular.merge(defaultOpts, filterOpts);
    // return  serialized options
    return $httpParamSerializer(options);
  }


  return service;
}

