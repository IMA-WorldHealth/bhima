angular.module('bhima.controllers')
  .controller('CommentModalController', CommentModalController);

CommentModalController.$inject = [
  '$uibModalInstance', 'params', 'TransactionService', 'NotifyService',
];

/**
 * @function CommentModalController
 *
 * @description
 * This controller powers the comment modal, used for putting comments on
 * individual rows of the Journal and General Ledger.  These comments do not
 * have to be restricted to unposted data, but can be put on posted and
 * unposted records.
 */
function CommentModalController(Instance, ModalParameters, Transactions, Notify) {
  var vm = this;
  var comments;

  vm.cancel = Instance.dismiss;
  vm.submit = submit;
  vm.rows = ModalParameters.rows;

  // get the unique comments
  comments = vm.rows
    .map(function (row) {
      return row.entity.comment;
    })
    .filter(function (comment, index, array) {
      return array.indexOf(comment) === index;
    });

  // if the comments are homogenous, set the model to be the previous comment
  if (comments.length === 1) {
    vm.comment = comments[0];
  }

  // submit the comment
  function submit(form) {
    if (form.$invalid) { return; }

    var params = {
      uuids : getRowsUuid(vm.rows),
      comment : vm.comment,
    };

    Transactions.comment(params)
      .then(function (res) {
        if (!res) { return; }
        Instance.close(vm.comment);
      })
      .catch(Notify.handleError)
      .finally(Instance.close);
  }

  // get rows uuid
  function getRowsUuid(rows) {
    return rows.map(function (row) {
      return row.entity.uuid;
    });
  }
}
