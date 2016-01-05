angular.module('bhima.controllers')
.controller('AccountsController', AccountsController);

AccountsController.$inject = [
  '$scope', 'validate', 'appstate', 'connect', '$translate',
  'liberror', 'messenger'
];

function AccountsController($scope, validate, appstate, connect, $translate, liberror, messenger) {
  var dependencies = {}, titleAccount = 3;
  var grid, columns, options, dataview, sortColumn = 'account_number';
  var session = $scope.session = { state: 'display' };

  var accountError = liberror.namespace('ACCOUNT');

  $scope.newAccount = {};
  $scope.editAccount = {};

  dependencies.account = {
    required : true,
    query : {
      identifier : 'account_number',
      tables : {
        account : { columns : ['id', 'account_number', 'account_txt', 'account_type_id', 'cc_id', 'pc_id', 'is_asset', 'is_ohada', 'parent', 'locked', 'reference_id', 'is_brut_link', 'is_used_budget', 'classe', 'is_charge'] },
        account_type : { columns : ['type::account_type'] }
      },
      join: [ 'account.account_type_id=account_type.id' ]
    }
  };

  dependencies.references = {
    query : {
      identifier : 'id',
      tables : {
        reference : { columns : ['id', 'ref', 'text', 'position', 'reference_group_id', 'section_resultat_id', 'is_report'] }
      }
    }
  };

  dependencies.costCenter = {
    query : {
      tables : {
        cost_center : { columns : ['id', 'text'] },
        project     : { columns : ['abbr']}
      },
      join : ['cost_center.project_id=project.id']
    }
  };

  dependencies.profitCenter = {
    query : {
      tables : {
        profit_center : { columns : ['id', 'text'] },
        project       : { columns : ['abbr']}
      },
      join : ['profit_center.project_id=project.id']
    }
  };

  dependencies.accountType = {
    query : {
      tables : {
        account_type : { columns : ['id', 'type'] }
      }
    }
  };

  appstate.register('enterprise', loadEnterprise);

  function loadEnterprise(enterprise) {
    $scope.enterprise = enterprise;
    validate.process(dependencies).then(manageAccount);
  }

  function manageAccount(model) {
    $scope.model = model;
    sortAccountList(model.account.data);
  }

  function submitAccount(account) {
    //kill if account exists for now
    if ($scope.model.account.get(account.number)) {
      return accountError.throw('ERR_ACCOUNT_EXISTS', account.number);
    }

    //format account
    var classe = account.number.substr(0,1);

    var formatAccount = {
      account_type_id: account.type.id,
      account_number: account.number,
      account_txt: account.title,
      is_asset: account.is_asset,
      is_ohada: account.is_ohada,
      is_charge : account.is_charge,
      is_used_budget: account.is_used_budget,
      cc_id   : account.cc_id,
      pc_id   : account.pc_id,
      enterprise_id: appstate.get('enterprise').id,
      parent: account.parent,
      classe: account.number.substr(0,1),
      reference_id : account.reference_id,
      is_brut_link : account.is_brut_link
    };

    connect.post('account', [formatAccount])
    .then(refreshAccountList)
    .then(function () {
      messenger.success($translate.instant('CONFIG_ACCOUNTING.SAVE_SUCCES'));
      $scope.newAccount = {};
      session.state = 'display';
    });
  }

  function updateState(newState) {
    session.state = newState;
  }

  function formatCenter (c) {
    return '' + c.text;
  }

  $scope.discareCC = function () {
    $scope.newAccount.cc_id = null;
  };

  $scope.discarePC = function () {
    $scope.newAccount.pc_id = null;
  };

  $scope.getAccount = function (account) {
    $scope.editAccount = null;
    session.state = 'edit';
    $scope.editAccount = account;
  };

  $scope.format = function format(account) {
    return [account.account_number, account.account_txt].join(' :: ');
  };

  $scope.formatRef = function formatRef(reference) {
    return [reference.ref, reference.text].join(' :: ');
  };

  function submitEditAccount (account) {
    /**
      * Only account of 'income/expense' type have cc_id or pc_id
      * Only account of 'title' type have is_asset
    */

    $scope.editAccount.is_brut_link = ($scope.editAccount.is_brut_link)?1:0;
    $scope.editAccount.is_used_budget = ($scope.editAccount.is_used_budget)?1:0;

    var update = {
      id              : account.id,
      account_txt     : $scope.editAccount.account_txt,
      is_asset        : $scope.editAccount.is_asset,
      is_ohada        : $scope.editAccount.is_ohada,
      is_used_budget  : $scope.editAccount.is_used_budget,
      locked          : $scope.editAccount.locked,
      cc_id           : $scope.editAccount.cc_id,
      pc_id           : $scope.editAccount.pc_id,
      is_charge       : $scope.editAccount.is_charge,
      parent          : $scope.editAccount.parent,
      reference_id    : $scope.editAccount.reference_id,
      is_brut_link    : $scope.editAccount.is_brut_link
    };

    connect.put('account', [update], ['id'])
    .then(refreshAccountList)
    .then(function () {
      messenger.success($translate.instant('CONFIG_ACCOUNTING.UPDATE_SUCCES'));
      $scope.editAccount = {};
      session.state = 'display';
    });
  }

  function refreshAccountList () {
    validate.refresh(dependencies, ['account'])
    .then(manageAccount);
  }

  function sortAccountList (data) {
    data.sort(function (a, b) {
      return String(a.account_number) >= String(b.account_number) ? 1 : -1;
    });
  }

  $scope.updateState = updateState;
  $scope.submitAccount = submitAccount;
  $scope.formatCenter = formatCenter;
  $scope.submitEditAccount = submitEditAccount;
}
