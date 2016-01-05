angular.module('bhima.controllers')
.controller('taxes_payment', [
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

      dependencies.taxes = {
        query : {
          identifier : 'id',
          tables : {
            'tax' : { 
              columns : ['id', 'label', 'abbr', 'is_employee']
            }
          },
          where : ['tax.id=' + record.tax_id]
        }
      };

      validate.process(dependencies, ['periods', 'taxes'])
      .then(function (model) {
        var period = $scope.period =model.periods.data[0];
        var taxes = $scope.taxes =model.taxes.data[0];
      });

      connect.fetch('/reports/taxes_payment/?id=' + record.period_id + '&tax_id=' + record.tax_id)
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

    function format (c) {
      return '' + c.label + ' :: ' + util.formatDate(c.dateFrom) + ' - ' + util.formatDate(c.dateTo);
    }

    function formatTaxes(c){
      return ' [ ' + c.abbr + ' ] ' + c.label; 
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
      session.tax_id = null;
      
      $scope.total = 0;
      $scope.sum_due = 0;
      $scope.sum_paid = 0;
    }

    function selecTaxes(){
      if(session.period_id){        
        session.tax_id = null;

        dependencies.taxes_period = {
          query : {
            tables : {
              tax : {
                columns : [
                  'id', 'label', 'abbr', 'is_employee'
                ]
              },
              config_tax_item : { columns : ['config_tax_id', 'tax_id']},
              config_tax : { columns : ['id::config_tax', 'label::config_label']},
              paiement_period : { columns : ['id::period_id','config_tax_id::tax_period']}
            },
            join : ['config_tax_item.tax_id=tax.id',
              'config_tax.id=config_tax_item.config_tax_id',
              'paiement_period.config_tax_id=config_tax.id'
            ],
            where : ['paiement_period.id=' + session.period_id ]
          }
        };
        validate.process(dependencies, ['taxes_period'])
        .then(function (model) {
          var taxes_period = $scope.taxes_period = model.taxes_period.data;
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
    $scope.selecTaxes = selecTaxes;
    $scope.format = format;
    $scope.formatTaxes = formatTaxes;
    $scope.reconfigure = reconfigure;
  } 
]);

