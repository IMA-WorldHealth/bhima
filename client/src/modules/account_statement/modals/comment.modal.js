angular.module('bhima.controllers')
  .controller('CommentAccountStatementController', CommentAccountStatementController);

// DI
CommentAccountStatementController.$inject = [
  '$uibModalInstance', 'data', 'AccountStatementService', 'NotifyService',
];

// Comment Account Statement Controller
function CommentAccountStatementController(Instance, Data, AccountStatement, Notify) {
  var vm = this;

  vm.cancel = Instance.dismiss;
  vm.submit = submit;
  vm.rows = Data.rows;

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
        Instance.close(res);
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
