angular.module('bhima.components')
  .component('bhStockExitType', {
    templateUrl : 'modules/templates/bhStockEntryExitType.tmpl.html',
    controller : StockExitTypeController,
    bindings : {
      onSelectCallback : '&',
      reference : '<?',
      displayName : '<?',
      depot : '<?',
      reset : '<?', // when changes to true the component will be reset
    },
  })
  .component('bhStockEntryType', {
    templateUrl : 'modules/templates/bhStockEntryExitType.tmpl.html',
    controller : StockEntryTypeController,
    bindings : {
      onSelectCallback : '&',
      reference : '<?',
      displayName : '<?',
      depot : '<?',
      reset : '<?', // when changes to true the component will be reset
    },
  });

StockExitTypeController.$inject = ['StockEntryExitTypeService'];
StockEntryTypeController.$inject = ['StockEntryExitTypeService'];

/**
 * @function StockEntryTypeController
 *
 * @description
 * This is the stock entry type controller.
 */
function StockEntryTypeController(StockEntryExitTypes) {
  const $ctrl = this;
  const types = StockEntryExitTypes.entryTypes;

  $ctrl.$onInit = () => {
    reloadEntryTypes();
    $ctrl.isEntry = true;
  };

  $ctrl.$onChanges = function onChanges(changes) {
    if (changes.depot) {
      reloadEntryTypes();
    }

    if (changes.reset && changes.reset.currentValue) {
      reloadEntryTypes();
    }
  };

  $ctrl.getLabel = (type) => {
    if (!type) { return ''; }

    const hasDisplayLabel = (($ctrl.reference || $ctrl.displayName) && $ctrl.selectedType)
      && type.label === $ctrl.selectedType.label;

    if (hasDisplayLabel) {
      return $ctrl.display();
    }

    return type.descriptionKey;
  };

  $ctrl.display = () => {
    return $ctrl.reference || '';
  };

  $ctrl.isTypeSelected = (type) => angular.equals(type, $ctrl.selectedType);

  $ctrl.selectType = (type) => {
    $ctrl.selectedType = type;
    $ctrl.onSelectCallback({ type });
  };

  // reload entry/exit types
  function reloadEntryTypes() {
    delete $ctrl.selectedType;

    if (!$ctrl.depot) { return; }

    // get the final types by filtering on what is allowed in the depot
    $ctrl.types = types
      .filter(type => $ctrl.depot[type.allowedKey]);
    $ctrl.hasNoTypesDefined = ($ctrl.types.length === 0);
  }
}

/**
 * @function StockExitTypeController
 *
 * @description
 * This is the stock exit type controller.
 */
function StockExitTypeController(StockEntryExitTypes) {
  const $ctrl = this;
  const types = StockEntryExitTypes.exitTypes;

  $ctrl.$onInit = () => {
    reloadExitTypes();
    $ctrl.isEntry = false;
  };

  $ctrl.$onChanges = function onChanges(changes) {
    if (changes.depot) {
      reloadExitTypes();
    }

    if (changes.reset && changes.reset.currentValue) {
      reloadExitTypes();
    }
  };

  $ctrl.getLabel = (type) => {
    if (!type) { return ''; }

    const hasDisplayLabel = (($ctrl.reference || $ctrl.displayName) && $ctrl.selectedType)
      && type.label === $ctrl.selectedType.label;

    if (hasDisplayLabel) {
      return $ctrl.display();
    }

    return type.descriptionKey;
  };

  $ctrl.display = () => {
    const list = [];
    if ($ctrl.reference) {
      list.push($ctrl.reference);
    }

    if ($ctrl.displayName) {
      list.push($ctrl.displayName);
    }

    return list.join(' - ');
  };

  $ctrl.isTypeSelected = (type) => angular.equals(type, $ctrl.selectedType);

  $ctrl.selectType = (type) => {
    $ctrl.selectedType = type;
    $ctrl.onSelectCallback({ type });
  };

  // reload entry/exit types
  function reloadExitTypes() {
    delete $ctrl.selectedType;

    if (!$ctrl.depot) { return; }

    // get the final types by filtering on what is allowed in the depot
    $ctrl.types = types
      .filter(type => $ctrl.depot[type.allowedKey]);
    $ctrl.hasNoTypesDefined = ($ctrl.types.length === 0);
  }
}
