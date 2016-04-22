angular.module('bhima.services')
.service('JournalColumnConfigService', JournalColumnConfigService);

JournalColumnConfigService.$inject = ['uiGridConstants', 'AppCache', '$uibModal', 'JournalColumnUtility'];

/**
 * Posting Journal Column config Service 
 * This service is responsible of Showing and Hiding column
*/
function JournalColumnConfigService(uiGridConstants, AppCache, Modal, Util) { 
  var service = this; 
  
  // Variable used to track and share the current grids API object
  var gridApi;

  //An appcache instance
  //@todo use ui-grid-saveState
  var cache = AppCache('columnConfigService');

  //default visibility configuartion
  var defaultVisibility = { 
    'uuid' : false,
    'project_name' : false,
    'period_summary' : false,
    'trans_date' : true, 
    'description' : true,
    'account_number' : true,
    'debit_equiv' : true,
    'credit_equiv' : true,
    'trans_id' : true,
    'currency_id' : false,
    'entity_uuid' : false,
    'entity_type' : false,
    'reference_uuid' : false,
    'record_uuid' : false,
    'user' : false,      
    'cc_id' : false,
    'pc_id' : false
  };

  /**
  * A function to refresh the columns grid, without that user is supposed to 
  * to resize the grid manually before seeing the column change
  */
  function refreshColumns (){
    gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN );
  }

  /** 
  * this function is applying the user configuration on the grid columns
  * If no configuration exist, the default configuratio will be used
  * when the service is loaded
  **/
  function applyConfiguration (configuration){
    gridApi.core.on.renderingComplete(null, function(){
      configuration.forEach(function (item){
        if(item.visible){
          gridApi.grid.getColumn(item.field).showColumn();
        }else{
          gridApi.grid.getColumn(item.field).hideColumn();
        }      
      }); 
    });

    cache.configuration = configuration;
    refreshColumns();
  }

  /**
  * Define and show the column visibility
  * state to let the user set visibility
  **/
  function openColumnConfigModal (){

    var instance = Modal.open({
      templateUrl: 'partials/journal/modals/columnsConfig.modal.html',
      controller:  'ColumnsConfigModalController as ColumnsConfigModalCtrl',
      size:        'md',
      backdrop:    'static',
      animation:   true,
      keyboard  : false,
      resolve:     {
        columns : function visibilityListProvider() { return service.gridOptions.columnDefs; },
        defaultVisibility : function defaultVisibilityProvider () { return defaultVisibility;}
      }
    });

    instance.result.then(function (result) {
      applyConfiguration(result.configList);
    });
  }

  /**
   * This method is initializing the service and expose interfaces
   *
   * @param {object} gridOptions Angular UI Grid options object 
   * @returns {object} Expose all methods from within service
   */
  function columnConfigInstance(gridOptions) { 
    var cacheGridApi = gridOptions.onRegisterApi;

    service.gridOptions = gridOptions;

    gridOptions.onRegisterApi = function (api) { 
      gridApi = api;

      applyConfiguration(cache.configuration || Util.getConfiguration(defaultVisibility));

      // Call the method that had previously been registered to request the grids api
      if (angular.isDefined(cacheGridApi)) { 
        cacheGridApi(api);
      }
    };

    // Expose service API
    return { 
      openColumnConfigModal : openColumnConfigModal
    };
  } 

  return columnConfigInstance;
}
