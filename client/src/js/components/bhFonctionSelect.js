angular.module('bhima.components')
  .component('bhFonctionSelect', {
    templateUrl : 'modules/templates/bhFonctionSelect.tmpl.html',
    controller  : FonctionSelectController,
    transclude  : true,
    bindings    : {
      fonctionId        : '<',
      onSelectCallback : '&',
    },
  });

FonctionSelectController.$inject = [
  'FunctionService', 'NotifyService',
];

/**
 * Fonction Select Controller
 *
 */
function FonctionSelectController(functions, Notify) {
  const $ctrl = this;

  $ctrl.$onInit = function onInit() {

    functions.read()
      .then((functions) => {
        $ctrl.functions = functions;
      })
      .catch(Notify.handleError);
  };

  // fires the onSelectCallback bound to the component boundary
  $ctrl.onSelect = function ($item, $model) {
    $ctrl.onSelectCallback({ fonction : $item });
  };
}
