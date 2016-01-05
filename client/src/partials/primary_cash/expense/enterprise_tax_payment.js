angular.module('bhima.controllers')
.controller('primary_cash.enterprise_tax_payment', [
  '$scope',
  '$routeParams',
  '$translate',
  '$http',
  'messenger',
  'validate',
  'appstate',
  'appcache',
  'connect',
  'util',
  'exchange',
  '$q',
  'uuid',
  'SessionService',
  function ($scope, $routeParams, $translate, $http, messenger, validate, appstate, Appcache, connect, util, exchange, $q, uuid, Session) {
    var dependencies = {},
        cache = new Appcache('enterprise_tax_payment'),
        session = $scope.session = {
          configured : false, 
          complete : false, 
          data : {},
          rows : []
        };

    session.cashbox = $routeParams.cashbox;

    dependencies.cash_box = {
      required : true,
      query : {
        tables : {
          'cash_box_account_currency' : {
            columns : ['id', 'currency_id', 'account_id']
          },
          'currency' : {
            columns : ['symbol', 'min_monentary_unit']
          },
          'cash_box' : {
            columns : ['id', 'text', 'project_id']
          }
        },
        join : [
          'cash_box_account_currency.currency_id=currency.id',
          'cash_box_account_currency.cash_box_id=cash_box.id'
        ],
        where : [
          'cash_box_account_currency.cash_box_id=' + session.cashbox
        ]
      }
    };

    dependencies.paiement_period = {
      query : {
        tables : {
          'paiement_period' : {
            columns : ['id', 'config_tax_id', 'config_rubric_id', 'label', 'dateFrom', 'dateTo']
          }
        }
      }
    };

    appstate.register('project', function (project) {
      $scope.project = project;               
        validate.process(dependencies, ['paiement_period', 'cash_box'])
        .then(init, function (err) {
          messenger.danger(err.message + ' ' + err.reference);
        });     
    });

    function init (model) {
      session.model = model;
      cache.fetch('paiement_period')
      .then(function (pp) {
        if(!pp){
          // throw new Error('period paiement not defined');
          // A FIXE : ASTUCE POUR NE PAS AFFICHER LE MESSAGE D'ERREUR ET NE RIEN AFFICHER         
          session.pp = {};
          session.pp.id = -1;
        }else{
          session.pp = pp; 
          session.pp_label = formatPeriod (pp);
        }
        
        dependencies.enterprise_payment = {
          query : '/getEnterprisePayment/' + session.pp.id
        };
        
        return validate.process(dependencies, ['enterprise_payment']);
      })
      .then(function (model) {
        session.model = model;
        session.configured = (session.pp.id > 0) ? true : false ;
        session.complete = true;
        session.available = (session.model.enterprise_payment.data.length > 0) ? true : false ;
      })
      .catch(function (err) {
        console.log('err', err);
        messenger.danger(err.message);
      });
    }

    function reconfigure() {
      cache.remove('paiement_period');
      session.pp = null;
      session.configured = false;
      session.complete = false;
      session.available = false;
      session.pp_label = '';
    }

    function formatPeriod (pp) {
      return [pp.label, util.sqlDate(pp.dateFrom), util.sqlDate(pp.dateTo)].join(' / ');
    }

    function setConfiguration (pp) {
      if(pp){
        cache.put('paiement_period', pp)
        .then(function () {
          session.pp = pp;
          session.configured = true;
          session.complete = true;
          session.available = true;
          init(session.model);
        });
      }            
    }

    function getCashAccountID (currency_id) {
      return session.model.cash_box.data.filter(function (item) {
        return item.currency_id === currency_id;
      })[0].account_id;
    }

    function submit (emp) {
      var document_uuid = uuid();

      var primary = {
        uuid          : uuid(),
        project_id    : $scope.project.id,
        type          : 'S',
        date          : util.sqlDate(new Date()),
        deb_cred_uuid : emp.creditor_uuid,
        deb_cred_type : 'C',
        account_id    : emp.other_account,
        currency_id   : emp.currency_id,
        cost          : emp.value,
        user_id       : Session.user.id,
        description   : 'Enterprise Tax Payment ' + '(' + emp.label + ') : ' + emp.name + emp.postnom,
        cash_box_id   : session.cashbox,
        origin_id     : 7
      };

      var primary_details = {
        uuid              : uuid(),
        primary_cash_uuid : primary.uuid,
        debit             : 0,
        credit            : primary.cost,
        inv_po_id         : emp.paiement_uuid,
        document_uuid     : document_uuid
      };

      var other = {
        tax_id : emp.tax_id
      };

      var packet = {
        primary : primary,
        primary_details : primary_details,
        other : other
      };

      $http.post('payTax/', packet)
      .then(function (res){
         // A FIXE : Using $http instead connect
        var formatObject = {
          table : 'tax_paiement',
          paiement_uuid : emp.paiement_uuid,
          tax_id : emp.tax_id
        };
        return $http.put('/setTaxPayment/', formatObject)
        .success(function (res) {
          emp.posted = 1;
          console.log('Update Tax Payment success');
        });
      });
    }

    $scope.formatPeriod = formatPeriod;
    $scope.reconfigure = reconfigure;
    $scope.submit = submit;
    $scope.setConfiguration = setConfiguration;
  }
]);
