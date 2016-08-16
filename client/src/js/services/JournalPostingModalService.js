angular.module('bhima.services')
  .service('JournalPostingModalService', JournalPostingModalService);

/** Dependencies injection */
JournalPostingModalService.$inject = ['util', '$http'];

function JournalPostingModalService(util, $http) {
  var service = this;

  service.parseSelectedGridRecord = parseSelectedGridRecord;
  service.postingModalService = postingModalService;
  service.getCurrentGroupingColumn = getCurrentGroupingColumn;
  service.switchGroup = switchGroup;
  service.getDataByAccount = getDataByAccount;

  function parseSelectedGridRecord (records){
    var parsed = [], processedTransactions = [];

    records.forEach(function (record){

      if(processedTransactions.indexOf(record.entity.trans_id) === -1){
        parsed = parsed.concat(record.treeNode.parentRow.treeNode.children.map(function (child){
          return child.row.entity;
        }));

        processedTransactions.push(record.entity.trans_id);
      }
    });

    return parsed;
  }

  function  getCurrentGroupingColumn () {
    var groupingDetail = this.gridApi.grouping.getGrouping();
    return groupingDetail.grouping[0].colName;
  }

  /**
   * @function getDataByAccount
   * @Description
   *
   * Takes a list of writings, and return data in this format
   * {debit : x, credit : y, account_id : z, balance : xx, account_number : yy}
   * by grouping account
   **/
  function getDataByAccount(lines) {

    var transactions = [];

    lines.forEach(function (line) {
      if(transactions.indexOf(line.trans_id) === -1){
        transactions.push(line.trans_id);
      }
    });
    
    

    console.log(transactions);    
    return [];
  }

  /**
   * @function switchGroup
   *
   * @description
   * This function take the current grouping column and return a new column name for grouping
   * **/
  function  switchGroup(from) {
    return from === 'trans_id' ? 'account_number' : 'trans_id';
  }

  function postingModalService (gridOptions){

    util.after(gridOptions, 'onRegisterApi', function onRegisterApi(api) {
      this.gridApi = api;
      getCurrentGroupingColumn.bind(this);
    }.bind(this));   
  }  

  return service;
}