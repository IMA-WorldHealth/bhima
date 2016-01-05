angular.module('bhima.controllers')
.controller('primary_cash.salary_payment', [
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

          session.partialSalary.forEach(function (salary) {
            if(salary.is_paid){
              salary.net_salary_paid = 0;
            } else {
              salary.net_salary_paid = salary.net_salary - salary.amount;   
            }
            
          });

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
      var document_uuid = uuid();

      var primary = {
        uuid          : uuid(),
        project_id    : $scope.project.id,
        type          : 'S',
        date          : util.sqlDate(new Date()),
        deb_cred_uuid : emp.creditor_uuid,
        deb_cred_type : 'C',
        account_id    : emp.creditor_account,
        currency_id   : emp.currency_id,
        cost          : emp.net_salary_paid,
        user_id       : Session.user.id,
        description   : 'Salary Payment ' + '(' + emp.name + emp.postnom + ') : ',
        cash_box_id   : session.cashbox,
        origin_id     : 6 //FIX ME : Find a way to generate it automatically
      };

      var primary_details = {
        uuid              : uuid(),
        primary_cash_uuid : primary.uuid,
        debit             : 0,
        credit            : primary.cost,
        inv_po_id         : emp.uuid, // uuid du paiement
        document_uuid     : document_uuid
      };

      var packet = {
        primary : primary,
        primary_details : primary_details
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
        init(session.model);
        messenger.success($translate.instant('PRIMARY_CASH.EXPENSE.SALARY_SUCCESS') + emp.prenom + ' ' + emp.name + ' ' + emp.postnom + ' reussi', true);
      })
      .catch(function (err){ console.log(err); });
    }

    $scope.formatPeriod = formatPeriod;
    $scope.reconfigure = reconfigure;
    $scope.submit = submit;
    $scope.setConfiguration = setConfiguration;
  }
]);
