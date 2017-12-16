var templateStr =
  '<a ui-sref="journal({ filters : [{ key : \'record_uuid\', value : $ctrl.recordUuid, displayValue: $ctrl.display }] })" ui-sref-opts="{ reload : false }">' +
    '<span translate>{{ $ctrl.display }}</span>' +
  '</a>';

angular.module('bhima.components')
  .component('bhJournalLink', {
    template : templateStr,
    bindings : { recordUuid : '<', display : '@' },
  });

