angular.module('bhima.controllers')
.controller('FiscalLockController', FiscalLockController);

FiscalLockController.$inject = [
  '$q', '$scope', '$http', '$route', '$translate', 'validate', 'connect', 'messenger', 'util', 'SessionService'
];

/**
  * Fiscal Lock Controller
  * This controller is responsible for locking a fiscal year
  */
function FiscalLockController ($q, $scope, $http, $route, $translate, validate, connect, messenger, util, Session) {
  var imports = $scope.$parent,
      session = $scope.session = {},
      editCache,
      dependencies = {};

  // imports shared functions
  var getSolde     = imports.getSolde,
      getTypeSolde = imports.getTypeSolde,
      error        = imports.error;

  // dependencies
  dependencies.fiscal = {
    query : {
      tables : {
        fiscal_year : { columns : ['id', 'number_of_months', 'fiscal_year_txt', 'transaction_start_number', 'transaction_stop_number', 'start_month', 'start_year', 'previous_fiscal_year', 'locked'] }
      }
    }
  };

  dependencies.resultatAccount = {
    query : {
      tables : {
        account : { columns : ['id', 'number', 'label'] }
      },
      where : ['account.classe=1', 'AND', 'is_ohada=1']
    }
  };

  dependencies.postingJournal = {
    query : {
      tables : {
        posting_journal : { columns : ['uuid'] }
      },
      where : ['posting_journal.fiscal_year_id=' + imports.selectedToLock]
    }
  };

  // Fire off the onload function for this controller
  onLoad();

  // Reload the controller on selection change
  $scope.$on('fiscal-year-selection-lock-change', onLoad);

  // Exposition to the view
  $scope.closeFiscalYear = closeFiscalYear;
  $scope.formatAccount = formatAccount;

  /**
    * This function is responsible for giving the result of the enterprise
    * loss or profit, and we use this result in the ui
    */
  function observation () {
    if ((session.produit - session.charge) > 0) {
      session.observation = 1;
    } else if ((session.produit - session.charge) < 0)  {
      session.observation = -1;
    } else {
      session.observation = 0;
    }
  }

  function sumCredMinusDeb (a, b) {
    return (b.credit_equiv - b.debit_equiv) + a;
  }

  function sumDebMinusCred (a, b) {
    return (b.debit_equiv - b.credit_equiv) + a;
  }

  function loadSolde (fy_id) {
    getTypeSolde(fy_id, 'INCOME_EXPENSE', 'CHARGE')
    .then(function (charge) {
      session.chargeData = charge.data;
      return getTypeSolde(fy_id, 'INCOME_EXPENSE', 'PRODUIT');
    })
    .then(function (produit) {
      session.produitData = produit.data;
    })
    .then(function () {
      session.charge = session.chargeData.reduce(sumDebMinusCred, 0);
      session.produit = session.produitData.reduce(sumCredMinusDeb, 0);
      observation();
    })
    .catch(error);
  }

  function closeFiscalYear (fy_id) {
    var res = confirm($translate.instant('FISCAL_YEAR.CONFIRM_CLOSING'));
    if (res) {
      var updateFY = { id : fy_id, locked : 1 };
      postingLockedFiscalYear(fy_id)
      .then(function () {
        connect.put('fiscal_year', [updateFY], ['id']);
      })
      .then(function () {
        messenger.success($translate.instant('FISCAL_YEAR.LOCKED_SUCCESS'), true);
      })
      .then(refresh)
      .catch(error);
    }
  }

  function postingLockedFiscalYear (fy_id) {
    var data = {
      new_fy_id : fy_id,
      user_id   : session.user_id,
      bundle  : {
        flag               : 'SIMPLE_LOCKING',
        resultat_account   : session.resultat_account,
        charge             : session.chargeData,
        produit            : session.produitData,
        fiscalYearLastDate : util.sqlDate(session.fiscalYearLastDate)
      }
    };

    return $http.post('/posting_fiscal_resultat/', { params:
      {
        new_fy_id : data.new_fy_id,
        user_id   : data.user_id,
        bundle    : data.bundle
      }
    });
  }

  function getFiscalYearLastDate (fy_id) {
    dependencies.period = {
      query : {
        tables : {
          period : { columns : ['period_start', 'period_stop'] }
        },
        where : ['period.fiscal_year_id='+fy_id]
      }
    };

    validate.refresh(dependencies, ['period'])
    .then(function (model) {
      session.fiscalYearLastDate = model.period.data[model.period.data.length-1].period_stop;
    })
    .catch(error);
  }

  function onLoad () {
    session.remainData = false;

    session.selectedToLock = imports.selectedToLock;
    dependencies.fiscal.query.where = ['fiscal_year.id=' + session.selectedToLock];
    validate.refresh(dependencies, ['fiscal', 'resultatAccount', 'postingJournal'])
    .then(function (models) {
      if(models.postingJournal.data.length > 0){
        session.message = $translate.instant('FISCAL_YEAR.POST_ALL_DATA');
        session.remainData = true;        
      }else{
        $scope.resultatAccount = models.resultatAccount;
        $scope.fiscal = models.fiscal.data[0];
        session.user_id = Session.user.id;
        // cache the fiscal year data for expected edits
        editCache = angular.copy($scope.fiscal);
      }
      
    })
    .then(loadSolde(session.selectedToLock))
    .then(getFiscalYearLastDate(session.selectedToLock))
    .catch(error);
  }

  function formatAccount (ac) {
    return '['+ac.number+'] => '+ac.label;
  }

  function refresh () {
    // TODO implement a fiscal year list refresh mechanism
    $route.reload();
  }

}
