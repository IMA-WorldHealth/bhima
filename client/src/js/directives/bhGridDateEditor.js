/** originally forked from https://github.com/Joiler/ui-grid-edit-datepicker */

angular.module('ui.grid.edit')
  .directive('uiGridEditDatepicker', uiGridEditDatePicker);

uiGridEditDatePicker.$inject = [
  '$timeout', 'uiGridConstants', 'uiGridEditConstants'
];

/**
 * @class uiGridEditDatePicker
 *
 * @description
 * This directive implements a datepicker editor for angular's ui-grid.
 */
function uiGridEditDatePicker($timeout, uiGridConstants, uiGridEditConstants) {
  return {
    template :
      '<input ' +
        'class="form-control" ' +
        'type="text" ' +
        'uib-datepicker-popup ' +
        'datepicker-options="datepickerOptions" ' +
        'datepicker-append-to-body="true"  ' +
        'show-button-bar="false" ' +
        'is-open="isOpen" ' +
        'ng-model="datePickerValue" ' +
        'ng-change="changeDate($event)"/>',
    require: ['?^uiGrid', '?^uiGridRenderContainer'],
    scope: true,
    compile: function () {
      return {
        post: function ($scope, $elm, $attrs, controllers) {

          // the original datepicker values
          var originalValue = new Date($scope.row.entity[$scope.col.field]);

          // bind datePickerValue to the correct value
          $scope.datePickerValue = new Date($scope.row.entity[$scope.col.field]);
          $scope.isOpen = true;
          $scope.datepickerOptions = { initDate : new Date() };


          var uiGridCtrl = controllers[0];
          var renderContainerCtrl = controllers[1];

          var onWindowClick = function (evt) {
            var classNamed = angular.element(evt.target).attr('class');
            if (classNamed) {
              var inDatepicker = (classNamed.indexOf('datepicker-calendar') > -1);
              if (!inDatepicker && evt.target.nodeName !== 'INPUT') {
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

          // @todo - make sure this actually gets cleaned up when $scope is destroyed!
          uiGridCtrl.grid.api.edit.on.cancelCellEdit($scope, function () {
            $scope.stopEdit();
          });

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

          $scope.stopEdit = function (evt) {
            $scope.row.entity[$scope.col.field] = $scope.datePickerValue;
            $scope.$emit(uiGridEditConstants.events.END_CELL_EDIT);
          };

          // Make sure that the edit is canceled on the ESC key.  The event is not
          // propogated by uib-datepicker-popup.
          // See: https://github.com/angular-ui/bootstrap/commit/000d6c309e7c2065576d535feaf6868ac06b75d0
          $scope.$watch('isOpen', function (isOpen) {
            if (!isOpen) {
              $timeout($scope.stopEdit, 0, false);
            }
          });

          // when we cancel the edit, we want to preserve the original value.
          function cancelEdit() {
            $scope.row.entity[$scope.col.field] = originalValue;
            $scope.$emit(uiGridEditConstants.events.CANCEL_CELL_EDIT);
          }

          // make sure we quit when we need to.
          function handleKeydown(evt) {
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
          }

          $elm.on('keydown', handleKeydown);

          $scope.$on('$destroy', function () {
            angular.element(window).off('click', onWindowClick);
            $('body > .dropdown-menu').remove();
            $elm.off('keydown', handleKeydown);
          });
        }
      };
    }
  };
}
