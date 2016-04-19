angular.module('bhima.services')
.service('JournalColumnConfigService', JournalColumnConfigService);

JournalColumnConfigService.$inject = ['uiGridConstants'];

/**
 * Posting Journal Column config Service 
 * This service is responsible of Showing and Hiding column
*/
function JournalColumnConfigService(uiGridConstants) { 
  var service = this; 
  
  // Variable used to track and share the current grids API object
  var gridApi;

  function refreshColumns (){
    gridApi.core.notifyDataChange( uiGridConstants.dataChange.COLUMN );
  }

  /**
   * This method is initializing the service and expose interfaces
   *
   * @param {object} gridOptions Angular UI Grid options object 
   * @returns {object} Expose all methods from within service
   */
  function columnConfigInstance(gridOptions) { 

    var cacheGridApi = gridOptions.onRegisterApi;

    // Register for the Grid API
    gridOptions.onRegisterApi = function (api) { 
      gridApi = api;
  
      // Call the method that had previously been registered to request the grids api
      if (angular.isDefined(cacheGridApi)) { 
        cacheGridApi(api);
      }
    };

    // Expose service API
    return { 
      refreshColumns : refreshColumns
    };
  } 

  return columnConfigInstance;
}
