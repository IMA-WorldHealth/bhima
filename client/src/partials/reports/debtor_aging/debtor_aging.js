angular.module('bhima.controllers')
.controller('reportDebitorAging', [
  '$scope',
  '$q',
  'connect',
  'appstate',
  function($scope, $q, connect, appstate){

    //variables
 
    $scope.models = {};
    $scope.results = [];
    $scope.today = new Date();
    var debitors, periods, fiscalYears;
    var names = ['debitors', 'periods', 'fys'];
 

    //fonctions

    function init (records){
      $scope.models[names[0]] = records[0].data;
      $scope.models[names[1]] = records[1].data;
      $scope.models[names[2]] = records[2].data;
      $scope.models.debitorAgings = records[3];
      initializeItem();
      getDebitorRecord();
    }

    var getBalance = function(fiscal_id) {
      var def = $q.defer();
      connect.fetch('/reports/debitorAging/?'+JSON.stringify({fiscal_id : fiscal_id}))
      .then(function(values){
        def.resolve(values);
      });
      return def.promise;
    };

    var checkExisting = function(idPeriod, idDebitor){
      return $scope.models.debitorAgings.some(function(item){
        return (item.id === idPeriod && item.idDebitor === idDebitor);
      });
    };

    var getRecord = function(debitor){
      var record = [];
      $scope.models.periods.forEach(function(period){
        var balance = 0;
        if(checkExisting(period.id, debitor.id)){
          $scope.models.debitorAgings.forEach(function(debitorAging){
            if (debitorAging.id === period.id && debitorAging.idDebitor === debitor.id) {
              balance+=debitorAging.credit - debitorAging.debit;
            }
          });
        }
        record.push(balance);
      });
      return record;
    };

    var getDebitorRecord = function(){
      $scope.results = [];
      $scope.models.debitors.forEach(function(debitor){
        $scope.results.push({debitorName : debitor.text, balances : getRecord(debitor)});
      });
    };

    var tester = function(){
      loading($scope.choix || null);
    };

    var loading = function(fy){
      appstate.register('fiscal', function(fiscal) {
        $scope.fySelected = fy || fiscal;

        debitors = {
          identifier : 'uuid',
          tables : {
            'debitor' : {
              columns : ['uuid', 'text']
            },
            'debitor_group':{
              columns:['account_id']
            }
          },
          join : ['debitor.group_uuid=debitor_group.uuid'],
          where : ['debitor_group.enterprise_id='+$scope.fySelected.enterprise_id]
        };

        periods = {
          tables : {
            'period' : {
              columns:['id', 'period_start', 'period_stop']
            }
          },
          where : ['period.fiscal_year_id='+$scope.fySelected.id]
        };

        fiscalYears = {
          tables : {
            'fiscal_year' : {
              columns: ['id', 'fiscal_year_txt', 'start_month', 'start_year', 'previous_fiscal_year', 'enterprise_id']
            }
          },
          where : ['fiscal_year.enterprise_id='+$scope.fySelected.enterprise_id]
        };

        $q.all([
          connect.req(debitors),
          connect.req(periods),
          connect.req(fiscalYears),
          getBalance($scope.fySelected.id)
        ]).then(init);

      });
    };

    $scope.reload = function(f){
      f.checked = !f.checked;
      loading(f);
    };

    var initializeItem = function(){

      $scope.models.fys.map(function(item){
        item.checked = false;
      });

      $scope.models.periods.map(function(item){
        item.checked = true;
      });
    };

    $scope.adjust = function(p){
      p.checked = !p.checked;
      removePeriod(p.id);
      // $scope.models.periods.splice($scope.models.periods.indexOf(p), $scope.models.periods.indexOf(p)); dont work very well
    };

    var removePeriod = function(id){
      var periods = [];
      $scope.models.periods.forEach(function(period){
        if (period.id !== id) {
          periods.push(period);
        }
      });
      $scope.models.periods = periods;
      getDebitorRecord();
    };
    // invocation
    tester();
  }
]);
