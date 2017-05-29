angular.module('bhima.services')
  .service('EmployeeService', EmployeeService);

EmployeeService.$inject = ['DepricatedFilterService', '$uibModal', 'PrototypeApiService'];

/**
 * @class EmployeeService
 * @extends PrototypeApiService
 *
 * @description
 * Encapsulates common requests to the /employees/ URL.
 */
function EmployeeService(Filters, $uibModal, Api) {
  var service = new Api('/employees/');
  var filter = new Filters();
  service.formatFilterParameters = formatFilterParameters;
  service.openSearchModal = openSearchModal;

  /**
   * This function prepares the headers employee properties which were filtered,
   * Special treatment occurs when processing data related to the date
   * @todo - this might be better in it's own service
  */
  function formatFilterParameters(params) {
    var columns = [
      { field: 'display_name', displayName: 'FORM.LABELS.NAME' },
      { field: 'sex', displayName: 'FORM.LABELS.GENDER' },
      { field: 'code', displayName: 'FORM.LABELS.CODE' },
      { field: 'dateBirthFrom', displayName: 'FORM.LABELS.DOB', comparitor: '>', ngFilter:'date' },
      { field: 'dateBirthTo', displayName: 'FORM.LABELS.DOB', comparitor: '<', ngFilter:'date' },
      { field: 'dateEmbaucheFrom', displayName: 'FORM.LABELS.DATE_EMBAUCHE', comparitor: '>', ngFilter:'date' },
      { field: 'dateEmbaucheTo', displayName: 'FORM.LABELS.DATE_EMBAUCHE', comparitor: '<', ngFilter:'date' },
      { field: 'grade_id', displayName: 'FORM.LABELS.GRADE' },
      { field: 'fonction_id', displayName: 'FORM.LABELS.FUNCTION' },
      { field: 'service_id', displayName: 'FORM.LABELS.SERVICE' }
    ];


    // returns columns from filters
    return columns.filter(function (column) {
      var LIMIT_UUID_LENGTH = 6;
      var value = params[column.field];

      if (angular.isDefined(value)) {
        column.value = value;
        return true;
      } else {
        return false;
      }
    });
  }

  /**
   * @method openSearchModal
   *
   * @param {Object} params - an object of filter parameters to be passed to
   *   the modal.
   * @returns {Promise} modalInstance
   */
  function openSearchModal(params) {
    return $uibModal.open({
      templateUrl: 'modules/employees/registry/search.modal.html',
      size: 'md',
      keyboard: false,
      animation: false,
      backdrop: 'static',
      controller: 'EmployeeRegistryModalController as ModalCtrl',
      resolve : {
        params : function paramsProvider() { return params; }
      }
    }).result;
  }

  return service;
}
