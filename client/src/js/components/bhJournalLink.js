const templateStr = `
  <a ui-sref="journal({ filters : [
    { key : 'record_uuid', value : $ctrl.recordUuid, displayValue: $ctrl.display },
    { key : 'includeNonPosted', value : '1' },
    { key : 'period', value : 'allTime' }
  ]})" ui-sref-opts='{ reload : false }'>
    <span translate>{{ $ctrl.display }}</span>
  </a>`;

angular.module('bhima.components')
  .component('bhJournalLink', {
    template : templateStr,
    bindings : { recordUuid : '<', display : '@' },
  });
