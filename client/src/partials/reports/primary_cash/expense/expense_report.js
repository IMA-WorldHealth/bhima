angular.module('bhima.controllers')
.controller('primary_cash.expenseReport', [
  '$scope',
  '$q',
  'connect',
  'validate',
  'messenger',
  'util',
  'appcache',
  'exchange',
  'SessionService',
  function ($scope, $q, connect, validate, messenger, util, Appcache, exchange, SessionService) {
    var session = $scope.session = {};
    var dependencies = {};
    var cache = new Appcache('expense_report'),
      state = $scope.state;
    session.dateFrom = new Date();
    session.dateTo = new Date();

    dependencies.cashes = {
      required: true,
      query : {
        tables : {
          'cash_box' : {
            columns : ['text', 'project_id']
          },
          'cash_box_account_currency' : {
            columns : ['id', 'currency_id', 'cash_box_id', 'account_id']
          },
          'currency' : {
            columns : ['symbol']
          }
        },
        join : ['cash_box.id=cash_box_account_currency.cash_box_id', 'currency.id=cash_box_account_currency.currency_id' ]
      }
    };
    dependencies.records = {}; 

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

    cache.fetch('selectedCash').then(load);

    function load (selectedCash) {
      if (selectedCash) { session.selectedCash = selectedCash; }
      
      session.project = SessionService.project;
      dependencies.cashes.query.where = ['cash_box.project_id=' + session.project.id, 'AND', 'cash_box.is_auxillary=0'];
      validate.process(dependencies, ['cashes'])
      .then(init)
      .catch(function (err) {
        messenger.danger(err.toString());
      });
    }

    function init (model) {
      $scope.session.model = model;
      if(session.selectedCash){
        fill();
      }
    }

    function setSelectedCash (obj) {
      $scope.state = 'generate';
      session.selectedCash = obj;
      cache.put('selectedCash', obj);
      fill();
    }

    function fill () {
      var request;

      request = {
        dateFrom : util.sqlDate(session.dateFrom),
        dateTo : util.sqlDate(session.dateTo),
        account_id : session.selectedCash.account_id
      };

      dependencies.records.query = '/reports/expense_report/?' + JSON.stringify(request);      
      validate.refresh(dependencies, ['records','currencies'])
      .then(prepareReport)
      .then(convert)
      .catch(function (err) {
       messenger.danger(err.toString());
      });
    }

    function prepareReport (model) { 
      session.model = model;
      //Currencies
      $scope.currencies = session.model.currencies;
      session.currency = SessionService.enterprise.currency_id;

    }

    $scope.setSelectedCash = setSelectedCash;
    $scope.fill = fill;

    $scope.print = function print() {
      window.print();
    };

   function reconfigure () {
      $scope.state = null;
      session.selectedCash = null;
      session.dateFrom = null;
      session.dateTo = null;
    }

    function convert (){
      session.sum_credit = 0;
      if(session.model.records.data) {   
        session.model.records.data.forEach(function (transaction) {
          if(transaction.service_txt === 'indirect_purchase'){
            transaction.primary_cash_uuid = transaction.document_uuid;
          } 
          session.sum_credit += exchange.convertir(transaction.credit, transaction.currency_id, session.currency, new Date()); // FIX ME : appstate return only the dailyexchange rate, it should be transaction.trans_date
        });        
      }
    }
    $scope.convert = convert;
    $scope.reconfigure = reconfigure;
  }
]);
