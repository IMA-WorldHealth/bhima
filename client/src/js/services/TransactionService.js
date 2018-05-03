angular.module('bhima.services')
  .service('TransactionService', TransactionService);

TransactionService.$inject = ['$http', 'util', '$uibModal'];

function TransactionService($http, util, Modal) {
  const service = this;
  const baseUrl = '/transactions/';

  service.remove = remove;
  service.comment = comment;
  service.openCommentModal = openCommentModal;
  service.history = historyFn;

  /**
   * @method remove
   *
   * @description
   * This function removes a transaction from the database via the transaction
   * delete route.  It also removes the corresponding invoice/voucher/cash
   * payment as necessary.
   */
  function remove(uuid) {
    const url = baseUrl.concat(uuid);
    return $http.delete(url)
      .then(util.unwrapHttpResponse);
  }


  /**
   * @method comment
   * @description
   * This function comments on individual lines of a transaction.  It is used by
   * the comment modal to modify, remove or add comments to transactions.
   */
  function comment(params) {
    const url = baseUrl.concat('comments');
    return $http.put(url, { params })
      .then(util.unwrapHttpResponse);
  }

  /**
   * @method openCommentModal
   *
   * @description
   * This method opens the comment modal to allow a user to comment on
   * rows of transactions.
   */
  function openCommentModal(rows) {
    const config = {
      templateUrl  : 'modules/journal/modals/comment.modal.html',
      controller   : 'CommentModalController',
      controllerAs : '$ctrl',
      resolve : {
        params :  () => rows,
      },
    };

    return Modal.open(config).result;
  }

  /**
   * @function historyFn
   *
   * @description
   * This function loads the history of a given transaction from the database.
   */
  function historyFn(uuid) {
    const url = baseUrl.concat(uuid, '/history');
    return $http.get(url)
      .then(util.unwrapHttpResponse);
  }

  return service;
}
