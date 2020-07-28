angular.module('bhima.components')
  .component('bhTagSelect', {
    templateUrl : 'js/components/bhTagSelect/bhTagSelect.html',
    controller  : TagSelectController,
    transclude  : true,
    bindings    : {
      tagUuids         : '<',
      onSelectCallback : '&',
      required         : '<?',
      label            : '@?',
    },
  });

TagSelectController.$inject = ['TagService', 'NotifyService'];

/**
 * Tag selection component
 */
function TagSelectController(Tags, Notify) {
  const $ctrl = this;

  $ctrl.$onInit = function onInit() {
    $ctrl.label = $ctrl.label || 'TAG.LABEL';
    $ctrl.tagUuids = $ctrl.tagUuids || [];
    loadTags();
  };

  // fires the onSelectCallback bound to the component boundary
  $ctrl.onChanges = () => {
    $ctrl.onSelectCallback({ tags : $ctrl.tagUuids });
    loadTags();
  };

  $ctrl.getTagColor = t => {
    return t ? { color : t.color, 'font-size' : '14px' } : null;
  };

  function loadTags() {
    Tags.read(null)
      .then(tags => {
        const identifiers = $ctrl.tagUuids.map(t => t.uuid);
        $ctrl.tags = $ctrl.tagUuids.length ? tags.filter(t => identifiers.includes(t.uuid) === false) : tags;
      })
      .catch(Notify.handleError);
  }
}
