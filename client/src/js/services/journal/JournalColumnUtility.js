angular.module('bhima.services')
.service('JournalColumnUtility', JournalColumnUtility);

JournalColumnUtility.$inject = [];

/**
 * Posting Journal Column utility Service 
 * This service is responsible of perform some task to related to the logic
*/
function JournalColumnUtility() { 
  var service = this; 

  /**
  * Parse an object to an array containing configurations
  **/
  function getConfiguration (CfgObject){
    var configuration = Object.keys(CfgObject).map(function (key){
      return {field : key, visible : CfgObject[key]};
    });

    return configuration;
  }

  function toggleVisibility (columns, cfg){
    columns.forEach(function (item){
      item.visible = cfg[item.field];
    });

    return columns;
  }

  return {
    getConfiguration : getConfiguration,
    toggleVisibility : toggleVisibility
  };
}
