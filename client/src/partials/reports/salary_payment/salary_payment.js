angular.module('bhima.controllers')
.controller('salary_payment', [
  '$scope',
  '$translate',
  '$http',
  '$routeParams',
  'connect',  
  'validate',
  'exchange',
  'appstate',
  'util',
  function ($scope, $translate, $http, $routeParams, connect, validate, exchange, appstate, util) {
    var dependencies = {},
        session = $scope.session = {},
        total = $scope.total = 0,
        sum_due = $scope.sum_due = 0,
        sum_paid = $scope.sum_paid = 0,
        state = $scope.state;

    dependencies.getPeriods = {
      query : {
        identifier : 'id',
        tables : {
          'paiement_period' : { 
            columns : ['id', 'label', 'dateFrom', 'dateTo']
          }
        }
      }
    };

    dependencies.currencies = {
      required : true,
      query : {
        tables : {
          'currency' : {
            columns : ['id', 'symbol']
          }
        }
      }
    };

    function reset () {
      var record = connect.clean(session);
      dependencies.periods = {
        query : {
          identifier : 'id',
          tables : {
            'paiement_period' : { 
              columns : ['id', 'label', 'dateFrom', 'dateTo']
            }
          },
          where : ['paiement_period.id=' + record.period_id]
        }
      };
      validate.process(dependencies, ['periods'])
      .then(function (model) {
        var period = $scope.period =model.periods.data[0];
      });

      connect.fetch('/reports/employeePaiement/?id=' + record.period_id)
      .then(function (data) {
        $scope.Reports = data;
        data.forEach(function (item) {
          var net_salaryCurrency = 0,
            amountCurrency = 0,
            balanceCurrency = 0;
          
          item.balance = item.net_salary - item.amount;
          if($scope.enterprise.currency_id !== item.currency_id){
            net_salaryCurrency = item.net_salary / exchange.rate(item.net_salary, item.currency_id,new Date());
            amountCurrency = item.amount / exchange.rate(item.amount, item.currency_id,new Date());    
          } else {
            net_salaryCurrency = item.net_salary;
            amountCurrency = item.amount;   
          }

          $scope.total += net_salaryCurrency;

          if (item.is_paid){
            item.balance = 0;
            item.amount = item.net_salary;
            $scope.sum_paid += net_salaryCurrency;
            $scope.sum_due += 0;          
          } else {
            balanceCurrency = net_salaryCurrency - amountCurrency;
            $scope.sum_paid += amountCurrency;
            $scope.sum_due += balanceCurrency;
          }
                      
        });
      });
      $scope.state = 'generate';
    }

    $scope.print = function print() {
      window.print();
    };

    function startup (models) {
      angular.extend($scope, models);
    }

    appstate.register('enterprise', function (enterprise) {
      $scope.enterprise = enterprise;
      session.currency = $scope.enterprise.currency_id;
      validate.process(dependencies)
      .then(startup);
    });

   function reconfigure () {
      $scope.state = null;
      session.period_id = null;
    }

    function convert () {
      var sumTotal = 0,
        sumDue = 0,
        sumPaie = 0,
        itemNet = 0,
        itemPay = 0;

      $scope.Reports.forEach(function (payment) {
        if($scope.enterprise.currency_id !== payment.currency_id){
          itemNet = payment.net_salary / exchange.rate(payment.net_salary, payment.currency_id,new Date());
          itemPay = payment.amount / exchange.rate(payment.amount, payment.currency_id,new Date());    
        } else {
          itemNet = payment.net_salary;
          itemPay = payment.amount;   
        }
        sumTotal += itemNet;  
        if (payment.is_paid){
          sumPaie += itemPay;
          sumDue += 0;          
        } else {
          $scope.sum_paid += itemPay;
          sumDue += itemNet - itemPay;
        }
      });

      if($scope.enterprise.currency_id !== session.currency){
        $scope.total = sumTotal * exchange.rate(sumTotal, session.currency,new Date());  
        $scope.sum_due = sumDue * exchange.rate(sumDue, session.currency,new Date());  
        $scope.sum_paid = sumPaie * exchange.rate(sumPaie, session.currency,new Date());  
      } else {        
        $scope.total = sumTotal;  
        $scope.sum_due = sumDue;  
        $scope.sum_paid = sumPaie;  
      }  
    }
 
    $scope.convert = convert;
    $scope.reset = reset;
    function generateReference () {
      window.data = $scope.getPeriods.data;
      var max = Math.max.apply(Math.max, $scope.getPeriods.data.map(function (o) { return o.reference; }));
      return Number.isNaN(max) ? 1 : max + 1;
    } 
    $scope.reconfigure = reconfigure;
  } 
]);

