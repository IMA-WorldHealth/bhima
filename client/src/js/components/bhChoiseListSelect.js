angular.module('bhima.components')
  .component('bhChoiseListSelect', {
    templateUrl : 'modules/templates/bhChoiseListSelect.tmpl.html',
    controller  : ChoiseListController,
    transclude  : true,
    bindings    : {
      onSelectCallback : '&',
      list             : '<?',
      disable          : '<?',
      required         : '<?',
      listLabel        : '@?',
      isTitle          : '<?',
      isGroup          : '<?',
      parentId         : '<',
      groupLabel       : '<?',
    },
  });

ChoiseListController.$inject = ['ChoisesListManagementService', 'NotifyService'];

/**
 * Choise List
 */
function ChoiseListController(ChoisesList, Notify) {
  const $ctrl = this;

  $ctrl.$onInit = function onInit() {
    $ctrl.listLabel = $ctrl.listLabel || 'FORM.LABELS.PARENT';
    const query = {
      is_title : $ctrl.isTitle,
      is_group : $ctrl.isGroup,
      parent : $ctrl.parentId || null,
      group_label  : $ctrl.groupLabel || null,
    };

    ChoisesList.read(null, query)
      .then(lists => {
        $ctrl.lists = lists;
      })
      .catch(Notify.handleError);
  };

  $ctrl.$onChanges = (changes) => {
    if (changes.parentId && changes.parentId.currentValue) {
      $ctrl.parentId = parseInt(changes.parentId.currentValue, 10);

      const query = {
        is_title : $ctrl.isTitle,
        is_group : $ctrl.isGroup,
        parent : $ctrl.parentId || null,
        group_label  : $ctrl.groupLabel || null,
      };

      ChoisesList.read(null, query)
        .then(lists => {
          $ctrl.lists = lists;
        })
        .catch(Notify.handleError);
    }
  };


  $ctrl.onSelect = list => $ctrl.onSelectCallback({ list });
}
