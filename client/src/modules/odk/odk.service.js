angular.module('bhima.services')
  .service('OdkService', OdkService);

OdkService.$inject = ['PrototypeApiService'];

function OdkService(Api) {
  const baseUrl = '/odk/central';
  const service = new Api(baseUrl);
  const FORM_ID = 'pcima_pv_reception';

  service.loadNutritionReceptions = loadNutritionReceptions;

  function loadNutritionReceptions() {
    const url = baseUrl.concat(`/forms/${FORM_ID}`);
    return service.$http.get(url)
      .then(service.util.unwrapHttpResponse);
  }

  return service;
}
