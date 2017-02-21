angular.module('bhima.components')
  .component('bhInfo', {
    template :
      '<span ' +
      '  class="text-info fa fa-info-circle" ' +
      '  uib-popover-template="$ctrl.template" ' +
      '  popover-placement="right" ' +
      '  popover-append-to-body="true" ' +
      '  popover-trigger="\'mouseenter\'"> ' +
      '</span> ',
    bindings : {
      template  : '@',
      direction : '@',
    },
  });
