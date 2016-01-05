angular.module('bhima.controllers')
.controller('taxes_management.ipr', TaxeIprController);

TaxeIprController.$inject = [
  '$scope', 'connect', 'appstate', 'messenger', 'validate', 'ipr',
  '$translate', 'SessionService'
];

function TaxeIprController ($scope, connect, appstate, messenger, validate, ipr, $translate, SessionService) {
	var session = $scope.session = {};
	session.show = 'crud';
	session.view = $translate.instant('TAXES.SEE_TABLE');

	var dependencies = {};
  dependencies.taxe_ipr = {
    query : '/taxe_ipr_currency/'
  };

  dependencies.currency = {
    query : {
      tables : {
        'currency' : { columns : ['id','symbol']}
      }
    }
  };

  // Startup
  startup();

  function startup () {
    $scope.enterprise = SessionService.enterprise;
    validate.process(dependencies)
    .then(initialize);
  }

  function initialize (models) {
    angular.extend($scope, models);

    var taxe_ipr_data = models.taxe_ipr.data;
    loadIprData(taxe_ipr_data);
    checkFirstCurrency(taxe_ipr_data);
  }

  function loadIprData(data) {
    ipr.calculate()
    .then(function (data) {
      session.table_ipr = data;
    });
  }

  function checkFirstCurrency (taxe_ipr_data) {
    if (taxe_ipr_data.length > 0) {
      session.currency_id = taxe_ipr_data[0].currency_id;
    }
  }

  $scope.delete = function (taxe_ipr) {
    var result = confirm($translate.instant('TAXES.CONFIRM'));
    if (result) {
      connect.delete('taxe_ipr', 'id', taxe_ipr.id)
      .then(function () {
        $scope.taxe_ipr.remove(taxe_ipr.id);
        messenger.info($translate.instant('TAXES.DELETE_SUCCESS'));
        session.action = '';
        session.edit = {};
        session.new = {};
      });
    }
  };

  $scope.edit = function (taxe_ipr) {
    session.action = 'edit';
    session.edit = angular.copy(taxe_ipr);
  };

  $scope.new = function () {
    session.action = 'new';
    session.new = {};
    session.show = 'crud';
    if (session.currency_id) {
      session.new.currency_id = session.currency_id;
    }
  };

  $scope.save = {};

  $scope.save.edit = function () {
    session.edit.tranche_mensuelle_debut = session.edit.tranche_annuelle_debut / 12;
    session.edit.tranche_mensuelle_fin = session.edit.tranche_annuelle_fin / 12;
    
    var record = connect.clean(session.edit);
    delete record.reference;
    delete record.symbol;
    connect.put('taxe_ipr', [record], ['id'])
    .then(function () {
      messenger.success($translate.instant('TAXES.UPDATE_SUCCES'));
      $scope.taxe_ipr.put(record);
      session.action = '';
      session.edit = {};
    });
  };

  $scope.save.new = function () {
    session.new.tranche_mensuelle_debut = session.new.tranche_annuelle_debut / 12;
    session.new.tranche_mensuelle_fin = session.new.tranche_annuelle_fin / 12;

    var record = connect.clean(session.new);
    connect.post('taxe_ipr', [record])
    .then(function () {
      messenger.success($translate.instant('TAXES.SAVE_SUCCES'));
      record.reference = generateReference();
      $scope.taxe_ipr.post(record);
      session.action = '';
      session.new = {};
    });
  };

  function generateReference () {
    var max = Math.max.apply(Math.max, $scope.taxe_ipr.data.map(function (o) { return o.reference; }));
    return Number.isNaN(max) ? 1 : max + 1;
  }

  $scope.toggleView = function () {
    if (session.show === 'tableau') {
      session.show = 'crud';
      session.view = $translate.instant('TAXES.SEE_TABLE');
    }
    else if (session.show === 'crud') {
      session.show = 'tableau';
      session.view = $translate.instant('TAXES.TOGGLE_VIEW');
    }
  };
}
