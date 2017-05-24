angular.module('bhima.controllers')
  .controller('CommentAccountStatementController', CommentAccountStatementController);

// DI
CommentAccountStatementController.$inject = [
  '$uibModalInstance', 'modalParameters', 'AccountStatementService', 'NotifyService',
];

// Comment Account Statement Controller
function CommentAccountStatementController(Instance, ModalParameters, AccountStatement, Notify) {
  var vm = this;

  vm.cancel = Instance.dismiss;
  vm.submit = submit;
  vm.rows = ModalParameters.rows;

  // submit the comment
  function submit(form) {
    if (form.$invalid) { return; }

    var params = {
      uuids : uuids(vm.rows),
      comment : vm.comment,
    };

    AccountStatement.commentAccountStatement(params)
      .then(function (res) {
        if (!res) { return; }
        Instance.close(vm.comment);
      })
      .catch(Notify.handleError)
      .finally(Instance.close);
  }

  // get rows uuid
  function uuids(rows) {
    return rows.map(function (row) {
      return row.entity.uuid;
    });
  }
}
