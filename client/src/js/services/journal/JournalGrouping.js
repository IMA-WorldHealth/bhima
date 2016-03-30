angular.module('bhima.services')
.service('JournalGroupingService', JournalGroupingService);

JournalGroupingService.$inject = [];

/**
 * Posting Journal Grouping Service 
 *
 * This service is responsible for setting the grouping configuration for the 
 * client side posting journal module. It also provides a number of helper 
 * methods that can be used to provide custom transaction grouping. 
 */
function JournalGroupingService() { 
  var service = this;
  
  // Variable used to track and share the current grids API object
  var gridApi;
 
  /**
   * This method enables group level selections when the posting journal is grouped
   * according to a column. It first checks to ensure the row that changed is a
   * header and then selects each of the rows children.
   *
   * @params {object} rowChanged    Object containing the row that has just been selected
   */
  function selectAllGroupElements(rowChanged) {
    
    // determine that this selection is a header row
    if (angular.isDefined(rowChanged.treeLevel) && rowChanged.treeLevel > -1) { 
      
      var children = gridApi.treeBase.getRowChildren(rowChanged);
      children.forEach(function (child) { 

        // determine if we should we be selected or deselecting
        var select = rowChanged.isSelected ? gridApi.selection.selectRow : gridApi.selection.unSelectRow;
        select(child.entity);
      });
    }
  }
  
  /** 
   * This method binds grouping utility methods to UI grid API actions. It sets 
   * up the default grouping functionality of the grid, specifically: 
   *  - Selecting a header row will select all children elements
   *  - Grid transactions will be expanded on initialisation
   * 
   * @params {object} gridApi     Angular UI Grid API
   */
  function configureDefaultGroupingOptions(gridApi) { 
    var initialised = false;

    // bind the group selection method
    gridApi.selection.on.rowSelectionChanged(null, selectAllGroupElements);
    
    // hook into rows rendered call to ensure the grid is ready before expanding initial nodes
    gridApi.core.on.rowsRendered(null, function () { 

      // only do something if we haven't yet initialised the grid
      if (!initialised) { 
        gridApi.treeBase.expandAllRows();
        initialised = true;
      }
    });
  }

  function groupInstance(gridOptions) {
    var cacheGridApi = gridOptions.onRegisterApi;
    
    // global grouping configuration 
    gridOptions.enableGroupHeaderSelection = true;
    gridOptions.treeRowHeaderAlwaysVisible = false;

    // register for the Grid API
    gridOptions.onRegisterApi = function (api) { 
      gridApi = api;
      configureDefaultGroupingOptions(gridApi);

      // call the method that had previously been registered to request the grids api
      if (angular.isDefined(cacheGridApi)) { 
        cacheGridApi(api);
      }
    };
  }
  return groupInstance;
}
 
