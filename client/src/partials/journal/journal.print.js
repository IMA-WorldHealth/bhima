angular.module('bhima.controllers')
.controller('journal.print', [
  '$scope',
  'connect',
  'messenger',
  'appstate',
  'precision',
  function ($scope, connect, messenger, appstate, precision) {
    $scope.timestamp = new Date();
    $scope.sums = {};

    var journal = {
      identifier : 'uuid',
      tables : {
        'posting_journal' : {
          'columns' : ['uuid', 'fiscal_year_id', 'period_id', 'trans_id', 'trans_date', 'doc_num', 'description', 'account_id', 'debit', 'credit', 'currency_id', 'deb_cred_uuid', 'deb_cred_type', 'inv_po_id', 'debit_equiv', 'credit_equiv', 'currency_id', 'comment', 'user_id']
        },
        'account' : { 'columns' : ['account_number'] }
      },
      join: ['posting_journal.account_id=account.id']
    };

    appstate.register('project', function (project) {
      $scope.project = project;

      connect.fetch(journal)
      .then(function (records) {
        angular.extend($scope, { records : records });

        records.sort(function (a, b) {
          var x = Number(a.trans_id.substring(3));
          var y = Number(b.trans_id.substring(3));
          return x > y ? 1 : -1;
        });

        var dates = records.map(function (row) {
          return new Date(row.trans_date);
        });

        $scope.min = Math.min.apply(Math.min, dates);
        $scope.max = Math.max.apply(Math.max, dates);

        $scope.sums.debit = 0;
        $scope.sums.credit = 0;
        records.forEach(function (row) {
          $scope.sums.debit += precision.round(row.debit_equiv);
          $scope.sums.credit += precision.round(row.credit_equiv);
        });

      })
      .catch(function (err) {
        messenger.error(err);
      });
    });

  }
]);
