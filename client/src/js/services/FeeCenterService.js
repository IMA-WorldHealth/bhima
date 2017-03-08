angular.module('bhima.services')
  .service('FeeCenterService', FeeCenterService);

FeeCenterService.$inject = ['PrototypeApiService', '$translate'];

function FeeCenterService(PrototypeApiService, translate) {
  const baseUrl = '/fee_centers/';
  let service = new PrototypeApiService(baseUrl);

  function formatRecord(list) {
    list.forEach(function (item) {
      item.principalState = item.is_principal === 1 ? translate.instant('FORM.LABELS.YES') : translate.instant('FORM.LABELS.NO');
    });
    return list;
  }

  //Gives the value of the fee center result

  function getFeeValue(feeId) {
    var url = baseUrl + feeId + '/value';
    return service.$http.get(url)
      .then(service.util.unwrapHttpResponse);
  }

  service.formatRecord = formatRecord;
  service.getFeeValue = getFeeValue;

  return service;
}
