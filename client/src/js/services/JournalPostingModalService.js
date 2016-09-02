angular.module('bhima.services')
  .service('JournalPostingModalService', JournalPostingModalService);

/** Dependencies injection */
JournalPostingModalService.$inject = ['util', '$http', '$uibModal'];

function JournalPostingModalService(util, $http, Modal) {
  var service = this;
  var baseUrl = '/trial_balance/';

  service.parseSelectedGridRecord = parseSelectedGridRecord;
  // service.postingModalService = postingModalService;
  // service.getCurrentGroupingColumn = getCurrentGroupingColumn;
  service.switchView = switchView;
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
    return feedBack.hasError ? 'grid-error' : feedBack.hasWarning ? 'grid-warning' : 'grid-success';
  }

  function getFeedBack(errors) {
    var feedBack = {};

    feedBack.hasError = errors.some(function (error) {
        return error && error.fatal;
    });

    feedBack.hasWarning = errors.some(function (error) {
      return error && !error.fatal;
    });

    feedBack.hasSuccess = (!feedBack.hasWarning && !feedBack.hasError) ? true : false;

    return feedBack;
  }


  /**
   * @function parseSelectedGridRecord
   * @description
   * takes as parameter an array of record and send back a formatted array
   * by making sure every transaction has the complete list of his lines
   **/
  function parseSelectedGridRecord (records){
    var parsed = [], processedTransactions = [];

    records.forEach(function (record){

      if(processedTransactions.indexOf(record.entity.trans_id) === -1){

        //take other children of the parent so that every line of the transaction will be present
        parsed = parsed.concat(record.treeNode.parentRow.treeNode.children.map(function (child){
          return child.row.entity;
        }));

        processedTransactions.push(record.entity.trans_id);
      }
    });

    return parsed;
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
   * @function switchView
   *
   * @description
   * This function take the current view and return a new view
   * **/
  function switchView(viewFrom) {
    return viewFrom === 'trans' ? 'account' : 'trans';
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