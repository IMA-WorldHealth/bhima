angular.module('bhima.controllers')
.controller('cotisation_payment', [
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

      dependencies.cotisations = {
        query : {
          identifier : 'id',
          tables : {
            'cotisation' : { 
              columns : ['id', 'label', 'abbr', 'is_employee']
            }
          },
          where : ['cotisation.id=' + record.cotisation_id]
        }
      };

      validate.process(dependencies, ['periods', 'cotisations'])
      .then(function (model) {
        var period = $scope.period =model.periods.data[0];
        var cotisations = $scope.cotisations =model.cotisations.data[0];
      });

      connect.fetch('/reports/cotisation_payment/?id=' + record.period_id + '&cotisation_id=' + record.cotisation_id)
      .then(function (data) {
        $scope.Reports = data;
        
        data.forEach(function (item) {
          var itemCurrency = 0;
          if($scope.enterprise.currency_id !== item.currency_id){
            itemCurrency = item.value / exchange.rate(item.value, item.currency_id,new Date());  
          } else {
            itemCurrency = item.value;
          }

          $scope.total += itemCurrency;


          if (!item.posted){
            item.amount_paid = 0;
            $scope.sum_due += itemCurrency;          
          } else {
            item.amount_paid = item.value;
            $scope.sum_paid += itemCurrency;
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

    function format (c) {
      return '' + c.label + ' :: ' + util.formatDate(c.dateFrom) + ' - ' + util.formatDate(c.dateTo);
    }

    function formatCotisation(c){
      return ' [ ' + c.abbr + ' ] ' + c.label; 
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
      session.cotisation_id = null;
      
      $scope.total = 0;
      $scope.sum_due = 0;
      $scope.sum_paid = 0;
    }

    function selecCotisations(){
      if(session.period_id){        
        session.cotisation_id = null;

        dependencies.cotisations_period = {
          query : {
            tables : {
              cotisation : {
                columns : [
                  'id', 'label', 'abbr', 'is_employee'
                ]
              },
              config_cotisation_item : { columns : ['config_cotisation_id', 'cotisation_id']},
              config_cotisation : { columns : ['id::config_cotisation', 'label::config_label']},
              paiement_period : { columns : ['id::period_id','config_cotisation_id::cotisation_period']}
            },
            join : ['config_cotisation_item.cotisation_id=cotisation.id',
              'config_cotisation.id=config_cotisation_item.config_cotisation_id',
              'paiement_period.config_cotisation_id=config_cotisation.id'
            ],
            where : ['paiement_period.id=' + session.period_id ]
          }
        };
        validate.process(dependencies, ['cotisations_period'])
        .then(function (model) {
          var cotisations_period = $scope.cotisations_period = model.cotisations_period.data;
        });        

      }
    }

    function convert () {
      var sumTotal = 0,
        sumDue = 0,
        sumPaie = 0,
        item = 0;

      $scope.Reports.forEach(function (payment) {
        if($scope.enterprise.currency_id !== item.currency_id){
          item = payment.value / exchange.rate(payment.value, payment.currency_id,new Date());  
        } else {
          item = payment.value;
        }
        sumTotal += item;
        if (!payment.posted){
          sumDue += item;          
        } else {
          sumPaie += item;
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
    $scope.format = format;
    $scope.selecCotisations = selecCotisations;
    $scope.reconfigure = reconfigure;
    $scope.formatCotisation = formatCotisation;
  } 
]);



