angular.module('bhima.services')
  .service('ExportService', ExportService);

ExportService.$inject = ['$httpParamSerializer', 'LanguageService'];

function ExportService($httpParamSerializer, Languages) {
  const service = this;

  // expose the service
  service.download = download;

  /**
   * @method download
   * @param {string} uri
   * @param {object} params
   * @param {string} name
   * @param {string} linkIdentifier
   */
  function download(uri, params, name, linkIdentifier) {
    const options = angular.merge(params, { lang : Languages.key });

    const link = document.getElementById(linkIdentifier || 'export');
    const queryString = $httpParamSerializer(options);
    link.download = name;
    link.href = uri.concat('?', queryString);
  }
}
