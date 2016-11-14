angular.module('bhima.services')
.service('reportConfigService', ReportConfigService);

ReportConfigService.$inject = ['SessionService', '$translate'];

/**
* This service essentially used the pdf report exposes an object containing common data and common function
*
* @todo Make this service much more useful with getter/setter methods for lang,
* layout, and more.  Not sure if this really needs SessionService.
*/
function ReportConfigService(sessionService, $translate) {
  var service = this;

  // TODO/FIXME -- translations
  service.configuration = {
    currency : {
      options : [
        { value : 'dollars', label : 'Dollars', key : 'UTIL.DOLLARS' },
        { value : 'francs', label : 'Francs', key : 'UTIL.FRANCS' }
      ]
    },
    format : {
      options : [
        { value : 'compact', label : 'Compact' },
        { value : 'standard', label : 'Standard' }
      ]
    },
    language : {
      options : [
        { value : 'en', label : 'English', key : 'LANGUAGES.ENGLISH' },
        { value : 'fr', label : 'French', key : 'LANGUAGES.FRENCH' }
      ]
    },
    enterprise : sessionService.enterprise,
    project : sessionService.project
  };

  return service;
}
