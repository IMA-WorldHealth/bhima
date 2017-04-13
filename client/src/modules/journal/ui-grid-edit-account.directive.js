angular.module('bhima.directives')
  .directive('uiGridEditAccount', uiGridEditAccount);

uiGridEditAccount.$inject = ['uiGridEditConstants', 'AccountService', 'uiGridConstants'];

function uiGridEditAccount(uiGridEditConstants, Accounts, uiGridConstants) {
  return {
    restrict : 'EA',
    template : function () {
      var templ =
        '<div style="display: table; margin-right: auto; margin-left: auto; width:95%">' +
        '  <input type="text"' +
        '    style="width:100%" ' +
        '    ng-model="accountInputValue" ' +
        '    uib-typeahead="account.id as account.hrlabel for account in accounts | filter:{\'hrlabel\':$viewValue} | limitTo:8" ' +
        '    ng-required="true"' +
        '    typeahead-editable ="false" ' +
        '    typeahead-on-select="setAccountOnRow(row.entity, $item)" />' +
        '</div>';

      return templ;
    },
    require : ['?^uiGrid', '?^uiGridRenderContainer'],
    scope   : true,
    compile : function () {
      return {
        post : function ($scope, $elm, $attrs, controllers) {
          var uiGridCtrl = controllers[0];
          var renderContainerCtrl = controllers[1];

          Accounts.read()
            .then(function (accounts) {
              $scope.accounts = Accounts.filterTitleAccounts(accounts);
              setInitialAccountValue();
            });

          // checks to see if a click landed in a dropdown menu - if so, it's probably the typeahead's.
          // if not, it is external and we should end the edit session
          var onWindowClick = function (evt) {
            var classNamed = angular.element(evt.target).attr('class');
            if (classNamed) {
              var isAccountTypeaheadElement = (classNamed.indexOf('dropdown-menu') > -1);
              if (!isAccountTypeaheadElement && evt.target.nodeName !== 'INPUT') {
                $scope.stopEdit(evt);
              }
            } else {
              $scope.stopEdit(evt);
            }
          };

          var onCellClick = function (evt) {
            angular.element(document.querySelectorAll('.ui-grid-cell-contents')).off('click', onCellClick);
            $scope.stopEdit(evt);
          };

          $scope.stopEdit = function(evt) {
            $scope.$emit(uiGridEditConstants.events.END_CELL_EDIT);
          };

          $scope.$on('$destroy', function () {
            angular.element(window).off('click', onWindowClick);
          });

          $scope.setAccountOnRow = function (row, account) {
            row.account_id = account.id;
            row.account_name = account.label;
            row.account_number = account.number;
          };

          $scope.$on(uiGridEditConstants.events.BEGIN_CELL_EDIT, function () {
            if (uiGridCtrl.grid.api.cellNav) {
              uiGridCtrl.grid.api.cellNav.on.navigate($scope, function (newRowCol, oldRowCol) {
                $scope.stopEdit();
              });
            } else {
              angular.element(document.querySelectorAll('.ui-grid-cell-contents')).on('click', onCellClick);
            }

            angular.element(window).on('click', onWindowClick);
          });

          function setInitialAccountValue() {
            var currentAccountId = $scope.row.entity.account_id;
            var accounts;
            var i;

            if ($scope.accounts) {
              i = $scope.accounts.length;
              accounts = $scope.accounts;
              while (i--) {
                if (accounts[i].id === currentAccountId) {
                  $scope.accountInputValue = accounts[i];
                  break;
                }
              }
            }
          }

          $elm.on('keydown', function(evt) {
            switch (evt.keyCode) {
              case uiGridConstants.keymap.ESC:
                evt.stopPropagation();
                $scope.$emit(uiGridEditConstants.events.CANCEL_CELL_EDIT);
                break;
            }

            if (uiGridCtrl && uiGridCtrl.grid.api.cellNav) {
              evt.uiGridTargetRenderContainerId = renderContainerCtrl.containerId;
              if (uiGridCtrl.cellNav.handleKeyDown(evt) !== null) {
                $scope.stopEdit(evt);
              }
            } else {
              switch (evt.keyCode) {
              case uiGridConstants.keymap.ENTER:
              case uiGridConstants.keymap.TAB:
                evt.stopPropagation();
                evt.preventDefault();
                $scope.stopEdit(evt);
                break;
              }
            }
            return true;
          });
        },
      };
    },
  };
}

