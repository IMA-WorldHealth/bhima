angular.module('bhima.services')
  .service('SurveyFormService', SurveyFormService);

SurveyFormService.$inject = ['PrototypeApiService'];

/**
 * @class SurveyFormService
 * @extends PrototypeApiService
 *
 * @description
 * Encapsulates common requests to the /survey_form/ URL.
 */
function SurveyFormService(Api) {
  const service = new Api('/survey_form/');
  service.listSurveyformtype = listSurveyformtype;

  function listSurveyformtype() {
    const url = ''.concat('listSurveyformtype');
    return Api.read.call(service, url);
  }

  return service;
}
