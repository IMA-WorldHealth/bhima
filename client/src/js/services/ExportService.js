angular.module('bhima.services')
  .service('ExportService', ExportService);

ExportService.$inject = ['$httpParamSerializer', 'LanguageService'];

function ExportService($httpParamSerializer, Languages) {
  var service = this;

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
    var options = angular.merge(params, { lang: Languages.key });

    var link = document.getElementById(linkIdentifier || 'export');
    var queryString = $httpParamSerializer(options);
    link.download = name;
    link.href = uri.concat('?', queryString);
  }
}
