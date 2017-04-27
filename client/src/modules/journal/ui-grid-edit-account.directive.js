angular.module('bhima.directives')
  .directive('uiGridEditAccount', uiGridEditAccount);

uiGridEditAccount.$inject = ['uiGridEditConstants', 'AccountService', 'uiGridConstants', '$timeout'];

function uiGridEditAccount(uiGridEditConstants, Accounts, uiGridConstants, $timeout) {
  return {
    restrict : 'A',
    template : function () {
      var templ =
        '<div style="display: table; margin-right: auto; margin-left: auto; width:95%">' +
        '  <input type="text" autofocus ' +
        '    style="width:100%" ' +
        '    ng-model="accountInputValue" ' +
        '    uib-typeahead="account.id as account.hrlabel for account in accounts | filter:{\'hrlabel\':$viewValue} | limitTo:8" ' +
        '    typeahead-min-length="0" ' +
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
            $scope.accountInputValue = '';

            if (uiGridCtrl.grid.api.cellNav) {
              uiGridCtrl.grid.api.cellNav.on.navigate($scope, function (newRowCol, oldRowCol) {
                $scope.stopEdit();
              });
            } else {
              angular.element(document.querySelectorAll('.ui-grid-cell-contents')).on('click', onCellClick);
            }

            $timeout(focusTypeaheadInput, 50);
            angular.element(window).on('click', onWindowClick);
          });

          function focusTypeaheadInput() {
            var $input = $elm.querySelectorAll('input')[0];
            $input.focus();
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

