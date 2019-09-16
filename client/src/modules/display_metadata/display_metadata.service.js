angular.module('bhima.services')
  .service('DisplayMetadataService', DisplayMetadataService);

DisplayMetadataService.$inject = ['PrototypeApiService', '$uibModal', 'moment',
  '$translate', '$httpParamSerializer', 'LanguageService'];

/**
 * @class DisplayMetadataService
 * @extends PrototypeApiService
 *
 * @description
 * Encapsulates common requests to the /display_metadata/ URL.
 */
function DisplayMetadataService(Api, Modal, moment, $translate, $httpParamSerializer, Languages) {
  const service = new Api('/display_metadata/');
  service.listSurveyformtype = listSurveyformtype;
  service.openSearchModal = openSearchModal;
  service.displayFilters = displayFilters;
  service.download = download;

  function download(opts) {
    const options = {
      renderer : opts.renderer,
      changes : opts.changes,
      lang : Languages.key,
      patient_uuid : opts.patient_uuid,
      downloadMode : true,
      data_collector_management_id : opts.data_collector_management_id,
      filterClient : opts.filterClient,
      patient : opts.patient,
    };

    // return  serialized options
    return $httpParamSerializer(options);
  }

  function listSurveyformtype() {
    const url = 'listSurveyformtype';
    return Api.read.call(service, url);
  }

  /**
   * @function openSearchModal
   * @description
   * This functions opens the search modal form for Display Metadata registry.
   */
  function openSearchModal(filters) {
    return Modal.open({
      templateUrl : 'modules/display_metadata/modals/search.modal.html',
      size : 'md',
      animation : false,
      keyboard : false,
      backdrop : 'static',
      controller : 'DisplayMetadataSearchModalController as $ctrl',
      resolve : {
        filters : function filtersProvider() { return filters; },
      },
    }).result;
  }

  function displayFilters(survey, search) {
    let filters = ``;
    const surveyMap = new Map(survey.map(item => ([item.name, item])));
    const dateLabel = $translate.instant('FORM.LABELS.DATE');

    if (search.searchDateFrom) {
      const dateFromLength = Object.keys(search.searchDateFrom).length;
      if (dateFromLength) {
        Object.keys(search.searchDateFrom).forEach((key) => {
          if (key === 'dateSurvey') {
            filters += ` // ( ${dateLabel} [${moment(search.searchDateFrom[key]).format('DD MMM YYYY')}
            - ${moment(search.searchDateTo[key]).format('DD MMM YYYY')}])`;
          }

          const item = surveyMap.get(key);
          if (item) {
            filters += ` // ( ${item.label} [${moment(search.searchDateFrom[key]).format('DD MMM YYYY')}
            - ${moment(search.searchDateTo[key]).format('DD MMM YYYY')}])`;
          }
        });
      }
    }

    if (search.loggedChanges) {
      search.loggedChanges.forEach(element => {
        const item = surveyMap.get(element.key);
        if (item) {
          filters += ` // ${item.label} : ${element.value} `;
        }
      });
    }

    if (search.multipleChoice) {
      const multipleChoiceLength = Object.keys(search.multipleChoice).length;
      if (multipleChoiceLength) {
        Object.keys(search.multipleChoice).forEach((key) => {
          const item = surveyMap.get(key);
          if (item) {
            let multiChoice = '';
            for (let i = 0; i < search.multipleChoice[key].length; i++) {
              multiChoice += ` ${search.multipleChoice[key][i]}, `;
            }

            filters += ` // ${item.label} : ( ${multiChoice} )`;
          }
        });
      }
    }

    return filters;
  }

  return service;
}
