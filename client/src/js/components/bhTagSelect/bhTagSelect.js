angular.module('bhima.components')
  .component('bhTagSelect', {
    templateUrl : 'js/components/bhTagSelect/bhTagSelect.html',
    controller  : TagSelectController,
    transclude  : true,
    bindings    : {
      tagUuids      : '<',
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
        if ($ctrl.tagUuids.length) {
          const givenTags = $ctrl.tagUuids.map(e => e.uuid);
          $ctrl.tags = tags.filter(e => givenTags.includes(e.uuid) === false);
        } else {
          $ctrl.tags = tags;
        }
      })
      .catch(Notify.handleError);
  }
}
