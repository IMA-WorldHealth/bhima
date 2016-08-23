angular.module('bhima.services')
  .service('JournalPostingModalService', JournalPostingModalService);

/** Dependencies injection */
JournalPostingModalService.$inject = ['util', '$http', '$uibModal'];

function JournalPostingModalService(util, $http, Modal) {
  var service = this;
  var baseUrl = '/trial_balance/'

  service.parseSelectedGridRecord = parseSelectedGridRecord;
  service.postingModalService = postingModalService;
  service.getCurrentGroupingColumn = getCurrentGroupingColumn;
  service.switchGroup = switchGroup;
  service.getDataByAccount = getDataByAccount;
  service.checkTransactions = checkTransactions;
  service.getFeedBack = getFeedBack;
  service.getCSSClass = getCSSClass;
  service.openErrorViewerModal = openErrorViewerModal;
  service.postToGeneralLedger = postToGeneralLedger;

  function openErrorViewerModal(errors, feedBack, cssClass) {

    return Modal.open({
      templateUrl: 'partials/journal/modals/journalErrorViewer.modal.html',
      controller:  'JournalErrorViewerModalController as JournalErrorViewerModalCtrl',
      size : 'lg',
      resolve : {
        params : function getParams() { return {errors : errors, feedBack : feedBack, cssClass : cssClass}; }
      }
    });

  }

  function  getCSSClass (feedBack) {
    return feedBack.hasError ? 'error' : feedBack.hasWarning ? 'warning' : 'success';
  }

  function getFeedBack(errors) {
    var feedBack = {};

    feedBack.hasError = errors.some(function (error) {
      if(error){
        return error.fatal;
      }else{
        return false;
      } 
    });
    
    if(feedBack.hasError){
      feedBack.hasWarning = false;
      feedBack.hasSuccess = false;      
      return feedBack;
    }

    feedBack.hasWarning = errors.some(function (error) {
      return error
    });

    if(feedBack.hasWarning){
      feedBack.hasSuccess = false;
      return feedBack;
    }
    
    feedBack.hasSuccess = true;
    
    return feedBack;
  }

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
   * @function getTransactionList
   * @description
   * take an array of posting journal lines and return an
   * array of distinct trans_id
   *
   * So here is the format of data which can be sent to
   * this function :
   *
   * [{trans_id : xx, ...}, {trans_id : yy, ...}]
   **/
  function getTransactionList (lines) {
    var transactions = [];

    /** extract only an unique trans_id property and put it in an array*/
    lines.forEach(function (line) {
      if(transactions.indexOf(line.trans_id) === -1){
        transactions.push(line.trans_id);
      }
    });

    return transactions;
  }

  /**
   * @function checkTransactions
   * @description
   * This function takes a parsed record list (grid rows processed by the parseSelectedGridRecord function)
   * and return back a list of object representing errors and warnings.
   * an empty list returned means all transactions can be posted without
   * error or warning
   **/
  function checkTransactions (lines) {
    var transactions = getTransactionList(lines);
    var url = baseUrl.concat('checks/');

    /** posting a list of transactions to the server **/
    return $http.post(url, {transactions : transactions});
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
    var url = baseUrl.concat('data_per_account/');
    var transactions = getTransactionList(lines);

    /** Querying the database to get the data grouped per account**/    
    return $http.get(url, { params : {transactions : transactions}})
      .then(util.unwrapHttpResponse);
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

  /**
   * @function postToGeneralLedger
   * @description
   * This function takes a parsed record list (grid rows processed by the parseSelectedGridRecord function)
   * and extract their transaction IDS uniquely through the getTransactionList method
   * and post these transaction to the server
   *
   * This function is called only when every test are passed without a fatal error
   **/
  function postToGeneralLedger (records) {

    var transactions = getTransactionList(records);
    var url = baseUrl.concat('post_transactions/');

    /** posting a list of transactions to the server to be stored to the general ledger **/
    return $http.post(url, {transactions : transactions});
  }

  return service;
}