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

  function download(type, changes, id, filterClient, patientUuid, patient) {
    const options = {
      renderer : type,
      changes,
      lang : Languages.key,
      patient_uuid : patientUuid || null,
      downloadMode : true,
      data_collector_management_id : id,
      filterClient,
      patient,
    };

    // return  serialized options
    return $httpParamSerializer(options);
  }

  function listSurveyformtype() {
    const url = ''.concat('listSurveyformtype');
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
    const dateLabel = $translate.instant('FORM.LABELS.DATE');

    if (search.searchDateFrom) {
      const dateFromLength = Object.keys(search.searchDateFrom).length;
      if (dateFromLength) {
        Object.keys(search.searchDateFrom).forEach((key) => {
          if (key === 'dateSurvey') {
            filters += ` // ( ${dateLabel} [${moment(search.searchDateFrom[key]).format('DD MMM YYYY')}
            - ${moment(search.searchDateTo[key]).format('DD MMM YYYY')}])`;
          }

          survey.forEach(item => {
            if (item.name === key) {
              filters += ` // ( ${item.label} [${moment(search.searchDateFrom[key]).format('DD MMM YYYY')}
                - ${moment(search.searchDateTo[key]).format('DD MMM YYYY')}])`;
            }
          });
        });
      }
    }

    if (search.loggedChanges) {
      search.loggedChanges.forEach(element => {
        survey.forEach(item => {
          if (item.name === element.key) {
            filters += ` // ${item.label} : ${element.value} `;
          }
        });
      });
    }

    if (search.multipleChoice) {
      const multipleChoiceLength = Object.keys(search.multipleChoice).length;
      if (multipleChoiceLength) {
        Object.keys(search.multipleChoice).forEach((key) => {
          survey.forEach(item => {
            if (item.name === key) {
              let multiChoice = '';
              for (let i = 0; i < search.multipleChoice[key].length; i++) {
                multiChoice += ` ${search.multipleChoice[key][i]}, `;
              }

              filters += ` // ${item.label} : ( ${multiChoice} )`;
            }
          });
        });
      }
    }

    return filters;
  }

  return service;
}
