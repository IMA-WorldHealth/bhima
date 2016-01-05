angular.module('bhima.controllers')
.controller('reportTransaction', [
  '$scope',
  '$q',
  '$window',
  'connect',
  'util',
  function ($scope, $q, $window, connect, util) {

    $scope.print = function () {
      $window.print();
    };

    $scope.search = {};

  //variables

    $scope.models = {};
    $scope.model = {};
    $scope.data = {};
    $scope.isOpen = true;
    var creditors, debitors, debitorGroups, creditorGroups;
    var names = ['debitors', 'creditors', 'debitorGroups', 'creditorGroups'];

    //fonctions

    function init (records){
      $scope.models[names[0]] = records[0].data;
      $scope.models[names[1]] = records[1].data;
      $scope.models[names[2]] = records[2].data;
      $scope.models[names[3]] = records[3].data;
      for (var key in $scope.models) {
        mapper($scope.models[key]);
      }
    }

    $scope.fill = function(chaine){
      if (chaine === 'I') { $scope.data.type = 'I'; }
      if (chaine === 'G') { $scope.data.type = 'G'; }
      if (chaine === 'C') { $scope.data.dc = 'C'; }
      if (chaine === 'D') { $scope.data.dc = 'D'; }
      loading();
    };

    var loading = function(){
      if ($scope.data.type === 'I'){
        if ($scope.data.dc === 'C') { loadCreditors(); }
        if ($scope.data.dc === 'D') { loadDebitors(); }
   
      } else if ($scope.data.type === 'G') {
        if ($scope.data.dc === 'C') { loadCreditorGroups(); }
        if ($scope.data.dc === 'D') { loadDebitorGroups(); }
      }
    };

    function mapper(collection){
      collection.map(function(item){
        item.text = item.text || item.name;
      });
    }

    $scope.populate = function (){
      if ($scope.data.dateFrom && $scope.data.dateTo &&
        (util.isDateAfter($scope.data.dateTo, $scope.data.dateFrom) ||
         util.areDatesEqual($scope.data.dateTo, $scope.data.dateFrom))) {
        $scope.show = true;
        var qo;
        if ($scope.data.type === 'I') {
          $scope.DC = $scope.data.dc === 'D'? 'DEBITOR' : 'CREDITOR';
          qo = {
            id:$scope.model.selected.id,
            type:$scope.data.dc,
            ig:$scope.data.type,
            df:$scope.data.dateFrom,
            dt:$scope.data.dateTo
          };

          connect.fetch('/reports/transReport/?'+JSON.stringify(qo))
          .then(function(values){
            $scope.model.transReport = values;
            doSummary(values);
          });

        } else if ($scope.data.type === 'G'){

          $scope.DC = $scope.data.dc === 'D' ? 'DEBITOR GROUP' : 'CREDITOR GROUP';

          qo = {
            id:$scope.model.selected.id,
            type:$scope.data.dc,
            account_id:$scope.model.selected.account_id,
            ig:$scope.data.type,
            df:$scope.data.dateFrom,
            dt:$scope.data.dateTo
          };

          connect.fetch('/reports/transReport/?'+JSON.stringify(qo))
          .then(function(values){
            $scope.model.transReport = values;
            doSummary(values);
          });
        }
     
      } else {
        window.alert('Dates Invalid !');
      }
    };

    function doSummary(){
      var sql;
      if ($scope.data.type === 'I') {
        sql = {
          tables : {
            'general_ledger' : {columns: ['credit', 'debit']}
          },
          where: [
            'general_ledger.deb_cred_id= '+$scope.model.selected.id, 'AND',
            'general_ledger.deb_cred_type='+$scope.data.dc, 'AND',
            'general_ledger.account_id='+$scope.model.selected.account_id
          ]
        };

      } else if ($scope.data.type === 'G') {
        sql = {
          tables : {
            'general_ledger' : {columns: ['credit', 'debit']}
          },
          where: [
            'general_ledger.deb_cred_type='+$scope.data.dc, 'AND',
            'general_ledger.account_id='+$scope.model.selected.account_id
          ]
        };
      }

      connect.req(sql)
      .then(function(resps) {
        var creditTotal = 0, debitTotal = 0;
        resps.data.forEach(function(item){
          creditTotal+=item.credit;
          debitTotal+=item.debit;
        });
        var soldTotal = debitTotal-creditTotal;
        $scope.isBalanced = (soldTotal === 0) ? 'Yes' : 'No';
        $scope.credit = creditTotal;
        $scope.debit = debitTotal;
        $scope.sold = (soldTotal < 0) ? soldTotal*(-1) : soldTotal;
      });
    }

    var tester = function (){
      creditors = {tables:{'creditor':{columns:['id', 'text']}, 'creditor_group':{columns:['account_id']}}, join:  ['creditor.group_id=creditor_group.id']};
      debitors =  {tables:{'debitor':{columns:['id', 'text']}, 'debitor_group':{columns:['account_id']}}, join:  ['debitor.group_id=debitor_group.id']};
      debitorGroups = {tables:{'debitor_group':{columns:['id', 'name', 'account_id']}}};
      creditorGroups = {tables:{'creditor_group':{columns:['id', 'name', 'account_id']}}};
      $q.all([
        connect.req(debitors),
        connect.req(creditors),
        connect.req(debitorGroups),
        connect.req(creditorGroups)
      ]).then(init);
    };

    var loadCreditors = function(){
      $scope.model.chooses = $scope.models.creditors;
    };

    var loadDebitors = function(){
      $scope.model.chooses = $scope.models.debitors;
    };

    var loadCreditorGroups = function(){
      $scope.model.chooses = $scope.models.creditorGroups;
    };

    var loadDebitorGroups = function(){
      $scope.model.chooses = $scope.models.debitorGroups;
    };

    //invocation

    tester();
  }
]);
