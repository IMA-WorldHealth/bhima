angular.module('bhima.services')
  .service('CdrDepotService', CdrDepotService);

CdrDepotService.$inject = ['PrototypeApiService', 'LanguageService'];

/**
 * @class DepotService
 * @extends PrototypeApiService
 *
 * @description
 * Encapsulates common requests to the /depots/ URL.
 */
function CdrDepotService(Api, Languages) {
  const baseUrl = '/cdr_reporting/depots/';
  const service = new Api(baseUrl);

  service.getAvailableYears = () => {
    const target = baseUrl.concat('available_years');
    return service.$http.get(target)
      .then(service.util.unwrapHttpResponse);
  };

  service.getPeremptionReport = (params) => {
    const options = {
      renderer : 'html',
      lang : Languages.key,
      year : params.year,
      recompute : params.recompute,
    };
    const target = baseUrl.concat('peremption');
    return service.$http.get(target, { params : options })
      .then(service.util.unwrapHttpResponse);
  };

  service.downloadReport = (year) => {
    const responseType = 'arraybuffer';
    const pdfType = 'application/pdf';
    const options = {
      renderer : 'pdf',
      lang : Languages.key,
      year,
    };
    const target = baseUrl.concat('peremption/download');
    return service.$http.get(target, { params : options, responseType })
      .then((result) => {
        const file = new Blob([result.data], { type : pdfType });
        const fileURL = URL.createObjectURL(file);

        const fileName = `Rapport taux de peremption - ${year}.pdf`;
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.href = fileURL;
        a.download = fileName;
        a.click();
      });
  };

  return service;
}
