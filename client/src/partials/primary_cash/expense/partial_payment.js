angular.module('bhima.controllers')
.controller('primary_cash.partial_payment', [
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
        state = $scope.state,
        cache = new Appcache('salary_payment'),
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

    dependencies.currencies = {
      query : {
        tables : {
          'currency' : {
            columns : ['id', 'name', 'symbol']
          }
        }
      }
    };
    validate.process(dependencies, ['currencies'])
    .then(function (model) {
      var currencies = $scope.currencies = model.currencies;
    });

    appstate.register('project', function (project) {
      $scope.project = project;
        validate.process(dependencies, ['paiement_period', 'cash_box'])
        .then(init, function (err) {
          messenger.danger(err.message + ' ' + err.reference);
        });
    });

    function init (model) {
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

        connect.fetch('/reports/employeePaiement/?id=' + session.pp.id)
        .then(function (data) {
          session.partialSalary = data;
          session.configured = (session.pp.id > 0) ? true : false ;
          session.complete = true;
          session.available = (session.partialSalary) ? true : false ;
        })
        .catch(function (err) {
          messenger.danger('An error occured:' + JSON.stringify(err));
        });


      dependencies.salary_payment = {
          query : {
            tables : {
              employee : { columns : ['code', 'prenom', 'postnom', 'name', 'creditor_uuid'] },
              paiement : { columns : ['uuid', 'currency_id', 'net_before_tax', 'net_after_tax', 'net_salary', 'is_paid'] }
            },
            join : ['paiement.employee_id=employee.id'],
            where : ['paiement.paiement_period_id='+ session.pp.id]
          }
        };

        return validate.refresh(dependencies, ['salary_payment']);
      })
      .then(function (model) {
        session.model = model;
        session.configured = (session.pp.id > 0) ? true : false ;
        session.complete = true;
        session.available = (session.model.salary_payment.data.length > 0) ? true : false ;
      })
      .catch(function (err) {
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
      $scope.state = 'generate';
      var employee = $scope.employee = emp;  
    }

    function cash (emp) {
      var document_uuid = uuid(),
        currentDate = util.sqlDate(new Date()),
        amount_enterprise = 0,
        verification = 0, 
        primary = {}, 
        partial_paiement = {},   
        primary_details = {}, 
        packet = {};

      var net_salary = emp.net_salary.toFixed(2),
        amount_paid = 0;

      if(emp.amount){
        amount_paid = emp.amount.toFixed(2);
      }  

      var diff = net_salary - amount_paid;
      verification = diff - session.amount;

      if(verification > 0){
        $scope.state = null;
        primary = {
          uuid          : uuid(),
          project_id    : $scope.project.id,
          type          : 'S',
          date          : util.sqlDate(new Date()),
          deb_cred_uuid : emp.creditor_uuid,
          deb_cred_type : 'C',
          account_id    : emp.creditor_account,
          currency_id   : emp.currency_id,
          cost          : session.amount,
          user_id       : Session.user.id,
          description   : 'Salary Payment Partial ' + '(' + emp.name + emp.postnom + ') : ',
          cash_box_id   : session.cashbox,
          origin_id     : 6 //FIX ME : Find a way to generate it automatically
        };

        partial_paiement = {
          uuid              : uuid(),
          paiement_uuid     : emp.uuid,
          paiement_date     : currentDate,
          currency_id       : emp.currency_id,
          amount            : session.amount
        };

        primary_details = {
          uuid              : uuid(),
          primary_cash_uuid : primary.uuid,
          debit             : 0,
          credit            : primary.cost,
          inv_po_id         : emp.uuid, // uuid du paiement
          document_uuid     : document_uuid
        };

        packet = {
          primary          : primary,
          primary_details  : primary_details,
          partial_paiement : partial_paiement
        };

        connect.post('primary_cash', [packet.primary], ['uuid'])
        .then(function () {
          return connect.post('primary_cash_item', [packet.primary_details], ['uuid']);
        })
        .then(function () {
          var param = { uuid : emp.uuid, is_paid : 0 };
          return connect.put('paiement', [param], ['uuid'])
          .then(function () { validate.refresh(dependencies); });
        })
        .then(function () {
          return connect.post('partial_paiement', [packet.partial_paiement], ['uuid']);
        })
        .then(function () {
          return connect.fetch('/journal/salary_payment/' + packet.primary.uuid);
        })
        .then(function () {
          session.amount = null;
          init(session.model);
          messenger.success($translate.instant('PRIMARY_CASH.EXPENSE.SALARY_SUCCESS') + emp.prenom + ' ' + emp.name + ' ' + emp.postnom + ' reussi', true);
        })
        .catch(function (err){ console.log(err); });
      } else if (verification === 0){
        $scope.state = null;
        primary = {
          uuid          : uuid(),
          project_id    : $scope.project.id,
          type          : 'S',
          date          : util.sqlDate(new Date()),
          deb_cred_uuid : emp.creditor_uuid,
          deb_cred_type : 'C',
          account_id    : getCashAccountID(emp.currency_id),
          currency_id   : emp.currency_id,
          cost          : session.amount,
          user_id       : session.model.cashier.data.id,
          description   : 'Salary Payment Partial ' + '(' + emp.name + emp.postnom + ') : ',
          cash_box_id   : session.cashbox,
          origin_id     : 6 //FIX ME : Find a way to generate it automatically
        };

        partial_paiement = {
          uuid              : uuid(),
          paiement_uuid     : emp.uuid,
          paiement_date     : currentDate,
          currency_id       : emp.currency_id,
          amount            : session.amount
        };

        primary_details = {
          uuid              : uuid(),
          primary_cash_uuid : primary.uuid,
          debit             : 0,
          credit            : primary.cost,
          inv_po_id         : emp.uuid, // uuid du paiement
          document_uuid     : document_uuid
        };

        packet = {
          primary          : primary,
          primary_details  : primary_details,
          partial_paiement : partial_paiement
        };

        dependencies.advance = {
          required : true,
          query : {
            tables : {
              'rubric_paiement' : {
                columns : ['id', 'paiement_uuid', 'rubric_id', 'value']
              },
              'rubric' : {
                columns : ['is_advance']
              }
            },
            join : [
              'rubric.id=rubric_paiement.rubric_id'
            ],
            where : [
              'rubric_paiement.paiement_uuid=' + primary_details.inv_po_id, 'AND','rubric.is_advance = 1'
            ]
          }
        };

        connect.post('primary_cash', [packet.primary], ['uuid'])
        .then(function () {
          return connect.post('primary_cash_item', [packet.primary_details], ['uuid']);
        })
        .then(function () {
          var param = { uuid : emp.uuid, is_paid : 1 };
          return connect.put('paiement', [param], ['uuid'])
          .then(function () { validate.refresh(dependencies); });
        })
        .then(function () {
          return connect.post('partial_paiement', [packet.partial_paiement], ['uuid']);
        })
        .then(function () {
          return connect.fetch('/journal/salary_payment/' + packet.primary.uuid);
        })
       .then(function () {
          return validate.process(dependencies, ['advance']);
        })     
        .then(function (model) {
          if(model.advance.data.length){
            if(model.advance.data[0].value){
              return connect.fetch('/journal/advance_paiment/' + packet.primary_details.inv_po_id);
            } else {
              return;
            } 
          } else {
            return;
          }
        })        
        .then(function () {
          session.amount = null;
          init(session.model);
          messenger.success($translate.instant('PRIMARY_CASH.EXPENSE.SALARY_SUCCESS') + emp.prenom + ' ' + emp.name + ' ' + emp.postnom + ' reussi', true);
        })
        .catch(function (err){ console.log(err); });
      } else if (verification < 0) {
        messenger.danger($translate.instant('SALARY_PAYMENT.WARNING'));
      }
    }

    function reconfigure2 () {
      $scope.state = null;
    }

    appstate.register('enterprise', function (enterprise) {
      $scope.enterprise = enterprise;
    });

    $scope.reconfigure = reconfigure;
    $scope.formatPeriod = formatPeriod;
    $scope.reconfigure2 = reconfigure2;
    $scope.submit = submit;
    $scope.cash = cash;
    $scope.setConfiguration = setConfiguration;
  }
]);
