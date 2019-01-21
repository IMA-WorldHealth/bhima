angular.module('bhima.components')
  .component('bhRecordTypeahead', {
    templateUrl : 'modules/templates/bhRecordTypeahead.html',
    controller  : bhRecordTypeaheadController,
    bindings    : {
      recordUuid : '<?',
      onSelectCallback : '&',
      disabled : '<?',
    },
  });

bhRecordTypeaheadController.$inject = [
  'FindReferenceService', 'NotifyService',
];

function bhRecordTypeaheadController(FindReferences, Notify) {
  const $ctrl = this;

  $ctrl.$onInit = () => {
    if ($ctrl.recordUuid) {
      fetchRecordByUuid($ctrl.recordUuid);
    }
  };

  function fetchRecordByUuid(uuid) {
    FindReferences.read(uuid)
      .then(record => { $ctrl.record = record; })
      .catch(Notify.handleError);
  }

  $ctrl.$onChanges = changes => {
    const recordUuid = changes.recordUuid && changes.recordUuid.currentValue;
    if (recordUuid) {
      fetchRecordByUuid(recordUuid);
    }
  };

  $ctrl.lookupRecords = (text) => {
    if (text.length < 3) { return null; }
    return FindReferences.read(null, { text, limit : 10 });
  };

  $ctrl.onSelectRecord = record => {
    $ctrl.onSelectCallback({ record });
  };
}
