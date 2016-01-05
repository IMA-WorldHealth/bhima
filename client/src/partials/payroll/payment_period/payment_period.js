angular.module('bhima.controllers')
.controller('PaymentPeriodController', PaymentPeriodController);

PaymentPeriodController.$inject = [
  '$scope', '$translate', 'validate', 'messenger', 'connect',
  'appstate', 'uuid', 'util'
];

function PaymentPeriodController($scope, $translate, validate, messenger, connect, appstate, uuid, util){
	var dependencies = {},
		session = $scope.session = {};

	dependencies.config_rubric = {
		query : {
			tables : {
				config_rubric : { columns : ['id', 'label']}
			}
		}
	};

	dependencies.config_tax = {
		query : {
			tables : {
				config_tax : { columns : ['id', 'label']}
			}
		}
	};

  dependencies.config_cotisation = {
    query : {
      tables : {
        config_cotisation : { columns : ['id', 'label']}
      }
    }
  };

  dependencies.config_accounting = {
    query : {
      tables : {
        config_accounting : { columns : ['id', 'label']}
      }
    }
  };

	dependencies.paiement_period = {
		query : '/available_payment_period/'
	};

	function startup (models) {
      angular.extend($scope, models);
    }

	appstate.register('enterprise', function (enterprise) {
    $scope.enterprise = enterprise;
    validate.process(dependencies)
    .then(startup);
  });

  $scope.delete = function (period) {
    var result = confirm($translate.instant('PAYMENT_PERIOD.CONFIRM'));
    if (result) {
      connect.delete('config_paiement_period','paiement_period_id',period.id)
      .then(function (){
        connect.delete('paiement_period','id',period.id)
        .then(function () {
          $scope.paiement_period.remove(period.id);
          messenger.info($translate.instant('PAYMENT_PERIOD.DELETE_SUCCESS'));
        });
      });
    }
  };

  $scope.edit = function (period) {
    session.action = 'edit';
    session.edit = angular.copy(period);
    session.edit.dateFrom = new Date(session.edit.dateFrom);
    session.edit.dateTo = new Date(session.edit.dateTo);
    delete session.edit.RUBRIC;
    delete session.edit.TAX;
    delete session.edit.COTISATION;
    delete session.edit.ACCOUNT;
  };

  $scope.config = function (period) {
    session.action = 'config';
    session.config = angular.copy(period);
    session.weeks = [];
    getWeeks(session.config.id);
  };

  $scope.new = function () {
    session.action = 'new';
    session.new = {};
    session.new.dateFrom = new Date();
    session.new.dateTo = new Date();
  };

  $scope.save = {};

  $scope.save.edit = function () {
    var record = connect.clean(session.edit);
    delete record.reference;
    record.dateFrom = util.sqlDate(record.dateFrom);
    record.dateTo = util.sqlDate(record.dateTo);
    connect.put('paiement_period', [record], ['id'])
    .then(function () {
      messenger.success($translate.instant('PAYMENT_PERIOD.UPDATE_SUCCES'));
      $scope.paiement_period.put(record);
      session.action = '';
      session.edit = {};

      return validate.refresh(dependencies);
    })
    .then(startup);
  };

  $scope.save.new = function () {
    var record = connect.clean(session.new);
    record.dateFrom = util.sqlDate(record.dateFrom);
    record.dateTo = util.sqlDate(record.dateTo);
    connect.post('paiement_period', [record])
    .then(function () {
      messenger.success($translate.instant('PAYMENT_PERIOD.SAVE_SUCCES'));
      record.reference = generateReference();
      $scope.paiement_period.post(record);
      session.action = '';
      session.new = {};

      validate.refresh(dependencies)
      .then(startup);

    });
  };

  function generateReference () {
    var max = Math.max.apply(Math.max, $scope.paiement_period.data.map(function (o) { return o.reference; }));
    return Number.isNaN(max) ? 1 : max + 1;
  }

  function Week () {
    var self = this;
    this.paiement_period_id = session.config.id;
    this.weekFrom = null;
    this.weekTo = null;
    return this;
  }

  function getWeeks(paiement_period_id) {
    var weeks = {
      tables : {
        config_paiement_period : { columns : ['weekFrom','weekTo']}
      },
      where : ['config_paiement_period.paiement_period_id='+paiement_period_id]
    };

    connect.fetch(weeks)
    .then(function (model) {
      session.weeks = model;
      for(var i in session.weeks){
        session.weeks[i].paiement_period_id = paiement_period_id;
        session.weeks[i].weekFrom = new Date(session.weeks[i].weekFrom);
        session.weeks[i].weekTo = new Date(session.weeks[i].weekTo);
      }
    });
  }

  $scope.addWeek = function () {
    var week = new Week();
    session.weeks.push(week);
    return week;
  };

  $scope.removeWeek = function (index) {
    session.weeks.splice(index,1);
  };

  $scope.save.config = function () {
    var result = confirm($translate.instant('PAYMENT_PERIOD.CONFIRM'));
    var record = connect.clean(session.config);

    if (result && record.id && session.weeks.length) {
      if (isValidWeeks(session.weeks)) {
        connect.delete('config_paiement_period','paiement_period_id',record.id)
        .then(function(){
          insertConfigPaiementPeriod(angular.copy(session.weeks));
        });
      } else {
        messenger.danger($translate.instant('PAYMENT_PERIOD.WARNING_WEEK'));
      }

    }

    function insertConfigPaiementPeriod (data) {
      data.forEach(function (item) {
        item.weekFrom = util.sqlDate(item.weekFrom);
        item.weekTo = util.sqlDate(item.weekTo);
      });
      return connect.post('config_paiement_period', data).then(function(){
        messenger.success($translate.instant('PAYMENT_PERIOD.SAVE_SUCCES'));
      });
    }

    function isValidWeeks (weeks) {
      var r = false;
      for(var i in weeks){
        r = isInPeriod(weeks[i]);
        if (!r){
          break;
        } else {
          r = true;
        }
      }
      return r;
    }
  };

  function isInPeriod(week) {
    var r = false;
    if (util.sqlDate(week.weekFrom) >= util.sqlDate(session.config.dateFrom) && util.sqlDate(week.weekTo) <= util.sqlDate(session.config.dateTo) && util.sqlDate(week.weekFrom) <= util.sqlDate(week.weekTo)) {r = true;}
    else {r = false;}
    return r;
  }
}
