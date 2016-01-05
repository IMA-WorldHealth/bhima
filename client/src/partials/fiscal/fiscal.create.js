angular.module('bhima.controllers')
.controller('FiscalCreateController', FiscalCreateController);

FiscalCreateController.$inject = [
  '$q', '$scope', '$http', '$translate', 'validate', 'connect', 'messenger', 'util'
];

/**
  * Fiscal Create Controller
  */
function FiscalCreateController ($q, $scope, $http, $translate, validate, connect, messenger, util) {
  var data,
      imports = $scope.$parent,
      session = $scope.session = {},
      posting = $scope.posting = { rows : [] },
      dependencies = {};

  // Set up default option for year
  data = $scope.data = { year : 'true' };
  $scope.createWithoutClosing = false;

  // imports shared functions
  var getSolde     = imports.getSolde,
      getTypeSolde = imports.getTypeSolde,
      error        = imports.error;

  // module steps
  var steps = [
    {
      id : '1',
      key : 'FISCAL_YEAR.CREATE_YEAR_DETAILS'
    },
    {
      id : '2a',
      key : 'FISCAL_YEAR.CLOSE_NOTICE'
    },
    {
      id : '2b',
      key : 'FISCAL_YEAR.CREATE_OPENING_BALANCES'
    },
    {
      id : '2c',
      key : 'FISCAL_YEAR.CREATE_OPENING_SOLDE'
    },
    {
      id : '3',
      key : 'FISCAL_YEAR.CREATE_SUCCESS'
    }
  ];

  // expose methods and data to the $scope
  $scope.resetBalances = resetBalances;
  $scope.isFullYear = isFullYear;
  $scope.calculateEndDate = calculateEndDate;
  $scope.stepOne = stepOne;
  $scope.stepTwo = stepTwo;
  $scope.stepThree = stepThree;
  $scope.stepFour = stepFour;
  $scope.submitFiscalYearData = submitFiscalYearData;
  $scope.checkClosing = checkClosing;

  // dependencies
  dependencies.accounts = {
    query : {
      tables : {
        'account' : {
          columns : ['id', 'account_txt', 'account_number', 'parent']
        },
        'account_type' : {
          columns : ['type']
        }
      },
      join : ['account.account_type_id=account_type.id'],
      where : [['account_type.type=balance', 'OR', 'account_type.type=title'], 'AND']
    }
  };

  dependencies.resultatAccount = {
    query : {
      tables : {
        account : { columns : ['id', 'account_number', 'account_txt'] }
      },
      where : ['account.classe=1', 'OR', 'account.is_ohada=1']
    }
  };

  // returns true if the years array contains a
  // year with previous_fiscal_year matching the
  // year's id.
  function hasChild(year, years) {
    return years.some(function (otherYear) {
      return otherYear.previous_fiscal_year === year.id;
    });
  }

  // Make sure that only years without children show
  // up in the view for selection as previous_fiscal_year
  function filterParentYears() {
    // copy the fiscal year store from the parent
    var years = angular.copy(imports.fiscal.data);

    // filter out years that have children
    var childless = years.filter(function (year) {
      return !hasChild(year, years);
    });

    // expose the years to the view
    $scope.years = childless;
  }

  // fires on controller load
  function onLoad() {
    // filter years that are parents out of the selection
    // in the view
    filterParentYears();

    // Trigger step one
    stepOne();

    validate.process(dependencies)
    .then(function (models) {
      // sort the accounts based on account number
      sortAccounts(models.accounts);

      // add account depth onto the account list
      // parseAccountDepth(models.accounts);

      // loads the accounts and exposes to the view
      angular.extend($scope, models);

      // get user id
      session.user_id = imports.user.id;

      //get project
      session.project_id = imports.project.id;


      // initialise account balances
      resetBalances();
    })
    .catch(error);
  }

  // set the account balance to 0 for all accounts
  function resetBalances() {
    $scope.accounts.data.forEach(function (row) {
      // make account_number a string to sort properly
      row.account_number = String(row.account_number);
      row.debit = 0;
      row.credit = 0;
    });
  }

  // sorts accounts based on account_number (string)
  function sortAccounts(accountModel) {
    var data = accountModel.data;

    data.sort(function (a, b) {
      var left = String(a.account_number), right = String(b.account_number);
      return (left === right) ? 0 : (left > right ? 1 : -1);
    });

    accountModel.recalculateIndex();
  }

  // adds acount depth into the equation
  function parseAccountDepth(accountModel) {
    accountModel.data.forEach(function (account) {
      var parent, depth = 0;
      parent = accountModel.get(account.parent);
      while (parent) {
        depth += 1;
        parent = accountModel.get(parent.parent);
      }
      account.depth = depth;
    });
  }

  // STEP 1: transitions module to create fiscal year details
  function stepOne() {
    $scope.step = steps[0];
  }

  // STEP 2: transitions module state to either
  //  1) import opening balances from a previous fiscal year
  //  2) create new opening balances
  function stepTwo() {
    var hasPreviousYear = angular.isDefined(data.previous_fiscal_year);
    if ($scope.data.start < $scope.data.end) {
      $scope.step = steps[hasPreviousYear ?  1 : 2];
      if (hasPreviousYear) {
        session.previous_fiscal_year = $scope.fiscal.get(data.previous_fiscal_year).fiscal_year_txt;
      }
    } else {
      var msg = $translate.instant('FISCAL_YEAR.DATE_ORDER_ERROR')
      .replace('%START%', util.htmlDate($scope.data.start))
      .replace('%END%', util.htmlDate($scope.data.end));
      messenger.error(msg);
    }

  }

  function checkClosing (close_fy, previous_fy_id) {
    if (close_fy) {
      stepThree(previous_fy_id);
    } else {
      $scope.createWithoutClosing = true;
      $scope.step = steps[2];
    }
  }

  // STEP 3: opening with resultat
  function stepThree(id) {
    var fy = getFiscalYear(id);
    session.previous_fiscal_year = fy.fiscal_year_txt;
    session.previous_fiscal_year_id = fy.id;

    getTypeSolde(fy.id, 'INCOME_EXPENSE', 'CHARGE')
    .then(function (charge) {
      session.chargeData = charge.data;
      return getTypeSolde(fy.id, 'INCOME_EXPENSE', 'PRODUIT');
    })
    .then(function (produit) {
      session.produitData = produit.data;
    })
    .then(function () {
      session.charge = session.chargeData.reduce(sumDebMinusCred, 0);
      session.produit = session.produitData.reduce(sumCredMinusDeb, 0);
      observation();
    })
    .then(getFiscalYearLastDate(session.previous_fiscal_year_id))
    .catch(error);

    // load view
    $scope.step = dialogCloseFY() ? steps[3] : steps[1];
  }

  function dialogCloseFY () {
    session.closeFY = confirm($translate.instant('FISCAL_YEAR.CONFIRM_CLOSING'));
    return session.closeFY;
  }

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

  function getFiscalYear(id) {
    return $scope.fiscal.get(id);
  }

  $scope.formatAccount = function formatAccount (ac) {
    return '['+ac.account_number+'] => '+ac.account_txt;
  };

  function postingNewFiscalYear () {
    submitFiscalYearData()
    .then(function (id) {
      var data = {
        new_fy_id : id,
        user_id   : session.user_id,
        bundle    : {
          flag             : 'CREATE_WITH_LOCKING',
          resultat_account : session.resultat_account,
          charge           : session.chargeData,
          produit          : session.produitData,
          dateStart        : util.sqlDate($scope.data.start),
          closedFYLastDate : util.sqlDate(session.fiscalYearLastDate)
        }
      };
      $http.post('/posting_fiscal_resultat/', { params:
        {
          new_fy_id : data.new_fy_id,
          user_id   : data.user_id,
          bundle    : data.bundle
        }
      })
      .catch(error);

    })
    .then(function () {
      // Setting previous fiscal yaer locked
      if (session.closeFY) {
        var updateFY = { id : session.previous_fiscal_year_id, locked : 1 };
        connect.put('fiscal_year', [updateFY], ['id']);
      }

    })
    .catch(error);
  }
  // END STEP 3

  // STEP 4: submits the year details
  function stepFour() {
    $scope.step = steps[4];
  }

  // returns true if the fiscal year is for 12 months
  function isFullYear() {
    return data.year === 'true';
  }

  // gets the end date of the fiscal year
  function calculateEndDate() {
    if (isFullYear()) {
      var start = data.start;
      if (start) {
        var ds = new Date(start);
        var iterate = new Date(ds.getFullYear() + 1, ds.getMonth() - 1);
        data.end = iterate;
      }
    }
  }

  // submits the fiscal year to the server all at once
  function submitFiscalYearData() {
    var def = $q.defer();
    var bundle = connect.clean(data);
    var hasPreviousYear = angular.isDefined(bundle.previous_fiscal_year);

    bundle.start = util.sqlDate(bundle.start);
    bundle.end = util.sqlDate(bundle.end);

    // if no previous fiscal year is selected, we must ship back
    // the opening balances for each account to be inserted into
    // period 0 on the server.
    if (!hasPreviousYear || $scope.createWithoutClosing) {
      bundle.balances = $scope.accounts.data
        .filter(function (account) {
          return account.type !== 'title' && (account.debit > 0 || account.credit > 0);
        })
        .map(function (account) {
          return { 'account_id' : account.id, 'debit' : account.debit, 'credit' : account.credit };
        });
    }

    // attach the enterprise id to the request
    bundle.enterprise_id = $scope.enterprise.id;

    // attach the user id to the request
    bundle.user_id = session.user_id;

    //attach project

    bundle.project_id = session.project_id;

    // attach the currency id to the request
    bundle.currency_id = $scope.enterprise.currency_id;

    if (hasPreviousYear) {
      // Not first Fiscal year
      // submit data the server
      postCreateFiscalYear();

    } else if (!hasPreviousYear || $scope.createWithoutClosing) {
      // First Fiscal year
      if (checkEquilibrium(bundle.balances)) {
        // submit data the server
        postCreateFiscalYear();

      } else {
        messenger.info($translate.instant('FISCAL_YEAR.ALERT_BALANCE'), true);
      }
    }

    function postCreateFiscalYear () {
      $http.post('/fiscal/create', bundle)
      .then(function (results) {
        stepFour();
        $scope.$emit('fiscal-year-creation', results.id);
        def.resolve(results.id);
      })
      .catch(error);
    }

    return def.promise;
  }

  function sumObjectProperty (objArray, property) {
    return objArray.reduce(function (a, b) {
      return a + b[property];
    }, 0);
  }

  function checkEquilibrium (objArray) {
    return (sumObjectProperty(objArray, 'debit') === sumObjectProperty(objArray, 'credit')) ? true : false;
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

  // force refresh of the page
  function forceRefresh() {
    // refresh the form
    data = $scope.data = { year : 'true' };

    // refresh the imports, in case the parent has
    // loaded new data
    imports = $scope.$parent;

    // refresh parent filter
    filterParentYears();

    stepOne();
  }

  // listen for refresh chime
  $scope.$on('fiscal-year-create-refresh', forceRefresh);

  // Expose
  $scope.postingNewFiscalYear = postingNewFiscalYear;
  $scope.enterprise = imports.enterprise;
  dependencies.accounts.query.where[2] = 'account.enterprise_id=' + $scope.enterprise.id;
  onLoad();
}
