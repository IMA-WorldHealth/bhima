angular.module('bhima.directives')
.controller('bhimaNavController', NavigationController)
.directive('bhimaNav', navigation);

NavigationController.$inject = ['$location', 'Tree'];
function NavigationController($location, Tree) { 
  var vm = this;

  /** @todo handle exception cases displayed at the top of the Tree directive */
  Tree.units()
    .then(function (result) { 
      vm.units = result;
    });

  vm.toggleUnit = function toggleUnit(unit) { 
    unit.open = unit.open || false;
    unit.open = !unit.open;
  }

  vm.navigate = function navigate(unit) { 

    // Clear previous selection if it exists
    if (vm.selectedUnit) { 
      vm.selectedUnit.selected = false;
    }
    
    // Update status of currently selected unit
    unit.selected = true;
    vm.selectedUnit = unit;
  
    $location.path(unit.path);
  }
}

function navigation() { 
  return { 
    restrict : 'E',
    scope : {},
    templateUrl : 'partials/templates/navigation.tmpl.html',
    controller : 'bhimaNavController as NavCtrl',
    bindToController : true
  };
}
