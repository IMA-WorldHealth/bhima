// TODO Handle HTTP exception errors (displayed contextually on form)
angular.module('bhima.controllers')
  .controller('PriceListController', PriceListController);

PriceListController.$inject = [
  'PriceListService', '$uibModal', 'InventoryService',
  'ModalService', 'util', 'NotifyService', 'appcache',
  'LanguageService', '$httpParamSerializer', 'GridColumnService',
  'GridStateService', 'uiGridConstants',
];

function PriceListController(
  PriceListService, $uibModal, Inventory, ModalService, util, Notify, AppCache,
  Languages, $httpParamSerializer, Columns, GridState, uiGridConstants
) {
  const vm = this;
  vm.view = 'default';
  vm.download = download;
  vm.openColumnConfigModal = openColumnConfigModal;
  vm.toggleInlineFilter = toggleInlineFilter;
  // set price list items
  vm.addItem = addItem;
  // delete a price list
  vm.remove = remove;
  // create a new price list
  vm.create = create;

  const cacheKey = 'priceList';

  function startUp() {
    refreshPriceList();
  }

  const columns = [
    {
      field : 'label',
      displayName : 'FORM.LABELS.LABEL',
      headerCellFilter : 'translate',
    },
    {
      field : 'description',
      displayName : 'FORM.LABELS.DESCRIPTION',
      headerCellFilter : 'translate',
    },
    {
      field : 'itemsNumber',
      displayName : 'FORM.LABELS.ITEMS',
      headerCellFilter : 'translate',
      cellTemplate : `/modules/prices/templates/itemsNumber.cell.html`,
    },
    {
      field : 'subcribedGroupsNumber',
      displayName : 'PATIENT_GROUP.PATIENT_GROUP',
      headerCellFilter : 'translate',
      cellTemplate : `/modules/prices/templates/subscribedGroups.cell.html`,
    },
    {
      field : 'FORM.BUTTONS.ACTIONS',
      width : 100,
      enableFiltering : false,
      displayName : '',
      headerCellFilter : 'translate',
      cellTemplate : `/modules/prices/templates/action.cell.html`,
    },
  ];

  vm.gridOptions = {
    appScopeProvider : vm,
    enableColumnMenus : false,
    columnDefs : columns,
    enableSorting : true,
    data : [],
    fastWatch : true,
    flatEntityAccess : true,
  };

  vm.gridOptions.onRegisterApi = function onRegisterApi(gridApi) {
    vm.gridApi = gridApi;
  };

  const columnConfig = new Columns(vm.gridOptions, cacheKey);
  const state = new GridState(vm.gridOptions, cacheKey);

  vm.saveGridState = state.saveGridState;

  function openColumnConfigModal() {
    // column configuration has direct access to the grid API to alter the current
    // state of the columns - this will be saved if the user saves the grid configuration
    columnConfig.openConfigurationModal();
  }

  function toggleInlineFilter() {
    vm.gridOptions.enableFiltering = !vm.gridOptions.enableFiltering;
    vm.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
  }

  // open create price list modal
  function openCreateModal(priceList) {

    return $uibModal.open({
      keyboard : false,
      backdrop : 'static',
      templateUrl : 'modules/prices/modal/createUpdate.html',
      controller : 'PriceListModalController as $ctrl',
      resolve : {
        data : function dataProvider() {
          return priceList;
        },
      },
    }).result;
  }

  // create or edit a price list
  function create(priceList) {
    openCreateModal(priceList).then(yes => {
      if (yes) {
        refreshPriceList();
      }
    })
      .catch(Notify.handleError);
  }

  // switch to delete warning mode
  function remove(uuid) {
    ModalService.confirm('FORM.DIALOGS.CONFIRM_DELETE')
      .then(bool => {
        // if the user clicked cancel, reset the view and return
        if (!bool) {
          vm.view = 'default';
          return;
        }

        // if we get there, the user wants to delete a priceList
        PriceListService.delete(uuid)
          .then(() => {
            Notify.success('FORM.INFO.DELETE_SUCCESS');
            return refreshPriceList();
          })
          .catch(Notify.handleError);
      });
  }

  function download(renderer) {
    const displayNames = columnConfig.getDisplayNames();
    const options = {
      renderer,
      lang : Languages.key,
      detailed : 1,
    };

    if (renderer !== 'pdf') {
      angular.extend(options, { displayNames, renameKeys : true });
    }
    // return  serialized options
    return $httpParamSerializer(options);
  }


  // Add pricelist Item in a  modal
  function addItem(pricelist) {
    return $uibModal.open({
      templateUrl : 'modules/prices/modal/createItems.html',
      controller : 'PriceListItemsModalController as ModalCtrl',
      keyboard : false,
      backdrop : 'static',
      size : 'md',
      resolve : {
        data : function dataProvider() {
          return pricelist || {};
        },
      },
    });
  }

  // refresh the displayed PriceList
  function refreshPriceList() {
    return PriceListService.read(null, { detailed : 1 }).then(data => {
      vm.loading = false;
      vm.gridOptions.data = data;
    });
  }

  startUp();
}
