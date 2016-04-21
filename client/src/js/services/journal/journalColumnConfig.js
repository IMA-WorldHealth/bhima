angular.module('bhima.services')
.service('JournalColumnConfigService', JournalColumnConfigService);

JournalColumnConfigService.$inject = ['uiGridConstants', 'AppCache'];

/**
 * Posting Journal Column config Service 
 * This service is responsible of Showing and Hiding column
*/
function JournalColumnConfigService(uiGridConstants, AppCache) { 
  var service = this; 
  
  // Variable used to track and share the current grids API object
  var gridApi;

  //An appcache instance
  //@todo use ui-grid-saveState
  var cache = AppCache('columnConfigService');

  //default visibility configuartion
  var defaultVisibility = [ 
    {field:  'uuid', displayName : 'ID', visible : false},
    {field : 'project_name', displayName : 'Project', visible : false},
    {field : 'period_summary', displayName : 'Period', visible : false},
    {field : 'trans_date', displayName : 'Date', visible : true}, 
    {field : 'description', displayName : 'Description', visible : true},
    {field : 'account_number', displayName : 'Account', visible : true},
    {field : 'debit_equiv', displayName : 'Debit', visible : true},
    {field : 'credit_equiv', displayName : 'Credit', visible : true},
    {field : 'trans_id', displayName : 'Transaction', visible : true},
    {field : 'currency_id', displayName : 'Currency', visible : false},
    {field : 'entity_uuid', displayName : 'Recipient', visible : false},
    {field : 'entity_type', displayName : 'Recipient Type', visible : false},
    {field : 'reference_uuid', displayName : 'Reference', visible : false},
    {field : 'record_uuid', displayName : 'Reference Document', visible : false},
    {field : 'user', displayName : 'Responsible', visible : false},      
    {field : 'cc_id', displayName : 'Cost center', visible : false},
    {field : 'pc_id', displayName : 'Profit center', visible : false}
  ];

  /**
  * This function send back the default grid columns configuration
  * in terms of visibility
  * 
  * @return {{array}} an array of configuration
  **/
  function getDefaultVisibility (){
    return defaultVisibility;
  }

  /**
  * This function send back the current grid columns configuration
  * in terms of visibility
  * 
  * @return {{array}} an array of configuration
  **/
  function getCurrentVisibility (){
    var current = [];
    service.gridOptions.columnDefs.forEach(function (item){
      current.push({field : item.field, displayName : item.displayName, visible :item.visible});
    });

    return current;
  }

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
    service.gridOptions.columnDefs.forEach(function (item){
      item.visible = getVisibity(configuration, item.field);
    });

    cache.configuration = configuration;
    refreshColumns();
  }

  /**
  * Utility function to filter a array of column and send back the visible value
  * @return {{boolean}}
  **/
  function getVisibity (configuration, field){
    return configuration.filter(function (item){
      return item.field === field;
    })[0].visible;
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

      applyConfiguration(cache.configuration || defaultVisibility);


      // Call the method that had previously been registered to request the grids api
      if (angular.isDefined(cacheGridApi)) { 
        cacheGridApi(api);
      }
    };

    // Expose service API
    return { 
      getCurrentVisibility : getCurrentVisibility,
      getDefaultVisibility : getDefaultVisibility,
      applyConfiguration : applyConfiguration
    };
  } 

  return columnConfigInstance;
}
