angular.module('bhima.services')
  .service('FeeCenterService', FeeCenterService);

FeeCenterService.$inject = ['PrototypeApiService', '$translate'];

function FeeCenterService(PrototypeApiService, translate) {
  let service = new PrototypeApiService('/fee_centers/');


  function formatRecord(list) {
    list.forEach(function (item) {
      item.principalState = item.is_principal === 1 ? translate.instant('FORM.LABELS.YES') : translate.instant('FORM.LABELS.NO');
    });
    return list;
  }

  service.formatRecord = formatRecord;

  return service;
}