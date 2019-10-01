angular.module('bhima.controllers')
  .controller('CountryController', CountryController);

CountryController.$inject = [
  'LocationService', 'util', 'NotifyService',
  '$uibModal', 'ModalService', 'uiGridConstants',
];

function CountryController(locationService, util, Notify, $uibModal, Modal, uiGridConstants) {
  const vm = this;
  vm.session = {};
  vm.view = 'default';

  // bind methods
  vm.countryLength = util.length45;

  // fired on startup
  function startup() {
    // start up loading indicator
    vm.session.loading = true;
    // load Country
    refreshCountries();
  }

  vm.messages = {
    country : locationService.messages.country,
  };

  // refresh the displayed Countrys
  function refreshCountries() {
    return locationService.countries({ detailed : 1 }).then((countries) => {
      vm.gridOptions.data = countries;
      vm.session.loading = false;
      // make sure that we are showing the proper message to the client
      vm.messages.country = (countries.length > 0)
        ? locationService.messages.country
        : locationService.messages.empty;
    }).catch(angular.noop);
  }

  vm.createUpdateModal = (selectedCountry = {}) => {
    return $uibModal.open({
      templateUrl : 'modules/locations/country/modal/createUpdate.html',
      controller : 'CreateUpdateCountryController as ModalCtrl',
      resolve : { data : () => selectedCountry },
    }).result.then(result => {
      if (result) refreshCountries();
    });
  };

  const columns = [{
    field : 'name',
    displayName : 'TABLE.COLUMNS.COUNTRY',
    headerCellFilter : 'translate',
  }, {
    field : 'actions',
    enableFiltering : false,
    width : 100,
    displayName : '',
    headerCellFilter : 'translate',
    cellTemplate : 'modules/locations/country/templates/action.cell.html',
  }];

  vm.gridOptions = {
    appScopeProvider : vm,
    enableColumnMenus : false,
    columnDefs : columns,
    enableSorting : true,
    fastWatch : true,
    flatEntityAccess : true,
    onRegisterApi : (gridApi) => {
      vm.gridApi = gridApi;
    },
  };

  vm.remove = function remove(uuid) {
    const message = 'FORM.DIALOGS.CONFIRM_DELETE';
    Modal.confirm(message)
      .then(confirmResponse => {
        if (!confirmResponse) {
          return;
        }
        locationService.delete.country(uuid)
          .then(() => {
            Notify.success('FORM.INFO.DELETE_SUCCESS');
            refreshCountries();
          })
          .catch(Notify.handleError);
      });
  };

  vm.toggleInlineFilter = function toggleInlineFilter() {
    vm.gridOptions.enableFiltering = !vm.gridOptions.enableFiltering;
    vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
  };

  startup();
}
