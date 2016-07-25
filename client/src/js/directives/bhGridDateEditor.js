/** forked from https://github.com/Joiler/ui-grid-edit-datepicker */

var app = angular.module('ui.grid.edit');

app.directive('uiGridEditDatepicker', ['$timeout', '$document', 'uiGridConstants', 'uiGridEditConstants', function($timeout, $document, uiGridConstants, uiGridEditConstants) {
  return {
    template: function(element, attrs) {
      var html = '<div class="datepicker-wrapper"><input class="form-control" type="text" uib-datepicker-popup datepicker-append-to-body="true" show-button-bar="false" is-open="isOpen" ng-model="datePickerValue" ng-change="changeDate($event)"/></div>';
      return html;
    },
    require: ['?^uiGrid', '?^uiGridRenderContainer'],
    scope: true,
    compile: function() {
      return {
        pre: function($scope, $elm, $attrs) {

        },
        post: function($scope, $elm, $attrs, controllers) {
          var setCorrectPosition = function() {
            var gridElement = $('.ui-grid-viewport');
            var gridPosition = {
              width: gridElement.outerWidth(),
              height: gridElement.outerHeight(),
              offset: gridElement.offset()
            };

            var cellElement = $($elm);
            var cellPosition = {
              width: cellElement.outerWidth(),
              height: cellElement.outerHeight(),
              offset: cellElement.offset()
            };

            var datepickerElement = $('body > .dropdown-menu');
            var datepickerPosition = {
              width: datepickerElement.outerWidth(),
              height: datepickerElement.outerHeight()
            };

            var setCorrectTopPositionInGrid = function() {
              var topPosition;
              var freePixelsOnBottom = gridPosition.height - (cellPosition.offset.top - gridPosition.offset.top) - cellPosition.height;
              var freePixelsOnTop = gridPosition.height - freePixelsOnBottom - cellPosition.height;
              var requiredPixels = (datepickerPosition.height - cellPosition.height) / 2;
              if (freePixelsOnBottom >= requiredPixels && freePixelsOnTop >= requiredPixels) {
                topPosition = cellPosition.offset.top - requiredPixels + 10;
              } else if (freePixelsOnBottom >= requiredPixels && freePixelsOnTop < requiredPixels) {
                topPosition = cellPosition.offset.top - freePixelsOnTop + 10;
              } else {
                topPosition = gridPosition.height - datepickerPosition.height + gridPosition.offset.top - 20;
              }
              return topPosition;
            };

            var setCorrectTopPositionInWindow = function() {
              var topPosition;
              var windowHeight = window.innerHeight - 10;

              var freePixelsOnBottom = windowHeight - cellPosition.offset.top;
              var freePixelsOnTop = windowHeight - freePixelsOnBottom - cellPosition.height;
              var requiredPixels = (datepickerPosition.height - cellPosition.height) / 2;
              if (freePixelsOnBottom >= requiredPixels && freePixelsOnTop >= requiredPixels) {
                topPosition = cellPosition.offset.top - requiredPixels;
              } else if (freePixelsOnBottom >= requiredPixels && freePixelsOnTop < requiredPixels) {
                topPosition = cellPosition.offset.top - freePixelsOnTop;
              } else {
                topPosition = windowHeight - datepickerPosition.height - 10;
              }
              return topPosition;
            };


            var newOffsetValues = {};

            var isFreeOnRight = (gridPosition.width - (cellPosition.offset.left - gridPosition.offset.left) - cellPosition.width) > datepickerPosition.width;
            if (isFreeOnRight) {
              newOffsetValues.left = cellPosition.offset.left + cellPosition.width;
            } else {
              newOffsetValues.left = cellPosition.offset.left - datepickerPosition.width;
            }

            if (datepickerPosition.height < gridPosition.height) {
              newOffsetValues.top = setCorrectTopPositionInGrid();
            } else {
              newOffsetValues.top = setCorrectTopPositionInWindow();
            }

            datepickerElement.offset(newOffsetValues);
            datepickerElement.css('visibility', 'visible');
          };

          $timeout(function() {
            setCorrectPosition();
          }, 0);

          $scope.datePickerValue = new Date($scope.row.entity[$scope.col.field]);
          $scope.isOpen = true;
          var uiGridCtrl = controllers[0];
          var renderContainerCtrl = controllers[1];

          var onWindowClick = function (evt) {
            var classNamed = angular.element(evt.target).attr('class');
            if (classNamed) {
              var inDatepicker = (classNamed.indexOf('datepicker-calendar') > -1);
              if (!inDatepicker && evt.target.nodeName !== 'INPUT') {
                $scope.stopEdit(evt);
              }
            }
            else {
              $scope.stopEdit(evt);
            }
          };

          var onCellClick = function (evt) {
            angular.element(document.querySelectorAll('.ui-grid-cell-contents')).off('click', onCellClick);
            $scope.stopEdit(evt);
          };

          $scope.changeDate = function (evt) {
            $scope.row.entity[$scope.col.field] = $scope.datePickerValue;
            $scope.stopEdit(evt);
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

          $scope.$on('$destroy', function () {
            angular.element(window).off('click', onWindowClick);
            $('body > .dropdown-menu').remove();
          });

          $scope.stopEdit = function(evt) {
            $scope.$emit(uiGridEditConstants.events.END_CELL_EDIT);
          };

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
        }
      };
    }
  };
}]);
